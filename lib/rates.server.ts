import "server-only";
import { CURRENCY_CODES, type CurrencyCode } from "./currency";

/**
 * Exchange rates, AUD-based.
 *
 * Source: ExchangeRate-API's open-access endpoint — no key, no signup, and it
 * accepts AUD as the base directly, so no cross-rate arithmetic is needed. It
 * refreshes once every 24 hours including weekends, which is why it's preferred
 * over the ECB-backed alternatives: those only publish on working days, and a
 * strict staleness check against ECB data would drop every visitor to AUD-only
 * from Friday evening to Monday.
 *
 * Fallback if this ever disappears: `https://api.frankfurter.dev/v1/latest?base=AUD`
 * (also keyless, also covers all nine currencies, weekday publishing only).
 */
const ENDPOINT = "https://open.er-api.com/v6/latest/AUD";

/** How long a cached response is served before we re-fetch. */
const CACHE_TTL_SECONDS = 12 * 60 * 60;

/**
 * How old upstream data may be before we refuse to convert at all.
 *
 * Converted figures are the headline price here, not a footnote, so a stale
 * rate is a wrong price rather than a slightly-off estimate. 48 hours absorbs
 * one missed daily publish without ever serving a number we can't stand behind.
 */
const MAX_DATA_AGE_MS = 48 * 60 * 60 * 1000;

/** Upstream is a background dependency; it never gets to hold a lambda open. */
const FETCH_TIMEOUT_MS = 2500;

/** Warm-lambda guard so repeat requests don't re-enter the fetch path. */
const MEMO_TTL_MS = 10 * 60 * 1000;

export type Rates = Partial<Record<CurrencyCode, number>>;

export type RatesPayload = {
  base: "AUD";
  /** `null` means "no usable rates" — callers must render AUD only. */
  rates: Rates | null;
  /** ISO timestamp of the upstream publish, or `null` when unusable. */
  asOf: string | null;
};

const UNAVAILABLE: RatesPayload = { base: "AUD", rates: null, asOf: null };

let memo: { at: number; payload: RatesPayload } | null = null;

type UpstreamResponse = {
  result?: string;
  base_code?: string;
  time_last_update_unix?: number;
  rates?: Record<string, unknown>;
};

/**
 * Returns AUD-based rates for the supported currencies, or a `rates: null`
 * payload when they can't be trusted. Never throws — every failure path is an
 * AUD-only site, which is a perfectly good outcome.
 */
export async function getRates(): Promise<RatesPayload> {
  if (memo && Date.now() - memo.at < MEMO_TTL_MS) return memo.payload;

  let payload = UNAVAILABLE;
  try {
    const res = await fetch(ENDPOINT, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      next: { revalidate: CACHE_TTL_SECONDS },
    });
    if (res.ok) {
      payload = parse((await res.json()) as UpstreamResponse);
    } else {
      console.warn(`getRates: upstream returned ${res.status}; showing AUD only.`);
    }
  } catch (err) {
    console.warn("getRates: fetch failed; showing AUD only –", err);
  }

  memo = { at: Date.now(), payload };
  return payload;
}

/**
 * Validates an upstream response into a payload. Anything unexpected — wrong
 * base, stale publish, a rate that isn't a positive finite number — collapses
 * the whole payload to unavailable rather than converting some currencies and
 * silently dropping others.
 */
function parse(body: UpstreamResponse): RatesPayload {
  if (body.result !== "success" || body.base_code !== "AUD" || !body.rates) {
    console.warn("getRates: unexpected upstream payload; showing AUD only.");
    return UNAVAILABLE;
  }

  const publishedMs = (body.time_last_update_unix ?? 0) * 1000;
  const age = Date.now() - publishedMs;
  if (!publishedMs || age > MAX_DATA_AGE_MS || age < 0) {
    console.warn("getRates: upstream data is stale; showing AUD only.");
    return UNAVAILABLE;
  }

  const rates: Rates = {};
  for (const code of CURRENCY_CODES) {
    if (code === "AUD") continue;
    const value = body.rates[code];
    if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
      console.warn(`getRates: missing or invalid rate for ${code}; showing AUD only.`);
      return UNAVAILABLE;
    }
    rates[code] = value;
  }

  return { base: "AUD", rates, asOf: new Date(publishedMs).toISOString() };
}
