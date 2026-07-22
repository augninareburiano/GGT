import { mediaBg } from "./media";

/**
 * The "Nine ways to spend the day" showcase tours.
 *
 * Single source of truth behind the DestinationCarousel thumbnails.
 *
 * `bg` is the CSS gradient fallback. To use real photography, set `image` to a
 * path (e.g. `/images/tours/hunter.jpg`) — the photo layers over the gradient,
 * which stays behind as a fallback while the image loads or if it's missing.
 * Consume both together via `showcaseBg(tour)` rather than reading `bg` raw.
 */
export type ShowcaseTour = {
  id: string;
  /** Short caption / theme line (was the card "art" label). */
  region: string;
  name: string;
  blurb: string;
  /**
   * "From" price per person, in AUD — the currency every price in this codebase
   * is stored in. Rendered through `<Price>`, which converts it to the
   * visitor's currency, so this must stay a number rather than a formatted
   * string.
   */
  fromAud: number;
  /** CSS gradient fallback, shown behind any photo. */
  bg: string;
  /** Optional photo path/URL, e.g. `/images/tours/hunter.jpg`. */
  image?: string;
};

/** Effective CSS background for a showcase tour: photo over gradient fallback. */
export const showcaseBg = (t: ShowcaseTour): string => mediaBg(t.bg, t.image);

export const SHOWCASE_TOURS: ShowcaseTour[] = [
  {
    id: "hunter",
    region: "Vineyards & cellar doors",
    name: "Hunter Valley, private",
    blurb: "Cellar doors, long lunch, and a chef who cooks to match every glass.",
    fromAud: 220,
    bg: "linear-gradient(150deg,#8FB31E,#3C4A14)",
    // Drop a photo at public/images/tours/hunter.jpg and uncomment:
    // image: "/images/tours/hunter.jpg",
  },
  {
    id: "beaches",
    region: "Sand, surf & a cold one",
    name: "Sydney Beaches & Brewery",
    blurb:
      "The coast at its best, finishing with a tasting paddle at a local brewery.",
    fromAud: 160,
    bg: "linear-gradient(150deg,#19B3B3,#0A6E6E)",
  },
  {
    id: "foodie",
    region: "Markets to morsels",
    name: "Half-Day Sydney Foodie",
    blurb:
      "Bakery, fish market, cheese, chocolate and a pie or two. Bring an appetite.",
    fromAud: 120,
    bg: "linear-gradient(150deg,#FF7A2E,#D63E00)",
  },
  {
    id: "jenolan",
    region: "Cliffs, caves & campfire",
    name: "Blue Mountains & Jenolan Overnight",
    blurb: "A big day in the ranges, a night under canvas, a campfire dinner.",
    fromAud: 320,
    bg: "linear-gradient(150deg,#F4B400,#B5790A)",
  },
  {
    id: "highlands",
    region: "Cool-climate cellar doors",
    name: "Southern Highlands",
    blurb: "Rolling green hills, pinot and pie, and a fireside long lunch.",
    fromAud: 210,
    bg: "linear-gradient(150deg,#8E4585,#3B1E4A)",
  },
  {
    id: "central-coast",
    region: "Oysters & estuary",
    name: "Central Coast Oysters",
    blurb:
      "Shuck-your-own oysters on the flats, then lunch where the river meets the sea.",
    fromAud: 175,
    bg: "linear-gradient(150deg,#2E6E9E,#0E3B5C)",
  },
  {
    id: "blue-mountains-day",
    region: "Clifftops & lookouts",
    name: "Blue Mountains Day Trip",
    blurb:
      "Three Sisters, a bushwalk, and a gourmet picnic on the escarpment.",
    fromAud: 180,
    bg: "linear-gradient(150deg,#C7522A,#6E2412)",
  },
  {
    id: "orange-mudgee",
    region: "High-country vines",
    name: "Orange & Mudgee",
    blurb: "Altitude wines, orchard produce and a table set among the rows.",
    fromAud: 260,
    bg: "linear-gradient(150deg,#9E2B45,#4A1020)",
  },
  {
    id: "kangaroo-valley",
    region: "River, ridge & paddock",
    name: "Kangaroo Valley",
    blurb:
      "Kayaks, cheese, and a slow drive through the greenest valley in the state.",
    fromAud: 195,
    bg: "linear-gradient(150deg,#3FA796,#155246)",
  },
];
