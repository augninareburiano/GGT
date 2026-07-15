import { NextResponse } from "next/server";
import { z } from "zod";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb, verifyAdmin } from "@/lib/firebase.admin";
import { sendEnquiryAck, sendEnquiryNotification } from "@/lib/email";

export const runtime = "nodejs";

const addOnSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
});

const enquirySchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  phone: z.string().max(40).optional().default(""),
  message: z.string().max(2000).optional().default(""),
  tourId: z.string().min(1),
  tourName: z.string().min(1),
  guests: z.number().int().min(1).max(100),
  addOns: z.array(addOnSchema).default([]),
  total: z.number().nonnegative(),
  // Guest's preferred tour date, "YYYY-MM-DD". The booking is only firmed up
  // (and this becomes tourDate) once an admin confirms it.
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date."),
});

/** POST — public: validate, save the enquiry, notify the business, ack the guest. */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = enquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the form and try again." },
      { status: 422 },
    );
  }
  const data = parsed.data;

  try {
    const ref = await adminDb()
      .collection("enquiries")
      .add({
        ...data,
        status: "new",
        tourDate: null,
        createdAt: FieldValue.serverTimestamp(),
        confirmedAt: null,
        ackSentAt: null,
        confirmationSentAt: null,
        reminderSentAt: null,
        reviewSentAt: null,
      });

    await Promise.all([
      sendEnquiryNotification(data, ref.id),
      sendEnquiryAck(data),
    ]);
    await ref.update({ ackSentAt: FieldValue.serverTimestamp() });

    return NextResponse.json({ ok: true, id: ref.id });
  } catch (err) {
    console.error("Failed to save enquiry:", err);
    return NextResponse.json(
      { error: "Could not save your enquiry. Please try again shortly." },
      { status: 500 },
    );
  }
}

/** GET — admin only: list enquiries, newest first. */
export async function GET(req: Request) {
  const admin = await verifyAdmin(req.headers.get("authorization"));
  if (!admin) {
    return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
  }

  const snap = await adminDb()
    .collection("enquiries")
    .orderBy("createdAt", "desc")
    .limit(200)
    .get();

  const enquiries = snap.docs.map((d) => {
    const v = d.data();
    return {
      id: d.id,
      name: v.name,
      email: v.email,
      phone: v.phone ?? "",
      message: v.message ?? "",
      tourName: v.tourName,
      guests: v.guests,
      addOns: v.addOns ?? [],
      total: v.total,
      preferredDate: v.preferredDate ?? null,
      tourDate: v.tourDate ?? null,
      status: v.status ?? "new",
      createdAt: v.createdAt?.toDate?.()?.toISOString() ?? null,
    };
  });

  return NextResponse.json({ enquiries });
}
