/**
 * Display currencies.
 *
 * Every price in the codebase is stored and reasoned about in AUD — Firestore,
 * the enquiry payload, the emails and the JSON-LD all stay that way. This module
 * only changes what the *browser shows*: given an AUD amount and a live rate it
 * renders the equivalent with the right symbol, grouping and precision.
 *
 * AUD formatting deliberately routes back through `money()` so the default view
 * is byte-identical to what the site rendered before currencies existed.
 */

import { money } from "./money";

/**
 * Whether the real AUD price stays visible next to the converted total.
 *
 * Guests are charged in AUD by FareHarbor, so someone who only ever saw a
 * converted figure will see a different number on their card once their bank's
 * FX spread lands. This keeps the actual charged amount on the two surfaces
 * where the number becomes an obligation — the bill total and the enquiry
 * summary — and nowhere else. Set to `false` for converted-only display.
 */
export const SHOW_AUD_ON_TOTAL = true;

export type CurrencyCode =
  | "AUD"
  | "NZD"
  | "USD"
  | "GBP"
  | "EUR"
  | "SGD"
  | "PHP"
  | "JPY"
  | "CAD";

/** The currency every stored price is denominated in. */
export const BASE_CURRENCY: CurrencyCode = "AUD";

type CurrencyMeta = {
  /** Symbol as displayed. Written out rather than taken from `Intl`, whose
   *  narrow symbols collapse NZD/SGD/CAD/USD all down to a bare "$". */
  symbol: string;
  /** Locale used for digit grouping and decimal separators only. */
  locale: string;
  /** Symbol placement relative to the number. */
  position: "before" | "after";
  /** Human label for the picker. */
  label: string;
};

/**
 * The markets that plausibly book Sydney food tours.
 *
 * Amounts render at whole-unit precision across the board: the underlying AUD
 * prices are whole dollars, so trailing cents would be invented detail. The
 * error this introduces is under one currency unit.
 *
 * USD shows as "US$" rather than "$" on purpose — a bare "$" sitting next to
 * "A$" on the same page is genuinely ambiguous, and this site quotes both.
 */
export const CURRENCIES: Record<CurrencyCode, CurrencyMeta> = {
  AUD: { symbol: "A$", locale: "en-AU", position: "before", label: "Australian dollar" },
  NZD: { symbol: "NZ$", locale: "en-NZ", position: "before", label: "New Zealand dollar" },
  USD: { symbol: "US$", locale: "en-US", position: "before", label: "US dollar" },
  GBP: { symbol: "£", locale: "en-GB", position: "before", label: "British pound" },
  // Eurozone locales disagree on placement ("1.234 €" in de-DE, "€1,234" in
  // en-IE). One representation has to serve all of them; this is the form used
  // internationally and the one most legible to non-Europeans.
  EUR: { symbol: "€", locale: "en-IE", position: "before", label: "Euro" },
  SGD: { symbol: "S$", locale: "en-SG", position: "before", label: "Singapore dollar" },
  PHP: { symbol: "₱", locale: "en-PH", position: "before", label: "Philippine peso" },
  JPY: { symbol: "¥", locale: "ja-JP", position: "before", label: "Japanese yen" },
  CAD: { symbol: "CA$", locale: "en-CA", position: "before", label: "Canadian dollar" },
};

export const CURRENCY_CODES = Object.keys(CURRENCIES) as CurrencyCode[];

export function isCurrencyCode(v: unknown): v is CurrencyCode {
  return typeof v === "string" && v in CURRENCIES;
}

/**
 * ISO-3166 country → the currency a visitor there expects to see. Countries
 * absent from this map fall through to AUD, which is always a correct answer.
 */
const COUNTRY_TO_CURRENCY: Record<string, CurrencyCode> = {
  AU: "AUD",
  NZ: "NZD",
  US: "USD",
  GB: "GBP",
  SG: "SGD",
  PH: "PHP",
  JP: "JPY",
  CA: "CAD",
  // Eurozone members only — EU countries on their own currency (PL, SE, CZ, …)
  // are deliberately absent so they see AUD rather than a wrong-currency price.
  AT: "EUR",
  BE: "EUR",
  HR: "EUR",
  CY: "EUR",
  EE: "EUR",
  FI: "EUR",
  FR: "EUR",
  DE: "EUR",
  GR: "EUR",
  IE: "EUR",
  IT: "EUR",
  LV: "EUR",
  LT: "EUR",
  LU: "EUR",
  MT: "EUR",
  NL: "EUR",
  PT: "EUR",
  SK: "EUR",
  SI: "EUR",
  ES: "EUR",
};

