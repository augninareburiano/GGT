"use client";
import { loadStripe, type Stripe } from "@stripe/stripe-js";

/**
 * Memoised browser Stripe instance from the publishable key. Returns null when
 * the key is absent so the UI can show a "payments unavailable" state instead of
 * throwing.
 */
let promise: Promise<Stripe | null> | null = null;

export function getStripe(): Promise<Stripe | null> {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!key) return Promise.resolve(null);
  if (!promise) promise = loadStripe(key);
  return promise;
}
