import "server-only";
import { money } from "./money";
import { buildIcs, googleCalendarUrl } from "./calendar";

/** Fields captured when a guest submits an enquiry. */
export type EnquiryFields = {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  tourName: string;
  guests: number;
  addOns: { id: string; name: string; price: number }[];
  total: number;
  /** "YYYY-MM-DD" */
  preferredDate: string;
};

/** A confirmed booking — an enquiry with a locked-in tour date. */
export type BookingFields = EnquiryFields & {
  id: string;
  /** "YYYY-MM-DD" */
  tourDate: string;
};

/**
 * Returns a configured Resend client + the shared "from" address, or null if
 * email isn't configured. Every send is best-effort: callers log and continue,
 * so a missing key or send failure never blocks the booking flow.
 */
async function getResend(): Promise<{ resend: import("resend").Resend; from: string } | null> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ENQUIRY_FROM_EMAIL;
  if (!apiKey || !from) {
    console.warn("Email skipped: RESEND_API_KEY / ENQUIRY_FROM_EMAIL missing.");
    return null;
  }
  const { Resend } = await import("resend");
  return { resend: new Resend(apiKey), from };
}

/** Formats "2026-08-05" as "Wednesday, 5 August 2026" without timezone drift. */
function prettyDate(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 12));
  return dt.toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function addOnsLine(addOns: EnquiryFields["addOns"]): string {
  return addOns.length ? addOns.map((a) => a.name).join(", ") : "—";
}

function guestsLabel(n: number): string {
  return `${n} guest${n > 1 ? "s" : ""}`;
}

/**
 * Notifies the business (Jimmy) that a new enquiry arrived. Moved from the
 * enquiries route; unchanged except for the added preferred-date line.
 */
