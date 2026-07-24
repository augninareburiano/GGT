export type AddOn = {
  id: string;
  name: string;
  price: number;
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
  /** Absent for showcase-only tours that aren't priced or booked directly. */
  base?: number;
  /** Absent where group size is negotiated per private tour rather than fixed. */
  min?: number;
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
  /** Pickup window, e.g. "6:30-7:10am". */
  startTime?: string;
  /** Return time and/or drop-off point, e.g. "~5:52pm Circular Quay". */
  returnTime?: string;
  /** Where guests are picked up, e.g. "Selected Sydney city hotels". */
  pickupLocation?: string;
  /** What's included on the day, shown as a list. */
  inclusions?: string[];
};

/**
 * Fallback / seed tour data.
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
    max: 16,
    order: 1,
    fareharborItemId: "65977",
    startTime: "6:30-7:10am",
    pickupLocation: "Selected Sydney city hotels",
    returnTime: "~5:52pm Circular Quay or 6:15pm Darling Harbour",
    inclusions: [
      "Light cooked breakfast",
      "Cider tasting and hot apple pie",
      "Progressive lunch from local produce",
      "Circle loop across the mountains",
    ],
    addOns: [
      { id: "picnic", name: "Gourmet picnic upgrade", price: 30 },
      { id: "scenic", name: "Scenic World pass", price: 50 },
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
    max: 16,
    order: 3,
    fareharborItemId: "65977",
    startTime: "6:30-7:00am",
    returnTime: "After 5pm, Circular Quay",
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
  {
    id: "central-coast",
    name: "Central Coast",
    max: 16,
    startTime: "7:00am",
    pickupLocation: "Yowie Bay",
    returnTime: "Approximately 4:00pm",
    inclusions: [
      "Breakfast at Brooklyn",
      "Sushi rolling class",
      "Mushroom farm tour",
      "Seafood BBQ lunch with wine",
      "Chocolate factory tour",
    ],
    addOns: [],
  },
  {
    id: "hawkesbury",
    name: "Hawkesbury",
    max: 16,
    startTime: "10:00am",
    pickupLocation: "Yowie Bay",
    returnTime: "Approximately 6:00pm",
    inclusions: [
      "Wine tasting at Tizzana Winery",
      "BBQ lunch by the Hawkesbury River",
      "Scones and tea at Australia's oldest church",
      "Sackville Ferry crossing",
    ],
    addOns: [],
  },
];
