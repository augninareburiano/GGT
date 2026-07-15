import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase.admin";
import type { Order } from "@/lib/orders";

export const runtime = "nodejs";

/**
 * GET — public read of a single order's status, for the confirmation page.
 * Returns only fields safe to show the buyer (no Stripe internals).
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const snap = await adminDb().collection("orders").doc(id).get();
  if (!snap.exists) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }
  const o = snap.data() as Omit<Order, "id">;

  return NextResponse.json({
    id,
    tourName: o.tourName,
    guests: o.guests,
    status: o.status,
    paymentType: o.paymentType,
    presentmentCurrency: o.presentmentCurrency,
    presentmentAmount: o.presentmentAmount,
    amountDueNowAud: o.amountDueNowAud,
    totalAud: o.totalAud,
    balanceAud: o.status === "paid" ? 0 : o.balanceAud,
    invoiceNumber: o.invoiceNumber ?? null,
    customerName: o.customer?.name ?? "",
  });
}
