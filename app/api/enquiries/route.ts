import { NextResponse } from "next/server";
import { z } from "zod";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb, verifyAdmin } from "@/lib/firebase.admin";
import { money } from "@/lib/money";

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
});

/** POST — public: validate, save the enquiry, and email the business. */
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
        createdAt: FieldValue.serverTimestamp(),
      });

    await sendNotification(data, ref.id);

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
      status: v.status ?? "new",
      createdAt: v.createdAt?.toDate?.()?.toISOString() ?? null,
    };
  });

  return NextResponse.json({ enquiries });
}

type EnquiryData = z.infer<typeof enquirySchema>;

/** Sends a notification email via Resend, if configured. Non-fatal on failure. */
async function sendNotification(data: EnquiryData, id: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ENQUIRY_TO_EMAIL;
  const from = process.env.ENQUIRY_FROM_EMAIL;
  if (!apiKey || !to || !from) {
    console.warn("Email not sent: RESEND_API_KEY / ENQUIRY_* env vars missing.");
    return;
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const addOnsLine = data.addOns.length
      ? data.addOns.map((a) => a.name).join(", ")
      : "—";

    await resend.emails.send({
      from,
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
  } catch (err) {
    console.error("Email notification failed (enquiry still saved):", err);
  }
}
