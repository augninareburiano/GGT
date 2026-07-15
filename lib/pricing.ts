import type { Tour } from "./tours";

/**
 * Pricing is computed here so the server is the single source of truth — the
 * client's total is only ever a display hint and is recomputed before charging.
 *
 * Prices are authored GST-inclusive (standard for Australian consumer pricing),
 * so the GST component of any total is total ÷ 11 (10% GST). Amounts are in AUD.
 */

export const GST_RATE = 0.1;

/** Deposit percentage (of the total), from DEPOSIT_PERCENT. Defaults to 20%. */
export function depositPercent(): number {
  const raw = Number(process.env.DEPOSIT_PERCENT ?? process.env.NEXT_PUBLIC_DEPOSIT_PERCENT);
  return Number.isFinite(raw) && raw > 0 && raw <= 100 ? raw : 20;
}

export type QuoteLine = { label: string; amountAud: number };

export type Quote = {
  lines: QuoteLine[];
  subtotalAud: number;
  /** GST already included in the subtotal (subtotal ÷ 11), rounded to cents. */
  gstAud: number;
  totalAud: number;
  depositAud: number;
  balanceAud: number;
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Recomputes a quote from authoritative tour data. `addOnIds` selects add-ons by
 * id; unknown ids are ignored. Base and each add-on are charged per guest,
 * matching the client-side TourBuilder math.
 */
export function buildQuote(tour: Tour, guests: number, addOnIds: string[]): Quote {
  const g = Math.max(tour.min, Math.floor(guests));
  const selected = tour.addOns.filter((a) => addOnIds.includes(a.id));

  const lines: QuoteLine[] = [
    { label: `${tour.name} · base × ${g}`, amountAud: round2(tour.base * g) },
    ...selected.map((a) => ({
      label: `${a.name} × ${g}`,
      amountAud: round2(a.price * g),
    })),
  ];

  const totalAud = round2(lines.reduce((sum, l) => sum + l.amountAud, 0));
  const gstAud = round2(totalAud / 11);
  const depositAud = round2(totalAud * (depositPercent() / 100));
  const balanceAud = round2(totalAud - depositAud);

  return { lines, subtotalAud: totalAud, gstAud, totalAud, depositAud, balanceAud };
}

/** The AUD amount to charge now for the chosen payment type. */
export function amountDueNow(quote: Quote, paymentType: "deposit" | "full"): number {
  return paymentType === "deposit" ? quote.depositAud : quote.totalAud;
}
