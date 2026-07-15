import "server-only";

/**
 * Tiny in-memory, fixed-window rate limiter.
 *
 * This is intentionally dependency-free and per-instance: on serverless it only
 * throttles requests that land on the same warm instance, which is enough to
 * blunt naive bursts from a single source without adding infrastructure. For
 * hard guarantees across instances you'd move this to Firestore/Redis later.
 */
type Window = { count: number; resetAt: number };

const buckets = new Map<string, Window>();

export type RateLimitResult = { ok: boolean; retryAfterSeconds: number };

export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now >= existing.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSeconds: 0 };
  }

  existing.count += 1;
  if (existing.count > limit) {
    return {
      ok: false,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }
  return { ok: true, retryAfterSeconds: 0 };
}

/** Best-effort client IP from proxy headers (Netlify, Vercel, generic). */
export function clientIp(req: Request): string {
  const h = req.headers;
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return (
    h.get("x-nf-client-connection-ip") ||
    h.get("x-real-ip") ||
    "unknown"
  );
}
