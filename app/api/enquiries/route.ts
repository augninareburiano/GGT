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
  /**
   * Third-party extras the guest pays direct on the day. Recorded so Jimmy
   * knows what the day involves; never part of `total`, which is what we quote
   * and what any deposit is taken against. A price of 0 means it varies.
   */
  payOnDayAddOns: z.array(addOnSchema).default([]),
  total: z.number().nonnegative(),
  /** `YYYY-MM-DD`, passed straight to the FareHarbor availability calendar. */
  preferredDate: z
    .string()
    .regex(/^(\d{4}-\d{2}-\d{2})?$/, "Invalid date.")
    .optional()
    .default(""),
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

    // Notify the business and auto-acknowledge the customer. Both are
    // best-effort — the enquiry is already saved, so email failures must
    // not fail the request.
    await Promise.allSettled([
      sendNotification(data, ref.id),
      sendCustomerConfirmation(data, ref.id),
    ]);

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
      preferredDate: v.preferredDate ?? "",
      addOns: v.addOns ?? [],
      payOnDayAddOns: v.payOnDayAddOns ?? [],
      total: v.total,
      status: v.status ?? "new",
      createdAt: v.createdAt?.toDate?.()?.toISOString() ?? null,
    };
  });

  return NextResponse.json({ enquiries });
}

type EnquiryData = z.infer<typeof enquirySchema>;

type LineItem = { name: string; price: number };

/** Comma-separated names, or an em dash so an empty list still reads as answered. */
const namesLine = (items: LineItem[]) =>
  items.length ? items.map((a) => a.name).join(", ") : "—";

/**
 * Pay-on-the-day extras with their guide prices. Never totalled — a sum here
 * would look like an amount owed to us, which is exactly what these aren't.
 */
const payOnDayLine = (items: LineItem[]) =>
  items.length
    ? items
        .map(
          (a) => `${a.name} (${a.price > 0 ? `~${money(a.price)} pp` : "price varies"})`,
        )
        .join(", ")
    : "—";

/** Wording used wherever pay-on-the-day extras are listed. */
const PAY_ON_DAY_NOTE =
  "Paid direct to the provider on the day — not included in the estimate.";

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
        `Preferred date: ${data.preferredDate || "—"}`,
        `Add-ons: ${namesLine(data.addOns)}`,
        `Estimated total: ${money(data.total)}`,
        ``,
        `Paid on the day: ${payOnDayLine(data.payOnDayAddOns)}`,
        `  ${PAY_ON_DAY_NOTE}`,
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

/**
 * Sends an automated confirmation email to the customer who submitted the
 * enquiry, so they know it landed. Reuses the same Resend config; sent from
 * ENQUIRY_FROM_EMAIL with replies routed to the business inbox. Non-fatal.
 */
async function sendCustomerConfirmation(data: EnquiryData, id: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ENQUIRY_FROM_EMAIL;
  const replyTo = process.env.ENQUIRY_TO_EMAIL;
  if (!apiKey || !from) {
    console.warn(
      "Customer confirmation not sent: RESEND_API_KEY / ENQUIRY_FROM_EMAIL missing.",
    );
    return;
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const firstName = data.name.trim().split(/\s+/)[0] || "there";

    await resend.emails.send({
      from,
      to: data.email,
      ...(replyTo ? { replyTo } : {}),
      subject: `We got your enquiry — ${data.tourName}`,
      text: [
        `Hi ${firstName},`,
        ``,
        `Thanks for your enquiry with Gourmet Getaway Tours! We've received`,
        `it and Jimmy will be in touch shortly to lock in the details.`,
        ``,
        `Here's a copy of what you sent us:`,
        ``,
        `Tour: ${data.tourName}`,
        `Guests: ${data.guests}`,
        `Add-ons: ${namesLine(data.addOns)}`,
        `Estimated total: ${money(data.total)}`,
        ``,
        ...(data.payOnDayAddOns.length
          ? [
              `Paid on the day: ${payOnDayLine(data.payOnDayAddOns)}`,
              PAY_ON_DAY_NOTE,
              ``,
            ]
          : []),
        data.message ? `Your message: ${data.message}` : ``,
        ``,
        `Reference: #${id}`,
        ``,
        `If anything looks off, just reply to this email.`,
        ``,
        `Cheers,`,
        `The Gourmet Getaway Tours team`,
      ]
        .filter((line) => line !== "")
        .join("\n"),
      html: confirmationHtml(data, id, firstName),
    });
  } catch (err) {
    console.error("Customer confirmation email failed (enquiry still saved):", err);
  }
}

/** Builds the branded HTML body for the customer confirmation email. */
function confirmationHtml(data: EnquiryData, id: string, firstName: string): string {
  const row = (label: string, value: string) =>
    `<tr><td style="padding:6px 0;color:#6b6b6b;">${label}</td>` +
    `<td style="padding:6px 0;text-align:right;font-weight:600;color:#1a1a1a;">${value}</td></tr>`;

  return `<!doctype html>
<html>
  <body style="margin:0;background:#f6f4ef;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1a1a1a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f4ef;padding:32px 12px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:14px;overflow:hidden;">
          <tr><td style="background:#1a1a1a;color:#ffffff;padding:24px 28px;font-size:18px;font-weight:700;">
            Gourmet Getaway Tours
          </td></tr>
          <tr><td style="padding:28px;">
            <h1 style="margin:0 0 8px;font-size:22px;">Thanks, ${firstName}! 🎉</h1>
            <p style="margin:0 0 20px;color:#4a4a4a;line-height:1.5;">
              We've received your enquiry and Jimmy will be in touch shortly to
              lock in the details. Here's a copy for your records.
            </p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #eee;border-bottom:1px solid #eee;margin:0 0 20px;">
              ${row("Tour", data.tourName)}
              ${row("Guests", String(data.guests))}
              ${row("Add-ons", namesLine(data.addOns))}
              ${row("Estimated total", money(data.total))}
            </table>
            ${
              // Below the totals table on purpose: these are the guest's own
              // costs at someone else's counter, not a line in what we quote.
              data.payOnDayAddOns.length
                ? `<p style="margin:0 0 20px;color:#4a4a4a;line-height:1.5;">
                     <b>Paid on the day:</b> ${escapeHtml(
                       payOnDayLine(data.payOnDayAddOns),
                     )}<br>
                     <span style="color:#8a8a8a;font-size:13px;">${PAY_ON_DAY_NOTE}</span>
                   </p>`
                : ""
            }
            ${
              data.message
                ? `<p style="margin:0 0 20px;color:#4a4a4a;line-height:1.5;"><b>Your message:</b><br>${escapeHtml(
                    data.message,
                  )}</p>`
                : ""
            }
            <p style="margin:0;color:#8a8a8a;font-size:13px;">
              Reference #${id} · If anything looks off, just reply to this email.
            </p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

/** Escapes user-supplied text for safe inclusion in HTML. */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
