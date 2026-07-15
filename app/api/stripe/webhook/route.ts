import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase.admin";
import { stripe } from "@/lib/stripe.server";
import { fromMinorUnits } from "@/lib/currency";
import { allocateInvoiceNumber, buildInvoiceData } from "@/lib/invoices";
import { sendReceiptEmail, sendPaymentFailedEmail } from "@/lib/emails.server";
import type { Order } from "@/lib/orders";

export const runtime = "nodejs";

/**
 * Stripe webhook — the source of truth for payment status. Verifies the
 * signature against STRIPE_WEBHOOK_SECRET, dedupes on the event id, and updates
 * the order (issuing the tax invoice + receipt on success).
 */
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers.get("stripe-signature");
  if (!secret || !sig) {
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  }

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(raw, sig, secret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  // Idempotency: record the event id; if it already exists, skip processing.
  const eventRef = adminDb().collection("webhookEvents").doc(event.id);
  try {
    await eventRef.create({ type: event.type, receivedAt: FieldValue.serverTimestamp() });
  } catch {
    return NextResponse.json({ received: true, deduped: true });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        await handleSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      case "payment_intent.payment_failed":
        await handleFailed(event.data.object as Stripe.PaymentIntent);
        break;
      default:
        break;
    }
  } catch (err) {
    // Surface a 500 so Stripe retries; clear the dedupe marker so the retry runs.
    console.error(`Webhook handler error for ${event.type}:`, err);
    await eventRef.delete().catch(() => {});
    return NextResponse.json({ error: "Handler error." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleSucceeded(pi: Stripe.PaymentIntent) {
  const orderId = pi.metadata?.orderId;
  if (!orderId) return;

  const ref = adminDb().collection("orders").doc(orderId);
  const snap = await ref.get();
  if (!snap.exists) return;
  const order = { id: orderId, ...(snap.data() as Omit<Order, "id">) };

  // Already invoiced for this intent? Nothing to do (idempotent double-safety).
  if (order.status === "paid" || order.status === "deposit_paid") {
    if (order.invoiceNumber) return;
  }

  const isDeposit = order.paymentType === "deposit";
  const newStatus = isDeposit ? "deposit_paid" : "paid";
  const coverage = isDeposit ? "Deposit" : "Full payment";

  const invoiceNumber = order.invoiceNumber ?? (await allocateInvoiceNumber());
  const paidAud = order.amountDueNowAud;
  const paidPresentment = fromMinorUnits(pi.amount_received || pi.amount, pi.currency);

  await ref.update({
    status: newStatus,
    invoiceNumber,
    paidAt: FieldValue.serverTimestamp(),
    stripePaymentIntentIds: FieldValue.arrayUnion(pi.id),
  });

  const invoice = buildInvoiceData({
    number: invoiceNumber,
    buyer: { name: order.customer.name, email: order.customer.email },
    lines: [{ label: `${order.tourName} — ${coverage.toLowerCase()}`, amountAud: paidAud }],
    totalAud: paidAud,
    gstAud: Math.round((paidAud / 11) * 100) / 100,
    coverage: `${coverage} for ${order.tourName}`,
    fx:
      order.presentmentCurrency !== "AUD"
        ? {
            currency: order.presentmentCurrency,
            rate: order.fxRate,
            amountCharged: paidPresentment,
          }
        : undefined,
  });

  await sendReceiptEmail({
    to: order.customer.email,
    name: order.customer.name,
    tourName: order.tourName,
    coverage,
    paidCurrency: order.presentmentCurrency,
    paidAmount: paidPresentment,
    paidAud,
    balanceAud: isDeposit ? order.balanceAud : 0,
    invoice,
  });
}

async function handleFailed(pi: Stripe.PaymentIntent) {
  const orderId = pi.metadata?.orderId;
  if (!orderId) return;

  const ref = adminDb().collection("orders").doc(orderId);
  const snap = await ref.get();
  if (!snap.exists) return;
  const order = snap.data() as Omit<Order, "id">;

  // Don't clobber an already-paid order (a later retry can't un-pay it).
  if (order.status === "paid" || order.status === "deposit_paid") return;

  await ref.update({ status: "failed", updatedAt: FieldValue.serverTimestamp() });

  await sendPaymentFailedEmail({
    to: order.customer.email,
    name: order.customer.name,
    tourName: order.tourName,
    reason: pi.last_payment_error?.message,
  });
}
