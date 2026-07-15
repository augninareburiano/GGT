/**
 * Ad conversion tracking — Google Ads + Meta Pixel.
 *
 * Everything here is a no-op unless the matching NEXT_PUBLIC_* env vars are set,
 * so nothing loads or fires in dev or before the ad accounts exist. See
 * `components/Analytics.tsx` for the loaders and `.env.local.example` for setup.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

export const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID ?? "";
export const GOOGLE_ADS_ENQUIRY_LABEL =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_ENQUIRY_LABEL ?? "";
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";

/**
 * Reports a completed enquiry — the site's primary "lead" conversion — to
 * whichever ad platforms are configured. Safe to call unconditionally; each
 * platform is skipped if its tag isn't loaded. Never throws.
 */
export function trackEnquiryConversion(value: number): void {
  if (typeof window === "undefined") return;

  // Google Ads conversion — needs both the account ID and the action label.
  if (window.gtag && GOOGLE_ADS_ID && GOOGLE_ADS_ENQUIRY_LABEL) {
    window.gtag("event", "conversion", {
      send_to: `${GOOGLE_ADS_ID}/${GOOGLE_ADS_ENQUIRY_LABEL}`,
      value,
      currency: "AUD",
    });
  }

  // Meta Pixel — standard "Lead" event, valued for ROAS reporting.
  if (window.fbq && META_PIXEL_ID) {
    window.fbq("track", "Lead", { value, currency: "AUD" });
  }
}
