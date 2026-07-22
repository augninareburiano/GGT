"use client";

import {
  FAREHARBOR_ENABLED,
  fareHarborUrl,
  type FareHarborPrefill,
} from "./fareharbor";

declare global {
  interface Window {
    /** Present once the FareHarbor embed API script has loaded. */
    FH?: unknown;
  }
}

/**
 * Opens the FareHarbor Lightframe modal with `prefill` applied.
 *
 * The embed API binds a delegated click handler on the document, so the
 * cleanest way to trigger it with a fully-built URL is a real click on a real
 * anchor. If the script hasn't loaded (blocked, offline, not configured yet)
 * the same click falls through to opening the booking page in a new tab.
 *
 * Returns false when FareHarbor isn't configured, so callers can keep their
 * existing behaviour.
 */
export function openFareHarbor(prefill: FareHarborPrefill = {}): boolean {
  if (!FAREHARBOR_ENABLED || typeof window === "undefined") return false;

  const a = document.createElement("a");
  a.href = fareHarborUrl(prefill);
  a.style.display = "none";
  if (!window.FH) {
    a.target = "_blank";
    a.rel = "noopener noreferrer";
  }

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  return true;
}