/** Maps a two-letter country code to a supported currency, if we have one. */
export function currencyForCountry(country?: string | null): CurrencyCode | null {
  if (!country) return null;
  return COUNTRY_TO_CURRENCY[country.trim().toUpperCase()] ?? null;
}

/**
 * IANA timezone → country, for the zones covering our supported currencies.
 *
 * Timezone beats language as a location signal by a wide margin. A machine in
 * Manila or Singapore very often reports `en-US` — Windows ships that way — but
 * its clock is still set to the city it's sitting in. Anything unlisted falls
 * through to the language check and then to AUD.
 */
const ZONE_TO_COUNTRY: Record<string, string> = {
  "Pacific/Auckland": "NZ",
  "Pacific/Chatham": "NZ",
  "Asia/Manila": "PH",
  "Asia/Singapore": "SG",
  "Asia/Tokyo": "JP",
  "Europe/London": "GB",
  // United States
  "America/New_York": "US",
  "America/Detroit": "US",
  "America/Chicago": "US",
  "America/Denver": "US",
  "America/Phoenix": "US",
  "America/Los_Angeles": "US",
  "America/Anchorage": "US",
  "Pacific/Honolulu": "US",
  // Canada
  "America/St_Johns": "CA",
  "America/Halifax": "CA",
  "America/Moncton": "CA",
  "America/Toronto": "CA",
  "America/Winnipeg": "CA",
  "America/Regina": "CA",
  "America/Edmonton": "CA",
  "America/Vancouver": "CA",
  "America/Whitehorse": "CA",
  "America/Yellowknife": "CA",
  "America/Iqaluit": "CA",
  // Eurozone
  "Europe/Vienna": "AT",
  "Europe/Brussels": "BE",
  "Europe/Zagreb": "HR",
  "Asia/Nicosia": "CY",
  "Europe/Nicosia": "CY",
  "Europe/Tallinn": "EE",
  "Europe/Helsinki": "FI",
  "Europe/Paris": "FR",
  "Europe/Berlin": "DE",
  "Europe/Athens": "GR",
  "Europe/Dublin": "IE",
  "Europe/Rome": "IT",
  "Europe/Riga": "LV",
  "Europe/Vilnius": "LT",
  "Europe/Luxembourg": "LU",
  "Europe/Malta": "MT",
  "Europe/Amsterdam": "NL",
  "Europe/Lisbon": "PT",
  "Atlantic/Azores": "PT",
  "Atlantic/Madeira": "PT",
  "Europe/Bratislava": "SK",
  "Europe/Ljubljana": "SI",
  "Europe/Madrid": "ES",
  "Atlantic/Canary": "ES",
};

/**
 * Maps the browser's IANA timezone to a currency. `Australia/*` is matched by
 * prefix since every Australian zone means AUD regardless of state.
 */
export function currencyForTimeZone(zone?: string | null): CurrencyCode | null {
  if (!zone) return null;
  if (zone.startsWith("Australia/")) return "AUD";
  return currencyForCountry(ZONE_TO_COUNTRY[zone]);
}

/**
 * Maps a BCP-47 language tag to a currency via its region subtag — `en-PH`
 * gives PH. Tags without a region (`en`, `ja`) yield nothing, since language
 * alone says very little about where someone is.
 *
 * Weakest of the three signals, and last for that reason: an `en-US` tag is at
 * least as likely to mean "default Windows install" as "in the United States".
 */
export function currencyForLocale(tag?: string | null): CurrencyCode | null {
  if (!tag) return null;
  const region = /^[A-Za-z]{2,3}[-_]([A-Za-z]{2})\b/.exec(tag)?.[1];
  return currencyForCountry(region);
}

const formatters = new Map<string, Intl.NumberFormat>();

function grouped(locale: string, n: number): string {
  let fmt = formatters.get(locale);
  if (!fmt) {
    fmt = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    formatters.set(locale, fmt);
  }
  return fmt.format(n);
}

/** Formats an amount already denominated in `code`. */
export function formatIn(code: CurrencyCode, amount: number): string {
  const rounded = Math.round(amount);
  if (code === "AUD") return money(rounded);

  const meta = CURRENCIES[code];
  const n = grouped(meta.locale, rounded);
  return meta.position === "before" ? `${meta.symbol}${n}` : `${n} ${meta.symbol}`;
}

/**
 * Renders an AUD amount in the active currency.
 *
 * Falls back to AUD whenever there is no usable rate — a missing, failed or
 * stale rate must never produce a converted number, because on this site the
 * converted number is the headline price.
 */
export function displayPrice(
  aud: number,
  code: CurrencyCode,
  rate: number | null | undefined,
): string {
  if (code === BASE_CURRENCY || rate == null || !Number.isFinite(rate) || rate <= 0) {
    return money(aud);
  }
  return formatIn(code, aud * rate);
}
