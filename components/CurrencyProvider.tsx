"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  BASE_CURRENCY,
  currencyForCountry,
  currencyForLocale,
  currencyForTimeZone,
  isCurrencyCode,
  type CurrencyCode,
} from "@/lib/currency";

/** Where a manual pick is remembered across visits. */
const STORAGE_KEY = "ggt:currency";

/** Remembers an explicit choice. Storage being unavailable is not an error —
 *  the choice still applies to this page view. */
function persist(code: CurrencyCode) {
  try {
    window.localStorage.setItem(STORAGE_KEY, code);
  } catch {
    // Private browsing or blocked storage.
  }
}

type Rates = Partial<Record<CurrencyCode, number>>;

type CurrencyContextValue = {
  /** The currency prices are currently displayed in. */
  currency: CurrencyCode;
  /** AUD → `currency` rate, or `null` when prices must render in AUD. */
  rate: number | null;
  /** Manual override; persists and wins over detection from then on. */
  setCurrency: (code: CurrencyCode) => void;
  /** True once rates have loaded and a currency other than AUD is possible. */
  switchable: boolean;
  /** Upstream publish time, for the "rate as of" note. */
  asOf: string | null;
};

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: BASE_CURRENCY,
  rate: null,
  setCurrency: () => {},
  switchable: false,
  asOf: null,
});

export function useCurrency() {
  return useContext(CurrencyContext);
}

/**
 * Resolves and applies the visitor's display currency.
 *
 * Two rules shape this component:
 *
 * 1. **The first render is always AUD.** Detection and rate loading happen in
 *    effects, after paint, so nothing about currency can delay a price from
 *    appearing. The server-rendered HTML is the same AUD markup the site shipped
 *    before this feature existed; converted prices swap in a moment later.
 * 2. **Every failure lands on AUD.** No stored pick, unknown country, rates
 *    unreachable, rates stale, currency missing from the payload — all of them
 *    resolve to AUD rather than to a number we can't stand behind.
 */
export default function CurrencyProvider({
  initialCountry,
  children,
}: {
  /** Country from the edge header, resolved server-side. */
  initialCountry?: string | null;
  children: React.ReactNode;
}) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(BASE_CURRENCY);
  const [rates, setRates] = useState<Rates | null>(null);
  const [asOf, setAsOf] = useState<string | null>(null);

  // Detection, weakest signal last: an explicit past choice, then the edge
  // header, then the machine's timezone, then its language. Runs once, after
  // hydration, so the client's first paint matches the server's AUD markup.
  //
  // Timezone sits above language because language is routinely wrong about
  // location — an `en-US` browser in Manila is a default Windows install, not a
  // visitor in the United States. The header is absent in local dev, which is
  // why timezone carries detection entirely on `next dev`.
  useEffect(() => {
    // `?currency=PHP` forces a currency outright. Detection depends on machine
    // settings that are awkward to change and impossible to fake in local dev
    // — the UTC+8 band in particular can't distinguish Manila from Singapore —
    // so this gives testing a deterministic handle. It also makes a shareable
    // link for campaigns aimed at one market.
    const requested = new URLSearchParams(window.location.search)
      .get("currency")
      ?.toUpperCase();
    if (isCurrencyCode(requested)) {
      setCurrencyState(requested);
      persist(requested);
      return;
    }

    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      // Private browsing or blocked storage — detection still works.
    }

    if (isCurrencyCode(stored)) {
      setCurrencyState(stored);
      return;
    }

    let zone: string | null = null;
    try {
      zone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? null;
    } catch {
      // Locked-down or ancient runtime — fall through to language.
    }

    const detected =
      currencyForCountry(initialCountry) ??
      currencyForTimeZone(zone) ??
      currencyForLocale(
        typeof navigator !== "undefined" ? navigator.language : null,
      );
    if (detected) setCurrencyState(detected);
  }, [initialCountry]);

  // Rates load unconditionally so the picker works for everyone, including
  // visitors we resolved to AUD. The response is CDN-cached and tiny.
  useEffect(() => {
    let live = true;
    fetch("/api/rates")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { rates?: Rates | null; asOf?: string | null } | null) => {
        if (!live || !data?.rates) return;
        setRates(data.rates);
        setAsOf(data.asOf ?? null);
      })
      .catch(() => {
        // Rates unavailable — the site stays in AUD. Nothing to report.
      });
    return () => {
      live = false;
    };
  }, []);

  const setCurrency = useCallback((code: CurrencyCode) => {
    setCurrencyState(code);
    persist(code);
  }, []);

  const value = useMemo<CurrencyContextValue>(() => {
    const rate = currency === BASE_CURRENCY ? null : (rates?.[currency] ?? null);
    // A currency we can't convert is not a currency we display.
    const effective = currency !== BASE_CURRENCY && rate == null ? BASE_CURRENCY : currency;
    return {
      currency: effective,
      rate: effective === BASE_CURRENCY ? null : rate,
      setCurrency,
      switchable: rates != null,
      asOf,
    };
  }, [currency, rates, asOf, setCurrency]);

  return (
    <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
  );
}