export async function sendEnquiryNotification(
  data: EnquiryFields,
  id: string,
): Promise<void> {
  const cfg = await getResend();
  const to = process.env.ENQUIRY_TO_EMAIL;
  if (!cfg || !to) return;

  try {
    await cfg.resend.emails.send({
      from: cfg.from,
      to,
      replyTo: data.email,
      subject: `New tour enquiry — ${data.tourName} (${data.name})`,
      text: [
        `New enquiry #${id}`,
        ``,
        `Tour: ${data.tourName}`,
        `Preferred date: ${prettyDate(data.preferredDate)}`,
        `Guests: ${data.guests}`,
        `Add-ons: ${addOnsLine(data.addOns)}`,
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
    console.error("Enquiry notification failed (enquiry still saved):", err);
  }
}

/** Immediate "we've got your enquiry" acknowledgement to the guest. */
export async function sendEnquiryAck(data: EnquiryFields): Promise<void> {
  const cfg = await getResend();
  if (!cfg) return;

  try {
    await cfg.resend.emails.send({
      from: cfg.from,
      to: data.email,
      subject: `We've got your enquiry — ${data.tourName}`,
      text: [
        `Hi ${data.name},`,
        ``,
        `Thanks for your enquiry with Gourmet Getaway Tours! Here's what we have:`,
        ``,
        `Tour: ${data.tourName}`,
        `Preferred date: ${prettyDate(data.preferredDate)}`,
        `Guests: ${guestsLabel(data.guests)}`,
        `Add-ons: ${addOnsLine(data.addOns)}`,
        `Estimated total: ${money(data.total)}`,
        ``,
        `Jimmy will be in touch shortly to lock in the details and confirm your`,
        `booking. Nothing is booked just yet — this is only to say we've received`,
        `your enquiry.`,
        ``,
        `Talk soon,`,
        `Gourmet Getaway Tours`,
      ].join("\n"),
    });
  } catch (err) {
    console.error("Enquiry acknowledgement failed (enquiry still saved):", err);
  }
}

/**
 * Sends the booking confirmation to the guest (with an .ics attachment and an
 * "add to Google Calendar" link) and a heads-up to Jimmy. Returns true only if
 * the guest email went out, so the caller can stamp confirmationSentAt.
 */
export async function sendConfirmation(booking: BookingFields): Promise<boolean> {
  const cfg = await getResend();
  if (!cfg) return false;

  const ics = buildIcs(booking);
  const gcal = googleCalendarUrl(booking);
  const dateLabel = prettyDate(booking.tourDate);

  let guestSent = false;
  try {
    await cfg.resend.emails.send({
      from: cfg.from,
      to: booking.email,
      subject: `You're booked! ${booking.tourName} — ${dateLabel}`,
      text: [
        `Hi ${booking.name},`,
        ``,
        `Great news — your Gourmet Getaway is confirmed! 🎉`,
        ``,
        `Tour: ${booking.tourName}`,
        `Date: ${dateLabel}`,
        `Guests: ${guestsLabel(booking.guests)}`,
        `Add-ons: ${addOnsLine(booking.addOns)}`,
        `Total: ${money(booking.total)}`,
        ``,
        `Add it to your calendar:`,
        `- The attached invite (booking.ics) works with Apple Calendar & Outlook.`,
        `- Google Calendar: ${gcal}`,
        ``,
        `Jimmy will follow up with pickup time and final details before the day.`,
        ``,
        `See you soon,`,
        `Gourmet Getaway Tours`,
      ].join("\n"),
      attachments: [
        {
          filename: "booking.ics",
          content: Buffer.from(ics).toString("base64"),
          contentType: "text/calendar",
        },
      ],
    });
    guestSent = true;
  } catch (err) {
    console.error("Guest confirmation email failed:", err);
  }

  const to = process.env.ENQUIRY_TO_EMAIL;
  if (to) {
    try {
      await cfg.resend.emails.send({
        from: cfg.from,
        to,
        replyTo: booking.email,
        subject: `Booking confirmed — ${booking.tourName} for ${booking.name} (${dateLabel})`,
        text: [
          `Booking #${booking.id} confirmed.`,
          ``,
          `Tour: ${booking.tourName}`,
          `Date: ${dateLabel}`,
          `Guests: ${guestsLabel(booking.guests)}`,
          `Add-ons: ${addOnsLine(booking.addOns)}`,
          `Total: ${money(booking.total)}`,
          ``,
          `Guest: ${booking.name}`,
          `Email: ${booking.email}`,
          `Phone: ${booking.phone || "—"}`,
        ].join("\n"),
      });
    } catch (err) {
      console.error("Jimmy confirmation email failed:", err);
    }
  }

  return guestSent;
}

/** Day-before reminder to the guest. Returns true if sent. */
export async function sendReminder(booking: BookingFields): Promise<boolean> {
  const cfg = await getResend();
  if (!cfg) return false;

  try {
    await cfg.resend.emails.send({
      from: cfg.from,
      to: booking.email,
      subject: `Tomorrow: your ${booking.tourName} 🍽️`,
      text: [
        `Hi ${booking.name},`,
        ``,
        `Just a friendly reminder that your ${booking.tourName} is tomorrow,`,
        `${prettyDate(booking.tourDate)}, for ${guestsLabel(booking.guests)}.`,
        ``,
        `Jimmy will be in touch with your pickup details if he hasn't already.`,
        `Come hungry!`,
        ``,
        `Gourmet Getaway Tours`,
      ].join("\n"),
    });
    return true;
  } catch (err) {
    console.error("Reminder email failed:", err);
    return false;
  }
}

/** After-tour review request to the guest. Returns true if sent. */
export async function sendReviewRequest(booking: BookingFields): Promise<boolean> {
  const cfg = await getResend();
  if (!cfg) return false;

  const reviewUrl = process.env.REVIEW_URL || process.env.NEXT_PUBLIC_SITE_URL || "";

  try {
    await cfg.resend.emails.send({
      from: cfg.from,
      to: booking.email,
      subject: `How was your ${booking.tourName}?`,
      text: [
        `Hi ${booking.name},`,
        ``,
        `We hope you had a wonderful time on your ${booking.tourName}!`,
        ``,
        `Would you mind leaving us a quick review? It genuinely helps other`,
        `foodies find us and takes less than a minute.`,
        ...(reviewUrl ? [``, `Leave a review: ${reviewUrl}`] : []),
        ``,
        `Thank you,`,
        `Gourmet Getaway Tours`,
      ].join("\n"),
    });
    return true;
  } catch (err) {
    console.error("Review request email failed:", err);
    return false;
  }
}
