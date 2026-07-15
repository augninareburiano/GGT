import { NextResponse } from "next/server";
import { z } from "zod";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb, verifyAdmin } from "@/lib/firebase.admin";
import { sendConfirmation, type BookingFields } from "@/lib/email";

export const runtime = "nodejs";

const patchSchema = z.object({
  status: z.enum(["new", "confirmed", "handled"]),
  // Required (or falls back to preferredDate) when confirming a booking.
  tourDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date.")
    .optional(),
});

/** PATCH — admin only: update an enquiry's status, and fire the confirmation on confirm. */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await verifyAdmin(req.headers.get("authorization"));
  if (!admin) {
    return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
  }

  const { id } = await params;
  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body." }, { status: 422 });
  }
  const { status, tourDate } = parsed.data;

  const ref = adminDb().collection("enquiries").doc(id);

  // Simple status change (handled / reopen) — no side effects.
  if (status !== "confirmed") {
    await ref.update({ status });
    return NextResponse.json({ ok: true });
  }

  // Confirming a booking: lock in the date and send the confirmation email
  // (guest + Jimmy). Idempotent — the email is only sent once.
  const snap = await ref.get();
  if (!snap.exists) {
    return NextResponse.json({ error: "Enquiry not found." }, { status: 404 });
  }
  const v = snap.data()!;
  const finalDate = tourDate ?? v.preferredDate;
  if (!finalDate) {
    return NextResponse.json(
      { error: "A tour date is required to confirm." },
      { status: 422 },
    );
  }

  const alreadyConfirmed = !!v.confirmationSentAt;
  await ref.update({
    status: "confirmed",
    tourDate: finalDate,
    confirmedAt: v.confirmedAt ?? FieldValue.serverTimestamp(),
  });

  if (!alreadyConfirmed) {
    const booking: BookingFields = {
      id,
      name: v.name,
      email: v.email,
      phone: v.phone ?? "",
      message: v.message ?? "",
      tourName: v.tourName,
      guests: v.guests,
      addOns: v.addOns ?? [],
      total: v.total,
      preferredDate: v.preferredDate,
      tourDate: finalDate,
    };
    const sent = await sendConfirmation(booking);
    if (sent) {
      await ref.update({ confirmationSentAt: FieldValue.serverTimestamp() });
    }
  }

  return NextResponse.json({ ok: true, tourDate: finalDate });
}
