"use client";

import { money } from "@/lib/money";
import { BASE_CURRENCY, SHOW_AUD_ON_TOTAL, displayPrice } from "@/lib/currency";
import { useCurrency } from "./CurrencyProvider";

/**
 * A price. Takes the AUD amount — the only currency this codebase stores — and
 * renders it in whatever currency is active, symbol and number converted
 * together. Falls back to AUD whenever there's no usable rate.
 */
export default function Price({ aud }: { aud: number }) {
  const { currency, rate } = useCurrency();
  return <>{displayPrice(aud, currency, rate)}</>;
}

/**
 * The "A$460, charged in AUD" line that sits under a converted total.
 *
 * Rendered as an always-present element — empty when the price is already in
 * AUD — so the box doesn't reflow when converted prices swap in after
 * hydration. Its height is reserved in CSS.
 */
export function ChargedInAud({
  aud,
  className,
}: {
  aud: number;
  className?: string;
}) {
  const { currency } = useCurrency();
  const show = SHOW_AUD_ON_TOTAL && currency !== BASE_CURRENCY;
  return (
    <span className={className}>
      {show ? `${money(aud)}, charged in AUD` : ""}
    </span>
  );
}
