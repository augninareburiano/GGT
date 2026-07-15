/**
 * Currency helpers shared by client and server. Prices in the app are authored
 * in AUD; customers may be charged in their local currency (Stripe presentment).
 * Stripe works in the smallest currency unit (minor units), so we centralise the
 * decimal handling here — including zero-decimal currencies like JPY.
 */

/** Currencies we offer at checkout. Configurable via SUPPORTED_CURRENCIES. */
const DEFAULT_CURRENCIES = ["AUD", "USD", "EUR", "GBP", "NZD", "CAD", "SGD", "JPY"];

export function supportedCurrencies(): string[] {
  const raw = process.env.SUPPORTED_CURRENCIES ?? process.env.NEXT_PUBLIC_SUPPORTED_CURRENCIES;
  const list = (raw ?? "")
    .split(",")
    .map((c) => c.trim().toUpperCase())
    .filter(Boolean);
  const merged = list.length ? list : DEFAULT_CURRENCIES;
  // AUD must always be offered (settlement + fallback currency).
  return merged.includes("AUD") ? merged : ["AUD", ...merged];
}

export function isSupportedCurrency(code: string): boolean {
  return supportedCurrencies().includes(code.toUpperCase());
}

/**
 * Currencies Stripe treats as zero-decimal (amount is already in whole units).
 * See https://stripe.com/docs/currencies#zero-decimal.
 */
const ZERO_DECIMAL = new Set([
  "BIF", "CLP", "DJF", "GNF", "JPY", "KMF", "KRW", "MGA", "PYG",
  "RWF", "UGX", "VND", "VUV", "XAF", "XOF", "XPF",
]);

export function isZeroDecimal(code: string): boolean {
  return ZERO_DECIMAL.has(code.toUpperCase());
}

/** Converts a major-unit amount (e.g. 12.50) to Stripe minor units (e.g. 1250). */
export function toMinorUnits(amount: number, code: string): number {
  return isZeroDecimal(code) ? Math.round(amount) : Math.round(amount * 100);
}

/** Converts Stripe minor units back to a major-unit number. */
export function fromMinorUnits(minor: number, code: string): number {
  return isZeroDecimal(code) ? minor : minor / 100;
}

/**
 * Formats an amount in the given currency for display, using the browser/Node
 * Intl formatter. Falls back to a plain string if the currency is unknown.
 */
export function formatCurrency(amount: number, code: string, locale?: string): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: code.toUpperCase(),
      maximumFractionDigits: isZeroDecimal(code) ? 0 : 2,
    }).format(amount);
  } catch {
    return `${code.toUpperCase()} ${amount.toFixed(isZeroDecimal(code) ? 0 : 2)}`;
  }
}
