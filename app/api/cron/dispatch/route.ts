import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase.admin";
import { sendReminder, sendReviewRequest, type BookingFields } from "@/lib/email";

export const runtime = "nodejs";

/** Business-timezone calendar date, offset by whole days, as "YYYY-MM-DD". */
function sydneyYmd(offsetDays: number): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Australia/Sydney",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const y = Number(parts.find((p) => p.type === "year")!.value);
  const m = Number(parts.find((p) => p.type === "month")!.value);
  const d = Number(parts.find((p) => p.type === "day")!.value);
  // Calendar arithmetic in UTC so DST never shifts the date.
  const base = new Date(Date.UTC(y, m - 1, d));
  base.setUTCDate(base.getUTCDate() + offsetDays);
  return base.toISOString().slice(0, 10);
}

function authorised(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = req.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : "";
  const a = Buffer.from(provided);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

function toBooking(id: string, v: FirebaseFirestore.DocumentData): BookingFields {
  return {
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
    tourDate: v.tourDate,
  };
}

/**
 * Daily sweep: sends day-before reminders (tour is tomorrow) and after-tour
 * review requests (tour was yesterday). Idempotent via the *SentAt stamps, so
 * it's safe to run more than once a day. Triggered by netlify/functions.
 */
async function handle(req: Request) {
  if (!authorised(req)) {
    return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
  }

  const tomorrow = sydneyYmd(1);
  const yesterday = sydneyYmd(-1);
  const db = adminDb();
  let reminders = 0;
  let reviews = 0;

  // Day-before reminders.
  const remindSnap = await db
    .collection("enquiries")
    .where("status", "==", "confirmed")
    .where("tourDate", "==", tomorrow)
    .get();
  for (const doc of remindSnap.docs) {
    const v = doc.data();
    if (v.reminderSentAt) continue;
    if (await sendReminder(toBooking(doc.id, v))) {
      await doc.ref.update({ reminderSentAt: FieldValue.serverTimestamp() });
      reminders++;
    }
  }

  // After-tour review requests.
  const reviewSnap = await db
    .collection("enquiries")
    .where("status", "==", "confirmed")
    .where("tourDate", "==", yesterday)
    .get();
  for (const doc of reviewSnap.docs) {
    const v = doc.data();
    if (v.reviewSentAt) continue;
    if (await sendReviewRequest(toBooking(doc.id, v))) {
      await doc.ref.update({ reviewSentAt: FieldValue.serverTimestamp() });
      reviews++;
    }
  }

  return NextResponse.json({ ok: true, tomorrow, yesterday, reminders, reviews });
}

export const GET = handle;
export const POST = handle;
