import { adminDb } from "@/lib/firebase.admin";
import { buildInvoiceData, renderInvoiceHtml } from "@/lib/invoices";
import type { Order } from "@/lib/orders";

export const runtime = "nodejs";

/**
 * GET — public printable AUD tax invoice, looked up by invoice number. Amounts
 * are reconstructed from the (immutable) order record so the invoice is stable.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ number: string }> },
) {
  const { number } = await params;

  const snap = await adminDb()
    .collection("orders")
    .where("invoiceNumber", "==", number)
    .limit(1)
    .get();

  if (snap.empty) {
    return new Response("Invoice not found.", { status: 404 });
  }

  const o = snap.docs[0].data() as Omit<Order, "id">;
  const coverage = o.paymentType === "deposit" ? "Deposit" : "Full payment";
  const paidAud = o.amountDueNowAud;

  const invoice = buildInvoiceData({
    number,
    buyer: { name: o.customer.name, email: o.customer.email },
    lines: [{ label: `${o.tourName} — ${coverage.toLowerCase()}`, amountAud: paidAud }],
    totalAud: paidAud,
    gstAud: Math.round((paidAud / 11) * 100) / 100,
    coverage: `${coverage} for ${o.tourName}`,
    fx:
      o.presentmentCurrency !== "AUD"
        ? {
            currency: o.presentmentCurrency,
            rate: o.fxRate,
            amountCharged: o.presentmentAmount, // stored in major units
          }
        : undefined,
  });

  return new Response(renderInvoiceHtml(invoice), {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
