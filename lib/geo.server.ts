import "server-only";
import { headers } from "next/headers";

/**
 * Best-effort visitor country from edge headers.
 *
 * Netlify exposes geo two ways depending on which runtime path serves the
 * request — `x-nf-geo` (base64 JSON) from the Next.js runtime, `x-country` from
 * Edge Functions — so both are read. Vercel's header is accepted too, purely so
 * this keeps working on a preview deploy elsewhere.
 *
 * This is a header read: no network call, no measurable latency. It's also only
 * a hint. VPNs, corporate proxies and mobile carriers all misreport, which is
 * why the visitor can always override it with the picker.
 */
export async function detectCountry(): Promise<string | null> {
  const h = await headers();

  const nfGeo = h.get("x-nf-geo");
  if (nfGeo) {
    try {
      const parsed = JSON.parse(
        Buffer.from(nfGeo, "base64").toString("utf8"),
      ) as { country?: { code?: string } };
      const code = parsed?.country?.code;
      if (code) return code.toUpperCase();
    } catch {
      // Malformed header — fall through to the plain ones.
    }
  }

  const plain = h.get("x-country") ?? h.get("x-vercel-ip-country");
  return plain ? plain.trim().toUpperCase() : null;
}
