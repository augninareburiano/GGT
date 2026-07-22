export type AddOn = {
  id: string;
  name: string;
  price: number;
};

export type Tour = {
  id: string;
  name: string;
  base: number;
  min: number;
  addOns: AddOn[];
  /** Optional display order in the builder dropdown. */
  order?: number;
  /**
   * FareHarbor item ID this tour books against. When set, the builder's CTA
   * opens that item directly; when empty it opens the full item list.
   */
  fareharborItemId?: string;
};

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
    order: 1,
    fareharborItemId: "65977",
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
    order: 5,
    fareharborItemId: "65977",
    addOns: [
      { id: "cave", name: "Cave tour entry", price: 50 },
      { id: "gear", name: "Camp gear & bedding", price: 40 },
      { id: "fire", name: "Campfire dinner upgrade", price: 35 },
    ],
  },
];
