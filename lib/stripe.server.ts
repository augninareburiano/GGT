import "server-only";
import Stripe from "stripe";

/**
 * Lazily-initialised, memoised Stripe client (server only). Mirrors the
 * lazy-init guard in `firebase.admin.ts` so a missing key fails loudly at call
 * time rather than at import time (keeps the build working without secrets).
 *
 * The API version is intentionally left unset so the SDK uses the version it
 * was published against — avoids TS literal-union churn on every SDK bump.
 */
let cached: Stripe | null = null;

export function stripe(): Stripe {
  if (cached) return cached;

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY env var is not set. Add your Stripe secret key to the environment.",
    );
  }

  cached = new Stripe(key, { typescript: true });
  return cached;
}

/** True when Stripe is configured — lets routes degrade gracefully. */
export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
