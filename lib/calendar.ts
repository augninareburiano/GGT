/**
 * Calendar helpers for confirmed bookings.
 *
 * Tours are treated as all-day events. Dates are plain "YYYY-MM-DD" strings
 * (business timezone, Australia/Sydney) so they map cleanly onto an all-day
 * VEVENT without timezone ambiguity.
 */

export type CalendarBooking = {
  id: string;
  tourName: string;
  /** "YYYY-MM-DD" */
  tourDate: string;
  guests: number;
  name: string;
};

const LOCATION = "Sydney, NSW";

/** "2026-08-05" → "20260805" (ICS DATE value). */
function toIcsDate(ymd: string): string {
  return ymd.replace(/-/g, "");
}

/** Returns the day after a "YYYY-MM-DD" date as "YYYYMMDD" (all-day DTEND is exclusive). */
function nextIcsDate(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const next = new Date(Date.UTC(y, m - 1, d + 1));
  return toIcsDate(next.toISOString().slice(0, 10));
}

/** Escapes a text value for an ICS field per RFC 5545. */
function escapeIcs(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/[,;]/g, "\\$&").replace(/\n/g, "\\n");
}

/**
 * Builds a minimal, valid iCalendar (.ics) document for an all-day tour so the
 * guest can add it to Apple Calendar / Outlook / Google from the email.
 */
export function buildIcs(booking: CalendarBooking): string {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const summary = escapeIcs(`Gourmet Getaway — ${booking.tourName}`);
  const description = escapeIcs(
    `Your ${booking.tourName} with Gourmet Getaway Tours for ${booking.guests} ` +
      `guest${booking.guests > 1 ? "s" : ""}. Jimmy will be in touch with pickup details.`,
  );

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Gourmet Getaway Tours//Bookings//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:booking-${booking.id}@gourmetgetaway`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${toIcsDate(booking.tourDate)}`,
    `DTEND;VALUE=DATE:${nextIcsDate(booking.tourDate)}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${escapeIcs(LOCATION)}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

/**
 * Builds an "Add to Google Calendar" link for the guest email body — a handy
 * one-click alternative to the attached .ics.
 */
export function googleCalendarUrl(booking: CalendarBooking): string {
  const dates = `${toIcsDate(booking.tourDate)}/${nextIcsDate(booking.tourDate)}`;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Gourmet Getaway — ${booking.tourName}`,
    dates,
    details: `Your ${booking.tourName} with Gourmet Getaway Tours for ${booking.guests} guest${
      booking.guests > 1 ? "s" : ""
    }.`,
    location: LOCATION,
  });
  return `https://www.google.com/calendar/render?${params.toString()}`;
}
