import "server-only";
import { isSupportedCurrency } from "./currency";

/**
 * Mid-market FX rates with AUD as the base. Used to (a) show a Wise-style
 * converted price at checkout and (b) compute the amount to charge when the
 * customer pays in their local currency. The exact rate used is persisted on the
 * order so the AUD tax invoice remains reproducible.
 *
 * Rates are fetched from FX_API_URL (default: open.er-api.com, free, base=AUD)
 * and cached in-process for a day. AUD→AUD is always 1.
 */
type RateTable = { rates: Record<string, number>; fetchedAt: number };

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
let cache: RateTable | null = null;

async function getRates(): Promise<RateTable> {
  if (cache && Date.now() - cache.fetchedAt < ONE_DAY_MS) return cache;

  const url = process.env.FX_API_URL ?? "https://open.er-api.com/v6/latest/AUD";
  const res = await fetch(url, { next: { revalidate: 60 * 60 * 12 } });
  if (!res.ok) throw new Error(`FX provider returned ${res.status}`);

  const data = (await res.json()) as { rates?: Record<string, number> };
  if (!data.rates || typeof data.rates !== "object") {
    throw new Error("FX provider response missing `rates`.");
  }

  cache = { rates: { AUD: 1, ...data.rates }, fetchedAt: Date.now() };
  return cache;
}

export type Conversion = {
  currency: string;
  /** Mid-market rate: 1 AUD = `rate` units of `currency`. */
  rate: number;
  /** The AUD amount converted into `currency` (major units, unrounded). */
  amount: number;
  capturedAt: string;
};

/**
 * Converts an AUD amount into the target currency at the current mid-market
 * rate. Returns rate === 1 for AUD. Throws for unsupported/unknown currencies.
 */
export async function convertAudTo(currency: string, aud: number): Promise<Conversion> {
  const code = currency.toUpperCase();
  if (code === "AUD") {
    return { currency: "AUD", rate: 1, amount: aud, capturedAt: new Date().toISOString() };
  }
  if (!isSupportedCurrency(code)) {
    throw new Error(`Unsupported currency: ${code}`);
  }

  const { rates } = await getRates();
  const rate = rates[code];
  if (!rate || rate <= 0) {
    throw new Error(`No FX rate available for ${code}.`);
  }

  return { currency: code, rate, amount: aud * rate, capturedAt: new Date().toISOString() };
}

/** Rate table for all supported currencies — for the checkout currency picker. */
export async function ratesForSupported(): Promise<Record<string, number>> {
  const { rates } = await getRates();
  const out: Record<string, number> = {};
  for (const code of Object.keys(rates)) {
    if (isSupportedCurrency(code)) out[code] = rates[code];
  }
  out.AUD = 1;
  return out;
}
