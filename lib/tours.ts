export type AddOn = {
  id: string;
  name: string;
  /**
   * Per-person price in AUD. On a `payOnDay` extra this is the third party's
   * approximate gate price, shown as a guide only; `0` there means "price
   * varies" and is displayed as words rather than as a number.
   */
  price: number;
  /**
   * True for a third-party cost the guest pays direct on the day — a ticket
   * booth, a hire counter — rather than money we collect.
   *
   * These are never added to a quoted total. Charging for them would mean
   * taking payment on someone else's behalf, so the split is enforced here in
   * the data model and honoured by `tourTotal`, which is the only place a
   * total is worked out.
   */
  payOnDay?: boolean;
};

/**
 * Guest cap for a tour with none set — the 16-seat bus, which every tour
 * currently runs on. Kept only as the fallback for tour records written
 * before `max` existed; the real limit lives on each tour, so a second,
 * smaller vehicle just means a lower `max` on the tours that use it.
 */
export const DEFAULT_MAX_GUESTS = 16;

export type Tour = {
  id: string;
  name: string;
  base: number;
  min: number;
  /** Most guests this tour can take — the capacity of the vehicle it runs on. */
  max: number;
  addOns: AddOn[];
  /** Optional display order in the builder dropdown. */
  order?: number;
  /**
   * FareHarbor item ID this tour books against. When set, the builder's CTA
   * opens that item directly; when empty it opens the full item list.
   */
  fareharborItemId?: string;
};

/** Extras we charge for — everything the guest doesn't pay direct on the day. */
export const chargeableAddOns = (addOns: AddOn[]): AddOn[] =>
  addOns.filter((a) => !a.payOnDay);

/** Extras the guest pays a third party for, on the day. */
export const payOnDayAddOns = (addOns: AddOn[]): AddOn[] =>
  addOns.filter((a) => a.payOnDay);

/**
 * False when a pay-on-the-day extra has no set price — bike hire billed by the
 * hour, say. Displayed as "price varies" instead of a figure.
 */
export const hasFixedPrice = (a: AddOn): boolean => a.price > 0;

/**
 * The quoted estimate: base fare plus chargeable extras, per guest.
 *
 * The single source of the number we show, email and hand to FareHarbor, so
 * pay-on-the-day extras are dropped once, here, rather than at each call site.
 * Pass the full selected list — filtering is this function's job.
 */
export function tourTotal(base: number, guests: number, selected: AddOn[]): number {
  const extras = chargeableAddOns(selected).reduce((sum, a) => sum + a.price, 0);
  return (base + extras) * guests;
}

/**
 * Fallback / seed tour data — mirrors the original mockup's TOURS object.
 * Used to seed Firestore (scripts/seed-tours.ts) and as a graceful fallback
 * when Firestore is empty or unreachable.
 *
 * `fareharborItemId` reflects the account's actual catalogue: only the fixed
 * Wednesday Hunter Valley tour is its own product (65971). Every other
 * itinerary here is sold as "Private Tours" (65977), with the chosen
 * destination and extras carried through as booking metadata.
 */
export const SEED_TOURS: Tour[] = [
  {
    id: "blue-mountains-day",
    name: "Blue Mountains Day Trip",
    base: 180,
    min: 2,
    max: 16,
    order: 1,
    fareharborItemId: "65977",
    addOns: [
      { id: "picnic", name: "Gourmet picnic upgrade", price: 30 },
      // Bought at the venue's own booth / hire counter, so the guest pays
      // these direct — we only flag that they're coming.
      { id: "scenic", name: "Scenic World pass", price: 65, payOnDay: true },
      { id: "bike", name: "Bike hire at Hanging Rock", price: 0, payOnDay: true },
      { id: "truffle", name: "Truffle hunt (seasonal)", price: 65 },
    ],
  },
  {
    id: "hunter-valley",
    name: "Hunter Valley, private",
    base: 220,
    min: 2,
    max: 16,
    order: 2,
    fareharborItemId: "65971",
    addOns: [
      { id: "winery", name: "Extra winery", price: 35 },
      { id: "cheese", name: "Cheese & charcuterie board", price: 25 },
      { id: "truffle2", name: "Truffle hunt (seasonal)", price: 65 },
    ],
  },
  {
    id: "beaches-brewery",
    name: "Sydney Beaches & Brewery",
    base: 160,
    min: 2,
    max: 16,
    order: 3,
    fareharborItemId: "65977",
    addOns: [
      { id: "paddle", name: "Brewery tasting paddle", price: 30 },
      { id: "surf", name: "Surf lesson", price: 70 },
    ],
  },
  {
    id: "foodie",
    name: "Half-Day Sydney Foodie",
    base: 120,
    min: 2,
    max: 16,
    order: 4,
    fareharborItemId: "65977",
    addOns: [
      { id: "fish", name: "Fish market tasting", price: 25 },
      { id: "choc", name: "Chocolate & cheese flight", price: 25 },
    ],
  },
  {
    id: "jenolan",
    name: "Blue Mountains & Jenolan Overnight",
    base: 320,
    min: 2,
    max: 16,
    order: 5,
    fareharborItemId: "65977",
    addOns: [
      { id: "cave", name: "Cave tour entry", price: 50 },
      { id: "gear", name: "Camp gear & bedding", price: 40 },
      { id: "fire", name: "Campfire dinner upgrade", price: 35 },
    ],
  },
];
