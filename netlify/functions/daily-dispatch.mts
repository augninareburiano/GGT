import type { Config } from "@netlify/functions";

/**
 * Daily trigger for booking reminders / review requests. Keeps zero business
 * logic — it just calls the secret-protected Next API route, which queries
 * Firestore and sends the due emails. Netlify injects `URL` (the live site).
 */
export default async () => {
  const base = process.env.URL ?? process.env.NEXT_PUBLIC_SITE_URL;
  const secret = process.env.CRON_SECRET;
  if (!base || !secret) {
    console.error("daily-dispatch: URL or CRON_SECRET not configured.");
    return;
  }

  const res = await fetch(`${base}/api/cron/dispatch`, {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}` },
  });
  console.log("daily-dispatch:", res.status, await res.text());
};

// 20:00 UTC ≈ 06:00–07:00 in Sydney (AEST/AEDT) — a good "morning of" send window.
export const config: Config = {
  schedule: "0 20 * * *",
};
