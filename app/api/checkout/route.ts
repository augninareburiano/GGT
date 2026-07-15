import { NextResponse } from "next/server";
import { z } from "zod";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase.admin";
import { getTours } from "@/lib/tours.server";
import { buildQuote, amountDueNow } from "@/lib/pricing";
import { convertAudTo } from "@/lib/fx";
import { isSupportedCurrency, toMinorUnits } from "@/lib/currency";
import { stripe, stripeConfigured } from "@/lib/stripe.server";

export const runtime = "nodejs";

const checkoutSchema = z.object({
  tourId: z.string().min(1),
  guests: z.number().int().min(1).max(100),
  addOnIds: z.array(z.string()).default([]),
  currency: z.string().min(3).max(3),
  paymentType: z.enum(["deposit", "full"]),
  customer: z.object({
    name: z.string().min(1).max(120),
    email: z.string().email(),
    phone: z.string().max(40).optional().default(""),
  }),
  tourDate: z.string().max(40).optional(), // ISO date; balance due by this date
});

/**
 * POST — public. Recomputes the price server-side (never trusts the client),
 * captures the FX rate, creates a pending order, and opens a Stripe
 * PaymentIntent for the amount due now in the customer's chosen currency.
 * Returns the PaymentIntent client secret for the embedded Payment Element.
 */
export async function POST(req: Request) {
  if (!stripeConfigured()) {
    return NextResponse.json(
      { error: "Payments are not configured yet. Please try again later." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check your booking details and try again." },
      { status: 422 },
    );
  }
  const data = parsed.data;

  const currency = data.currency.toUpperCase();
  if (!isSupportedCurrency(currency)) {
    return NextResponse.json({ error: "Unsupported currency." }, { status: 422 });
  }

  // Authoritative tour + price. The client total is ignored entirely.
  const tour = (await getTours()).find((t) => t.id === data.tourId);
  if (!tour) {
    return NextResponse.json({ error: "That tour could not be found." }, { status: 404 });
  }
  const quote = buildQuote(tour, data.guests, data.addOnIds);
  const dueNowAud = amountDueNow(quote, data.paymentType);

  try {
    const fx = await convertAudTo(currency, dueNowAud);
    const presentmentAmount = fx.amount;
    const minorAmount = toMinorUnits(presentmentAmount, currency);

    // Create the order first so the PaymentIntent can carry its id in metadata.
    const orderRef = adminDb().collection("orders").doc();
    const selectedAddOns = tour.addOns
      .filter((a) => data.addOnIds.includes(a.id))
      .map((a) => ({ id: a.id, name: a.name, price: a.price }));

    const pi = await stripe().paymentIntents.create({
      amount: minorAmount,
      currency: currency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      receipt_email: data.customer.email,
      description: `${tour.name} — ${data.paymentType === "deposit" ? "deposit" : "full payment"}`,
      metadata: {
        orderId: orderRef.id,
        tourId: tour.id,
        paymentType: data.paymentType,
        kind: "booking",
      },
    });

    await orderRef.set({
      tourId: tour.id,
      tourName: tour.name,
      guests: Math.max(tour.min, Math.floor(data.guests)),
      addOns: selectedAddOns,
      customer: {
        name: data.customer.name,
        email: data.customer.email,
        phone: data.customer.phone ?? "",
      },
      subtotalAud: quote.subtotalAud,
      gstAud: quote.gstAud,
      totalAud: quote.totalAud,
      depositAud: quote.depositAud,
      balanceAud: quote.balanceAud,
      presentmentCurrency: currency,
      fxRate: fx.rate,
      fxCapturedAt: fx.capturedAt,
      amountDueNowAud: dueNowAud,
      presentmentAmount,
      paymentType: data.paymentType,
      balanceDueDate: data.tourDate ?? null,
      status: "pending",
      stripePaymentIntentIds: [pi.id],
      invoiceNumber: null,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      orderId: orderRef.id,
      clientSecret: pi.client_secret,
      currency,
      presentmentAmount,
      amountDueNowAud: dueNowAud,
    });
  } catch (err) {
    console.error("Checkout failed:", err);
    return NextResponse.json(
      { error: "Could not start payment. Please try again shortly." },
      { status: 500 },
    );
  }
}
