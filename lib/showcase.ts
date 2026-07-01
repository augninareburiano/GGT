/**
 * The "Nine ways to spend the day" showcase tours.
 *
 * Single source of truth shared by the StackingCards section and the
 * DestinationCarousel thumbnails, so both always show the same tours.
 * Each `bg` is a CSS background value — swap in `url("/photo.jpg") center/cover`
 * for real photography with no other changes.
 */
export type ShowcaseTour = {
  id: string;
  /** Short caption / theme line (was the card "art" label). */
  region: string;
  name: string;
  blurb: string;
  from: string;
  bg: string;
};

export const SHOWCASE_TOURS: ShowcaseTour[] = [
  {
    id: "hunter",
    region: "Vineyards & cellar doors",
    name: "Hunter Valley, private",
    blurb: "Cellar doors, long lunch, and a chef who cooks to match every glass.",
    from: "A$220",
    bg: "linear-gradient(150deg,#8FB31E,#3C4A14)",
  },
  {
    id: "beaches",
    region: "Sand, surf & a cold one",
    name: "Sydney Beaches & Brewery",
    blurb:
      "The coast at its best, finishing with a tasting paddle at a local brewery.",
    from: "A$160",
    bg: "linear-gradient(150deg,#19B3B3,#0A6E6E)",
  },
  {
    id: "foodie",
    region: "Markets to morsels",
    name: "Half-Day Sydney Foodie",
    blurb:
      "Bakery, fish market, cheese, chocolate and a pie or two. Bring an appetite.",
    from: "A$120",
    bg: "linear-gradient(150deg,#FF7A2E,#D63E00)",
  },
  {
    id: "jenolan",
    region: "Cliffs, caves & campfire",
    name: "Blue Mountains & Jenolan Overnight",
    blurb: "A big day in the ranges, a night under canvas, a campfire dinner.",
    from: "A$320",
    bg: "linear-gradient(150deg,#F4B400,#B5790A)",
  },
];
