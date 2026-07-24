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

/**
 * Shared pricing model for every private tour (every tour except Hunter
 * Valley). Referenced directly by consumers rather than copied onto each
 * tour, so the client's rate can be updated in one place.
 */
export const PRIVATE_TOUR_RATE = {
  base: 2300,
  baseCoversMin: 2,
  baseCoversMax: 4,
  extraGuestPrice: 200,
  maxGuests: 16,
  includes: ["Guide", "Bus", "Lunch"],
};

export type Tour = {
  id: string;
  name: string;
  /** Hunter Valley only — its own per-person adult rate. */
  priceAdult?: number;
  /** Hunter Valley only — its own per-person senior rate. */
  priceSenior?: number;
  /** Hunter Valley only — its own per-person child/student (5-17) rate. */
  priceChild?: number;
  /** Absent where group size is negotiated per private tour rather than fixed. */
  min?: number;
  /** Most guests this tour can take — the capacity of the vehicle it runs on. */
  max: number;
  addOns: AddOn[];
  /** Optional display order in the builder dropdown. */
  order?: number;
  /**
   * FareHarbor item ID this tour books against. Only Hunter Valley has one;
   * every other tour is a private tour booked by enquiry, not FareHarbor.
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
 * Hunter Valley is the only tour sold as its own FareHarbor product (65971)
 * and priced per person (see priceAdult/priceSenior/priceChild). Every other
 * itinerary is a private tour: priced from PRIVATE_TOUR_RATE and booked by
 * enquiry only.
 */
export const SEED_TOURS: Tour[] = [
  {
    id: "blue-mountains-day",
    name: "Blue Mountains Day Trip",
    max: 16,
    order: 1,
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
    priceAdult: 277,
    priceSenior: 267,
    priceChild: 257,
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
    startTime: "6:30-7:00am",
    pickupLocation: "Arranged with you when you book",
    returnTime: "After 5pm, Circular Quay",
    addOns: [
      { id: "paddle", name: "Brewery tasting paddle", price: 30 },
      { id: "surf", name: "Surf lesson", price: 70 },
    ],
  },
  {
    id: "foodie",
    name: "Half-Day Sydney Foodie",
    max: 16,
    order: 4,
    inclusions: [
      "Bakery",
      "Fish market",
      "Meat market",
      "Cafe",
      "Chocolate",
      "Cheese",
      "Deli",
      "Pie",
    ],
    addOns: [
      { id: "fish", name: "Fish market tasting", price: 25 },
      { id: "choc", name: "Chocolate & cheese flight", price: 25 },
    ],
  },
  {
    id: "jenolan",
    name: "Blue Mountains & Jenolan Overnight",
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
