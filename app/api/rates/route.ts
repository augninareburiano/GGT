import { NextResponse } from "next/server";
import { getRates } from "@/lib/rates.server";

export const runtime = "nodejs";

/** Matches the upstream refresh cadence; see lib/rates.server.ts. */
export const revalidate = 43200;

/**
 * GET — public: AUD-based exchange rates for the display-currency switcher.
 *
 * Cached hard at every layer (route revalidation, then the CDN) so upstream
 * sees a handful of requests a day no matter the traffic. A `rates: null` body
 * is a normal response, not an error: it tells the client to render AUD only.
 */
export async function GET() {
  const payload = await getRates();

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control":
        "public, max-age=3600, s-maxage=43200, stale-while-revalidate=86400",
    },
  });
}
