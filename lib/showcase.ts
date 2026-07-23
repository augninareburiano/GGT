import { mediaBg } from "./media";

/**
 * The "Eight ways to spend the day" showcase tours.
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
  /** Optional photo path/URL, e.g. `/images/tours/hunter.webp`. */
  image?: string;
  /**
   * Optional CSS `background-position` for photos whose subject sits off-centre,
   * so the 150×210 thumbnail doesn't crop it away. Defaults to `center`.
   */
  focus?: string;
};

/** Effective CSS background for a showcase tour: photo over gradient fallback. */
export const showcaseBg = (t: ShowcaseTour): string =>
  mediaBg(t.bg, t.image, t.focus);

export const SHOWCASE_TOURS: ShowcaseTour[] = [
  {
    id: "hunter",
    region: "Vineyards & cellar doors",
    name: "Hunter Valley, private",
    blurb: "Cellar doors, long lunch, and a chef who cooks to match every glass.",
    fromAud: 220,
    bg: "linear-gradient(150deg,#858d47,#35381d)",
    image: "/images/tours/hunter.webp",
    // Keep the cellar-door cottage, which sits left of centre.
    focus: "32% center",
  },
  {
    id: "beaches",
    region: "Sand, surf & a cold one",
    name: "Sydney Beaches & Brewery",
    blurb:
      "The coast at its best, finishing with a tasting paddle at a local brewery.",
    fromAud: 160,
    bg: "linear-gradient(150deg,#7d7f6e,#32332c)",
    image: "/images/tours/beaches.webp",
  },
  {
    id: "foodie",
    region: "Markets to morsels",
    name: "Half-Day Sydney Foodie",
    blurb:
      "Bakery, fish market, cheese, chocolate and a pie or two. Bring an appetite.",
    fromAud: 120,
    bg: "linear-gradient(150deg,#b4ad8a,#484537)",
    image: "/images/tours/foodie.webp",
  },
  {
    id: "highlands",
    region: "Cool-climate cellar doors",
    name: "Southern Highlands",
    blurb: "Rolling green hills, pinot and pie, and a fireside long lunch.",
    fromAud: 210,
    bg: "linear-gradient(150deg,#a59389,#423b37)",
    image: "/images/tours/highlands.webp",
  },
  {
    id: "central-coast",
    region: "Oysters & estuary",
    name: "Central Coast Oysters",
    blurb:
      "Shuck-your-own oysters on the flats, then lunch where the river meets the sea.",
    fromAud: 175,
    bg: "linear-gradient(150deg,#e1b373,#5a482e)",
    image: "/images/tours/central-coast.webp",
  },
  {
    id: "blue-mountains-day",
    region: "Clifftops & lookouts",
    name: "Blue Mountains Day Trip",
    blurb:
      "Three Sisters, a bushwalk, and a gourmet picnic on the escarpment.",
    fromAud: 180,
    bg: "linear-gradient(150deg,#82867d,#343532)",
    image: "/images/tours/blue-mountains-day.webp",
  },
  {
    id: "orange-mudgee",
    region: "High-country vines",
    name: "Orange & Mudgee",
    blurb: "Altitude wines, orchard produce and a table set among the rows.",
    fromAud: 260,
    bg: "linear-gradient(150deg,#637571,#282f2d)",
    image: "/images/tours/orange-mudgee.webp",
  },
  {
    id: "kangaroo-valley",
    region: "River, ridge & paddock",
    name: "Kangaroo Valley",
    blurb:
      "Kayaks, cheese, and a slow drive through the greenest valley in the state.",
    fromAud: 195,
    bg: "linear-gradient(150deg,#a3ac82,#414534)",
    image: "/images/tours/kangaroo-valley.webp",
    // Keep the kangaroos, which stand right of centre.
    focus: "72% center",
  },
];
