import "server-only";

/**
 * Shared Resend helpers. Email is optional everywhere: if the env vars are
 * missing we log and no-op so the core request still succeeds.
 */

type SendArgs = {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
};

/** Sends an email via Resend if configured. Returns true if it was sent. */
export async function sendEmail({
  to,
  subject,
  text,
  replyTo,
}: SendArgs): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ENQUIRY_FROM_EMAIL;
  if (!apiKey || !from) {
    console.warn("Email not sent: RESEND_API_KEY / ENQUIRY_FROM_EMAIL missing.");
    return false;
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    await resend.emails.send({ from, to, subject, text, replyTo });
    return true;
  } catch (err) {
    console.error("Resend send failed:", err);
    return false;
  }
}

/**
 * Emails an operational error alert to the ALERT_TO_EMAIL (falling back to the
 * enquiry inbox). Never throws — alerting must not break the request path.
 */
export async function sendErrorAlert(context: string, error: unknown): Promise<void> {
  const to = process.env.ALERT_TO_EMAIL || process.env.ENQUIRY_TO_EMAIL;
  if (!to) return;

  const detail =
    error instanceof Error
      ? `${error.name}: ${error.message}\n\n${error.stack ?? ""}`
      : String(error);

  try {
    await sendEmail({
      to,
      subject: `⚠️ Gourmet Getaway site error — ${context}`,
      text: [
        `An error occurred: ${context}`,
        `Time: ${new Date().toISOString()}`,
        ``,
        detail,
      ].join("\n"),
    });
  } catch (err) {
    // Last-resort guard: alerting itself must never surface an error.
    console.error("Failed to send error alert:", err);
  }
}
