/**
 * The "Nine ways to spend the day" showcase tours.
 *
 * Single source of truth shared by the StackingCards section, the
 * DestinationCarousel thumbnails and the /tours gallery + detail pages, so all
 * of them always show the same tours. Each `bg` is a CSS background value —
 * swap in `url("/photo.jpg") center/cover` for real photography with no other
 * changes.
 *
 * NOTE: `duration`, `description`, `highlights` and the gallery captions are
 * placeholder copy pending Jimmy's sign-off. Prices shown on the detail pages
 * come from the bookable tour data (lib/tours.ts), never from here.
 */
export type ShowcaseTour = {
  id: string;
  /** Short caption / theme line (was the card "art" label). */
  region: string;
  name: string;
  blurb: string;
  from: string;
  bg: string;
  /**
   * Matching bookable tour id in lib/tours.ts / Firestore. When set, the detail
   * page sends you to the builder; when absent the tour has no published
   * pricing yet and the detail page offers a plain enquiry instead.
   */
  tourId?: string;
  duration: string;
  /** Longer detail-page copy, one string per paragraph. */
  description: string[];
  highlights: string[];
  /** Placeholder gallery tiles — captions only; art is derived from `bg`. */
  gallery: string[];
};

/** Guest range the builder allows (see TourBuilder MAX_GUESTS and Tour.min). */
export const GROUP_SIZE = "2–16 guests";

/**
 * Derives a placeholder gallery tile background from the tour's hero `bg` by
 * spinning the gradient angle, so tiles vary without inventing a palette per
 * tour. Once `bg` holds a real image the tiles just show that image, and each
 * tile can be given its own `url(...)` at that point.
 */
