/**
 * Client-side analytics helpers for Plausible.
 *
 * The Plausible script is loaded (env-gated) in the root layout. When it isn't
 * configured, `window.plausible` is undefined and these calls are safe no-ops.
 */
declare global {
  interface Window {
    plausible?: (
      event: string,
      options?: { props?: Record<string, string | number | boolean> },
    ) => void;
  }
}

/** Track a custom goal/event. Silently no-ops if Plausible isn't loaded. */
export function trackEvent(
  event: string,
  props?: Record<string, string | number | boolean>,
): void {
  if (typeof window === "undefined") return;
  try {
    window.plausible?.(event, props ? { props } : undefined);
  } catch {
    // Analytics must never break the app.
  }
}

export {};
