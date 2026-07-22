"use client";

import { CURRENCIES, CURRENCY_CODES, isCurrencyCode } from "@/lib/currency";
import { useCurrency } from "./CurrencyProvider";

/**
 * Manual currency override, so a visitor whose location we read wrong — VPN,
 * corporate proxy, expat, just passing through — can fix it. The choice
 * persists and outranks detection from then on.
 *
 * Renders nothing until rates have loaded: with no rates the site is AUD-only,
 * and a picker whose options all do nothing is worse than no picker.
 */
export default function CurrencyPicker() {
  const { currency, setCurrency, switchable, asOf } = useCurrency();

  if (!switchable) return null;

  return (
    <div className="cpick">
      <label className="cpick-label" htmlFor="currency">
        Show prices in
      </label>
      <select
        id="currency"
        value={currency}
        onChange={(e) => {
          if (isCurrencyCode(e.target.value)) setCurrency(e.target.value);
        }}
      >
        {CURRENCY_CODES.map((code) => (
          <option key={code} value={code}>
            {code} · {CURRENCIES[code].label}
          </option>
        ))}
      </select>
      <p className="cpick-note">
        {currency === "AUD"
          ? "Tours are priced and charged in Australian dollars."
          : `Converted at the rate of ${formatAsOf(asOf)}. You're charged in Australian dollars.`}
      </p>
    </div>
  );
}

/** "22 Jul 2026" — the age of the rate, so nobody has to guess how fresh it is. */
function formatAsOf(asOf: string | null): string {
  if (!asOf) return "the latest published rates";
  const d = new Date(asOf);
  if (Number.isNaN(d.getTime())) return "the latest published rates";
  return d.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