export function galleryTileBg(bg: string, index: number): string {
  const match = /^linear-gradient\((\d+)deg/.exec(bg);
  if (!match) return bg;
  const angle = (Number(match[1]) + (index + 1) * 55) % 360;
  return bg.replace(/^linear-gradient\(\d+deg/, `linear-gradient(${angle}deg`);
}

export const SHOWCASE_TOURS: ShowcaseTour[] = [
  {
    id: "hunter",
    tourId: "hunter-valley",
    region: "Vineyards & cellar doors",
    name: "Hunter Valley, private",
    blurb: "Cellar doors, long lunch, and a chef who cooks to match every glass.",
    from: "A$220",
    bg: "linear-gradient(150deg,#8FB31E,#3C4A14)",
    duration: "Full day · about 10 hours",
    description: [
      "Australia's oldest wine region, done at your own pace. We point the van north early, beat the coach tours to the good cellar doors, and spend the day tasting semillon and shiraz with the people who made it.",
      "Lunch is long and sat down, matched glass for glass. You choose how many stops — we'll read the room and adjust as the day goes.",
    ],
    highlights: [
      "Small-batch cellar doors, not the bus-tour circuit",
      "Long lunch with matched wines",
      "Door-to-door pickup from Sydney",
      "Seasonal truffle hunt available as an extra",
    ],
    gallery: ["Cellar door", "The long lunch", "Vines at golden hour"],
  },
  {
    id: "beaches",
    tourId: "beaches-brewery",
    region: "Sand, surf & a cold one",
    name: "Sydney Beaches & Brewery",
    blurb:
      "The coast at its best, finishing with a tasting paddle at a local brewery.",
    from: "A$160",
    bg: "linear-gradient(150deg,#19B3B3,#0A6E6E)",
    duration: "Full day · about 8 hours",
    description: [
      "The northern beaches strung together the way a local would drive them — headland lookouts, a swim where the water's clearest that day, and fish and chips that aren't from the tourist strip.",
      "We finish inland at a local brewery for a tasting paddle before the run home.",
    ],
    highlights: [
      "Headland lookouts between swims",
      "Lunch on the sand, not on a schedule",
      "Brewery tasting paddle to finish",
      "Surf lesson available as an extra",
    ],
    gallery: ["The headland", "Lunch on the sand", "Tasting paddle"],
  },
  {
    id: "foodie",
    tourId: "foodie",
    region: "Markets to morsels",
    name: "Half-Day Sydney Foodie",
    blurb:
      "Bakery, fish market, cheese, chocolate and a pie or two. Bring an appetite.",
    from: "A$120",
    bg: "linear-gradient(150deg,#FF7A2E,#D63E00)",
    duration: "Half day · about 5 hours",
    description: [
      "A short, greedy loop through the city's best eating. We start at a bakery before the queue forms, work through the fish market, and keep going until someone taps out.",
      "The best half-day if you've only got one morning in Sydney and want to spend it eating.",
    ],
    highlights: [
      "Bakery stop ahead of the queue",
      "Fish market tasting",
      "Cheese and chocolate flight",
      "Back in the city by mid-afternoon",
    ],
    gallery: ["The bakery", "Fish market", "Cheese counter"],
  },
  {
    id: "jenolan",
    tourId: "jenolan",
    region: "Cliffs, caves & campfire",
    name: "Blue Mountains & Jenolan Overnight",
    blurb: "A big day in the ranges, a night under canvas, a campfire dinner.",
    from: "A$320",
    bg: "linear-gradient(150deg,#F4B400,#B5790A)",
    duration: "2 days · 1 night",
    description: [
      "The full mountains, with time to actually stop. Clifftop lookouts and a proper bushwalk on day one, then down to the Jenolan Caves and a campsite with a fire.",
      "Dinner is cooked over the coals and you wake up in the ranges instead of on a coach. Camp gear and bedding can be added if you're travelling light.",
    ],
    highlights: [
      "Clifftop lookouts and a guided bushwalk",
      "Jenolan Caves tour",
      "Campfire dinner under the escarpment",
      "Camp gear and bedding available as extras",
    ],
    gallery: ["The escarpment", "Jenolan Caves", "Camp at dusk"],
  },
  {
    id: "highlands",
    region: "Cool-climate cellar doors",
    name: "Southern Highlands",
    blurb: "Rolling green hills, pinot and pie, and a fireside long lunch.",
    from: "A$210",
    bg: "linear-gradient(150deg,#8E4585,#3B1E4A)",
    duration: "Full day · about 9 hours",
    description: [
      "Cool-climate country an hour and a half south — pinot and chardonnay, hedgerows, and villages that look like someone moved a piece of England onto a ridge.",
      "The day is built around a fireside long lunch, with cellar doors either side of it.",
    ],
    highlights: [
      "Cool-climate pinot and chardonnay",
      "Fireside long lunch",
      "Village stops between cellar doors",
      "Best in the cooler months",
    ],
    gallery: ["Cellar door", "Fireside lunch", "The hedgerows"],
  },
  {
    id: "central-coast",
    region: "Oysters & estuary",
    name: "Central Coast Oysters",
    blurb:
      "Shuck-your-own oysters on the flats, then lunch where the river meets the sea.",
    from: "A$175",
    bg: "linear-gradient(150deg,#2E6E9E,#0E3B5C)",
    duration: "Full day · about 8 hours",
    description: [
      "Out onto the oyster flats with the growers, shucking your own straight out of the water — about as fresh as it is possible to eat one.",
      "Lunch afterwards sits where the river opens into the sea, with the rest of the day spent working slowly back down the coast.",
    ],
    highlights: [
      "Shuck your own on the flats",
      "Meet the growers",
      "Estuary lunch",
      "Tides set the timing — we'll confirm the hour",
    ],
    gallery: ["The flats", "Shucking", "Estuary lunch"],
  },
  {
    id: "blue-mountains-day",
    tourId: "blue-mountains-day",
    region: "Clifftops & lookouts",
    name: "Blue Mountains Day Trip",
    blurb:
      "Three Sisters, a bushwalk, and a gourmet picnic on the escarpment.",
    from: "A$180",
    bg: "linear-gradient(150deg,#C7522A,#6E2412)",
    duration: "Full day · about 9 hours",
    description: [
      "The mountains in a day, without the coach-tour shuffle. The Three Sisters early before the crowds, a bushwalk pitched at whoever's in the van, and lookouts most day trips drive straight past.",
      "Lunch is a gourmet picnic laid out on the escarpment. Scenic World and a seasonal truffle hunt can be added on.",
    ],
    highlights: [
      "Three Sisters ahead of the crowds",
      "Bushwalk pitched to your group",
      "Gourmet picnic on the escarpment",
      "Scenic World pass available as an extra",
    ],
    gallery: ["Three Sisters", "The bushwalk", "Picnic on the cliff"],
  },
  {
    id: "orange-mudgee",
    region: "High-country vines",
    name: "Orange & Mudgee",
    blurb: "Altitude wines, orchard produce and a table set among the rows.",
    from: "A$260",
    bg: "linear-gradient(150deg,#9E2B45,#4A1020)",
    duration: "Full day · about 11 hours",
    description: [
      "The high country west of the range, where altitude does something to the wine you can taste in the glass. Orchard produce, cool-climate reds, and far fewer people than the Hunter.",
      "Lunch is set among the rows. It's a long day in the van — worth it, but come prepared for the drive.",
    ],
    highlights: [
      "Altitude cool-climate wines",
      "Orchard produce in season",
      "Lunch set among the vines",
      "Long driving day — early start",
    ],
    gallery: ["The rows", "Orchard produce", "Lunch among the vines"],
  },
  {
    id: "kangaroo-valley",
    region: "River, ridge & paddock",
    name: "Kangaroo Valley",
    blurb:
      "Kayaks, cheese, and a slow drive through the greenest valley in the state.",
    from: "A$195",
    bg: "linear-gradient(150deg,#3FA796,#155246)",
    duration: "Full day · about 9 hours",
    description: [
      "Down the pass into the greenest valley in the state. Kayaks on the river in the morning, then cheese and paddock produce from the people making it.",
      "The drive in and out is half the point — we take the slow road both ways.",
    ],
    highlights: [
      "Morning kayak on the river",
      "Cheese and paddock produce",
      "The slow road over the pass",
      "Easy pace, good for mixed groups",
    ],
    gallery: ["The river", "Cheese room", "Over the pass"],
  },
];

/** Look up a showcase tour by its route id. */
export function getShowcaseTour(id: string): ShowcaseTour | undefined {
  return SHOWCASE_TOURS.find((t) => t.id === id);
}
