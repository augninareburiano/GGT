/**
 * FareHarbor Lightframe integration.
 *
 * Every booking CTA on the site resolves to a `fareharbor.com/embeds/book/…`
 * URL. The embed API script (loaded once in app/layout.tsx with
 * `autolightframe=yes`) intercepts clicks on those links and opens them in a
 * modal over the page, so plain `<a href>` is all most CTAs need. The tour
 * builder additionally calls `openFareHarbor()` to open the same modal
 * programmatically with the guest's details pre-filled.
 */

/** Company shortname from your FareHarbor dashboard URL. */
export const FAREHARBOR_SHORTNAME =
  process.env.NEXT_PUBLIC_FAREHARBOR_SHORTNAME ?? "";

/**
 * Item IDs, defaulted to this account's catalogue so only the shortname has to
 * be configured. Env vars override if the items are ever renumbered.
 *
 * The account sells two tour products, not one per destination: the fixed
 * Wednesday "Hunter Valley" tour, and "Private Tours" which covers every
 * custom itinerary the builder produces. That mirrors the site's own two-door
 * split, so the builder's destination/guests/extras travel as `u[…]` params on
 * a Private Tours booking rather than needing a separate item each.
 */

/** Wednesday Hunter Valley — the fixed header / hero / footer CTAs. */
export const FAREHARBOR_FLAGSHIP_ITEM_ID =
  process.env.NEXT_PUBLIC_FAREHARBOR_FLAGSHIP_ITEM_ID ?? "65971";

/** Private Tours — the fallback for any builder tour without its own item. */
export const FAREHARBOR_PRIVATE_ITEM_ID =
  process.env.NEXT_PUBLIC_FAREHARBOR_PRIVATE_ITEM_ID ?? "65977";

/** Gift Card — the footer link. (Item 65980 is the retired 2017 version.) */
export const FAREHARBOR_GIFT_ITEM_ID =
  process.env.NEXT_PUBLIC_FAREHARBOR_GIFT_ITEM_ID ?? "243773";

/**
 * Booking flow ID. Unset means FareHarbor uses the account's default flow,
 * which is what its own generated link for Private Tours does. Set this only
 * if a non-default flow is ever needed.
 */
export const FAREHARBOR_FLOW = process.env.NEXT_PUBLIC_FAREHARBOR_FLOW ?? "";

/** False until a shortname is configured; CTAs then fall back to the builder. */
export const FAREHARBOR_ENABLED = FAREHARBOR_SHORTNAME !== "";

const EMBED_ORIGIN = "https://fareharbor.com";

/** Where CTAs point when FareHarbor isn't configured yet. */
export const BOOKING_FALLBACK_HREF = "#builder";

export type FareHarborPrefill = {
  /** FareHarbor item ID. Omitted → the account's full item list. */
  itemId?: string;
  /** Party size from the builder's guest stepper. */
  guests?: number;
  /** Preferred date, `YYYY-MM-DD`. */
  date?: string;
  name?: string;
  email?: string;
  phone?: string;
  note?: string;
  /** Booking flow ID; falls back to FAREHARBOR_FLOW, then the account default. */
  flow?: string;
  /** Builder context (tour name, chosen extras, estimated total). */
  context?: Record<string, string | number>;
};

/**
 * Query keys we *hope* FareHarbor reads to pre-fill the contact step.
 *
 * UNVERIFIED: the dashboard's embed generator exposes no prefill option, so
 * this may be a no-op on this account. It is harmless either way — FareHarbor
 * ignores query params it doesn't recognise — and the guest's details have
 * already been captured by /api/enquiries before we get here, so nothing is
 * lost if it doesn't take; the guest just retypes them. If a live test shows
 * the contact step blank, ask FareHarbor support for the account's prefill
 * keys and change them here; nothing else moves.
 *
 * Deliberately not mirrored into `u[…]`: those land in URLs, logs and
 * analytics, and contact details don't belong there.
 */
const CONTACT_KEYS: Record<"name" | "email" | "phone" | "note", string> = {
  name: "prefill-contact-name",
  email: "prefill-contact-email",
  phone: "prefill-contact-phone",
  note: "prefill-contact-note",
};

/**
 * Builds the embed URL. Anything FareHarbor doesn't recognise as a booking
 * parameter is passed as a `u[…]` tracking param, which lands on the booking
 * record in the dashboard — so the builder's selections reach Jimmy either way.
 */
export function fareHarborUrl(prefill: FareHarborPrefill = {}): string {
  const path = prefill.itemId
    ? `/embeds/book/${FAREHARBOR_SHORTNAME}/items/${prefill.itemId}/`
    : `/embeds/book/${FAREHARBOR_SHORTNAME}/`;

  const q = new URLSearchParams({ "full-items": "yes" });

  const flow = prefill.flow ?? FAREHARBOR_FLOW;
  if (flow) q.set("flow", flow);
  if (prefill.date) q.set("date", prefill.date);
  if (prefill.guests) q.set("u[guests]", String(prefill.guests));

  for (const [field, key] of Object.entries(CONTACT_KEYS)) {
    const value = prefill[field as keyof typeof CONTACT_KEYS];
    if (value) q.set(key, value);
  }

  for (const [key, value] of Object.entries(prefill.context ?? {})) {
    if (value !== "" && value != null) q.set(`u[${key}]`, String(value));
  }

  return `${EMBED_ORIGIN}${path}?${q.toString()}`;
}

/**
 * `href` for a booking CTA — the embed URL when configured, otherwise the
 * on-page builder so no button is ever dead.
 */
export function bookingHref(prefill: FareHarborPrefill = {}): string {
  return FAREHARBOR_ENABLED ? fareHarborUrl(prefill) : BOOKING_FALLBACK_HREF;
}

/**
 * `href` for the fixed CTAs (header, hero, footer) that aren't tied to a
 * builder selection — the flagship item when one is set, else the item list.
 */
export function flagshipBookingHref(): string {
  return bookingHref({ itemId: FAREHARBOR_FLAGSHIP_ITEM_ID || undefined });
}

/** `href` for the footer's gift card link. */
export function giftBookingHref(): string {
  return bookingHref({ itemId: FAREHARBOR_GIFT_ITEM_ID || undefined });
}

/**
 * Resolves a builder tour to the item it books against: its own item when one
 * is set in the admin dashboard, otherwise Private Tours — which is what every
 * custom itinerary sells as.
 */
export function tourItemId(fareharborItemId?: string): string {
  return fareharborItemId || FAREHARBOR_PRIVATE_ITEM_ID;
}
