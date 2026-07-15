import "server-only";
import { money } from "./money";
import { formatCurrency } from "./currency";
import type { TaxInvoice } from "./invoices";
import { renderInvoiceHtml } from "./invoices";

/**
 * Transactional emails via Resend. Mirrors the non-fatal pattern in the
 * enquiries route: if RESEND_* env vars are missing, we log and skip rather than
 * failing the payment flow.
 */
function resendConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ENQUIRY_FROM_EMAIL;
  if (!apiKey || !from) return null;
  return { apiKey, from };
}

async function send(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<void> {
  const cfg = resendConfig();
  if (!cfg) {
    console.warn("Email skipped (RESEND_API_KEY / ENQUIRY_FROM_EMAIL missing).");
    return;
  }
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(cfg.apiKey);
    await resend.emails.send({
      from: cfg.from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    });
  } catch (err) {
    console.error("Email send failed (flow continues):", err);
  }
}

/** Payment receipt + tax invoice, sent to the customer after a successful charge. */
export async function sendReceiptEmail(params: {
  to: string;
  name: string;
  tourName: string;
  coverage: string; // "Deposit" | "Full payment"
  paidCurrency: string;
  paidAmount: number; // presentment major units
  paidAud: number;
  balanceAud: number;
  invoice: TaxInvoice;
}): Promise<void> {
  const paidLine =
    params.paidCurrency.toUpperCase() === "AUD"
      ? money(params.paidAud)
      : `${formatCurrency(params.paidAmount, params.paidCurrency)} (${money(params.paidAud)})`;

  const balanceLine =
    params.balanceAud > 0
      ? `Balance still owing: ${money(params.balanceAud)} (due before your tour).`
      : "Paid in full — nothing further to pay.";

  const text = [
    `Hi ${params.name},`,
    ``,
    `Thanks for your booking with Gourmet Getaway Tours.`,
    ``,
    `Tour: ${params.tourName}`,
    `${params.coverage} received: ${paidLine}`,
    balanceLine,
    ``,
    `Your tax invoice ${params.invoice.number} is attached below.`,
  ].join("\n");

  const html = `<div style="font:15px/1.6 system-ui,sans-serif;color:#1a1a1a">
    <p>Hi ${escape(params.name)},</p>
    <p>Thanks for your booking with <strong>Gourmet Getaway Tours</strong>.</p>
    <p><strong>Tour:</strong> ${escape(params.tourName)}<br>
       <strong>${escape(params.coverage)} received:</strong> ${paidLine}<br>
       ${balanceLine}</p>
    <p>Your tax invoice <strong>${params.invoice.number}</strong> is below.</p>
    <hr style="border:0;border-top:1px solid #eee;margin:20px 0">
    ${renderInvoiceHtml(params.invoice)}
  </div>`;

  await send({
    to: params.to,
    subject: `Receipt & tax invoice ${params.invoice.number} — ${params.tourName}`,
    html,
    text,
  });
}

/** Notice sent when a payment attempt is declined/fails. */
export async function sendPaymentFailedEmail(params: {
  to: string;
  name: string;
  tourName: string;
  reason?: string;
}): Promise<void> {
  const reason = params.reason ? ` (${params.reason})` : "";
  const text = [
    `Hi ${params.name},`,
    ``,
    `Your payment for "${params.tourName}" didn't go through${reason}.`,
    `No charge was made. You can try again from the checkout page — often a`,
    `different card or contacting your bank resolves it.`,
  ].join("\n");

  const html = `<div style="font:15px/1.6 system-ui,sans-serif;color:#1a1a1a">
    <p>Hi ${escape(params.name)},</p>
    <p>Your payment for <strong>${escape(params.tourName)}</strong> didn't go through${escape(reason)}.</p>
    <p>No charge was made. You can try again from the checkout page — often a
       different card or a quick call to your bank sorts it out.</p>
  </div>`;

  await send({
    to: params.to,
    subject: `Payment issue — ${params.tourName}`,
    html,
    text,
  });
}

function escape(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}
