import { NextResponse } from "next/server";
import { z } from "zod";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb, verifyAdmin } from "@/lib/firebase.admin";
import { money } from "@/lib/money";
import { sendEmail, sendErrorAlert } from "@/lib/email";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

// Spam heuristics: reject submissions that come back implausibly fast, and cap
// how many a single IP can send in a short window.
const MIN_FILL_MS = 2500;
const RATE_LIMIT = { limit: 5, windowMs: 60_000 };

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
  // Anti-spam fields (not persisted):
  // `company` is a honeypot — real users never see or fill it.
  company: z.string().optional().default(""),
  // `elapsedMs` is how long the form was on screen before submit.
  elapsedMs: z.number().nonnegative().optional().default(0),
});

/** POST — public: validate, save the enquiry, and email the business. */
export async function POST(req: Request) {
  // 1. Rate limit per IP before doing any work.
  const limit = rateLimit(`enquiry:${clientIp(req)}`, RATE_LIMIT);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many enquiries — please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

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
  const { company, elapsedMs, ...data } = parsed.data;

  // 2. Honeypot: a bot filled the hidden field. Pretend success, save nothing.
  if (company.trim() !== "") {
    console.warn("Enquiry rejected: honeypot filled.");
    return NextResponse.json({ ok: true });
  }

  // 3. Timing: submitted implausibly fast for a human filling the form.
  if (elapsedMs > 0 && elapsedMs < MIN_FILL_MS) {
    console.warn(`Enquiry rejected: submitted in ${elapsedMs}ms.`);
    return NextResponse.json({ ok: true });
  }

  try {
    const ref = await adminDb()
      .collection("enquiries")
      .add({
        ...data,
        status: "new",
        createdAt: FieldValue.serverTimestamp(),
      });

    await sendNotification(data, ref.id);

    return NextResponse.json({ ok: true, id: ref.id });
  } catch (err) {
    console.error("Failed to save enquiry:", err);
    await sendErrorAlert("saving enquiry", err);
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

  try {
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
        status: v.status ?? "new",
        createdAt: v.createdAt?.toDate?.()?.toISOString() ?? null,
      };
    });

    return NextResponse.json({ enquiries });
  } catch (err) {
    console.error("Failed to list enquiries:", err);
    await sendErrorAlert("listing enquiries", err);
    return NextResponse.json(
      { error: "Could not load enquiries." },
      { status: 500 },
    );
  }
}

type EnquiryData = Omit<z.infer<typeof enquirySchema>, "company" | "elapsedMs">;

/** Sends a notification email via Resend, if configured. Non-fatal on failure. */
async function sendNotification(data: EnquiryData, id: string) {
  const to = process.env.ENQUIRY_TO_EMAIL;
  if (!to) {
    console.warn("Email not sent: ENQUIRY_TO_EMAIL missing.");
    return;
  }

  const addOnsLine = data.addOns.length
    ? data.addOns.map((a) => a.name).join(", ")
    : "—";

  await sendEmail({
    to,
    replyTo: data.email,
    subject: `New tour enquiry — ${data.tourName} (${data.name})`,
    text: [
      `New enquiry #${id}`,
      ``,
      `Tour: ${data.tourName}`,
      `Guests: ${data.guests}`,
      `Add-ons: ${addOnsLine}`,
      `Estimated total: ${money(data.total)}`,
      ``,
      `Name: ${data.name}`,
      `Email: ${data.email}`,
      `Phone: ${data.phone || "—"}`,
      ``,
      `Message:`,
      data.message || "—",
    ].join("\n"),
  });
}
