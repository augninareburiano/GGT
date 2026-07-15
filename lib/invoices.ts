import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "./firebase.admin";
import { money } from "./money";

/**
 * Australian tax invoices. Amounts are always in AUD (ATO requirement) even when
 * the customer was charged in another currency — the FX rate used is recorded on
 * the order and shown for reference. See ATO "Tax invoices" requirements:
 * heading "Tax invoice", seller identity + ABN, date, description, and either the
 * GST amount or a statement that the total includes GST. Buyer identity is
 * required when the total is A$1,000 or more.
 */

export type InvoiceLine = { label: string; amountAud: number };

export type TaxInvoice = {
  number: string;
  issuedAt: string;
  seller: { name: string; abn: string; address: string };
  buyer: { name: string; email: string };
  lines: InvoiceLine[];
  totalAud: number;
  gstAud: number;
  /** Label for what this invoice covers, e.g. "Deposit" or "Full payment". */
  coverage: string;
  /** FX context when charged in a non-AUD currency (display only). */
  fx?: { currency: string; rate: number; amountCharged: number };
};

function business() {
  return {
    name: process.env.BUSINESS_LEGAL_NAME ?? "Gourmet Getaway Tours",
    abn: process.env.BUSINESS_ABN ?? "",
    address: process.env.BUSINESS_ADDRESS ?? "",
  };
}

/**
 * Allocates the next gapless invoice number using an atomic Firestore counter
 * (`counters/invoices`). Format: GGT-000123.
 */
export async function allocateInvoiceNumber(): Promise<string> {
  const ref = adminDb().collection("counters").doc("invoices");
  const seq = await adminDb().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const current = (snap.exists ? (snap.data()?.value as number) : 0) ?? 0;
    const next = current + 1;
    tx.set(ref, { value: next, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    return next;
  });
  return `GGT-${String(seq).padStart(6, "0")}`;
}

/** Renders a printable HTML tax invoice (self-contained; used for the page + email). */
export function renderInvoiceHtml(inv: TaxInvoice): string {
  const rows = inv.lines
    .map(
      (l) =>
        `<tr><td>${escapeHtml(l.label)}</td><td class="r">${money(l.amountAud)}</td></tr>`,
    )
    .join("");

  const buyerAbnNote =
    inv.totalAud >= 1000
      ? `<p class="muted">Recipient: ${escapeHtml(inv.buyer.name)} (${escapeHtml(inv.buyer.email)})</p>`
      : "";

  const fxNote = inv.fx
    ? `<p class="muted">Charged as ${inv.fx.currency} ${inv.fx.amountCharged.toFixed(2)} at 1 AUD = ${inv.fx.rate} ${inv.fx.currency}. Invoice amounts are in AUD.</p>`
    : "";

  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Tax Invoice ${escapeHtml(inv.number)}</title>
<style>
  :root { color-scheme: light; }
  body { font: 15px/1.5 -apple-system, system-ui, sans-serif; color: #1a1a1a; margin: 0; padding: 32px; background: #fff; }
  .sheet { max-width: 640px; margin: 0 auto; }
  h1 { font-size: 22px; letter-spacing: .02em; margin: 0 0 4px; }
  .head { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 16px; border-bottom: 2px solid #1a1a1a; padding-bottom: 16px; margin-bottom: 20px; }
  .muted { color: #666; margin: 2px 0; font-size: 13px; }
  table { width: 100%; border-collapse: collapse; margin: 16px 0; }
  td, th { padding: 8px 0; border-bottom: 1px solid #eee; text-align: left; }
  .r { text-align: right; font-variant-numeric: tabular-nums; }
  .totals td { border: 0; padding: 4px 0; }
  .grand { font-weight: 700; font-size: 17px; border-top: 2px solid #1a1a1a; }
  @media print { body { padding: 0; } }
</style></head>
<body><div class="sheet">
  <div class="head">
    <div>
      <h1>Tax Invoice</h1>
      <p class="muted">${escapeHtml(inv.number)} · ${new Date(inv.issuedAt).toLocaleDateString("en-AU")}</p>
      <p class="muted">${escapeHtml(inv.coverage)}</p>
    </div>
    <div class="r">
      <strong>${escapeHtml(inv.seller.name)}</strong>
      ${inv.seller.abn ? `<p class="muted">ABN ${escapeHtml(inv.seller.abn)}</p>` : ""}
      ${inv.seller.address ? `<p class="muted">${escapeHtml(inv.seller.address)}</p>` : ""}
    </div>
  </div>

  ${buyerAbnNote}

  <table>
    <thead><tr><th>Description</th><th class="r">Amount (AUD)</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>

  <table class="totals">
    <tr><td>GST included (10%)</td><td class="r">${money(inv.gstAud)}</td></tr>
    <tr class="grand"><td>Total (incl. GST)</td><td class="r">${money(inv.totalAud)}</td></tr>
  </table>

  ${fxNote}
  <p class="muted">Total includes GST of ${money(inv.gstAud)}.</p>
</div></body></html>`;
}

export function buildInvoiceData(params: {
  number: string;
  buyer: { name: string; email: string };
  lines: InvoiceLine[];
  totalAud: number;
  gstAud: number;
  coverage: string;
  fx?: { currency: string; rate: number; amountCharged: number };
}): TaxInvoice {
  return {
    number: params.number,
    issuedAt: new Date().toISOString(),
    seller: business(),
    buyer: params.buyer,
    lines: params.lines,
    totalAud: params.totalAud,
    gstAud: params.gstAud,
    coverage: params.coverage,
    fx: params.fx,
  };
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}
