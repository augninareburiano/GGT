import { NextResponse } from "next/server";
import { ratesForSupported } from "@/lib/fx";
import { supportedCurrencies } from "@/lib/currency";

export const runtime = "nodejs";

/**
 * GET — public. Mid-market AUD→currency rates for the supported currencies, so
 * the checkout can show a live "≈ local amount" (Wise-style) before charging.
 */
export async function GET() {
  try {
    const rates = await ratesForSupported();
    return NextResponse.json({ base: "AUD", currencies: supportedCurrencies(), rates });
  } catch (err) {
    console.error("Rates fetch failed:", err);
    // Degrade to AUD-only so checkout still works.
    return NextResponse.json({ base: "AUD", currencies: ["AUD"], rates: { AUD: 1 } });
  }
}
