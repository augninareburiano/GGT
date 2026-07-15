export type Testimonial = {
  /** The review's original headline on Tripadvisor. */
  title: string;
  quote: string;
  author: string;
  /** Star rating out of 5, as shown on the source review. */
  rating: number;
  /** Where the review was originally left. Shown as attribution. */
  source: string;
};

/**
 * Guest reviews carried over verbatim from the previous site (owner-approved),
 * originally posted on Tripadvisor. Shown as attributed marketing quotes only —
 * deliberately NOT emitted as Review/AggregateRating structured data, since
 * third-party reviews aren't eligible for first-party rich results.
 */
export const TESTIMONIALS: Testimonial[] = [
  {
    title: "No food tour quite like this",
    quote:
      "This was my second tour with Jimmy, and I'd gladly go again. He prepares incredible fresh food that pairs perfectly with the wine, so you won't leave hungry! I highly recommend this tour for anyone wanting to explore Hunter Valley and enjoy top-notch Australian cuisine.",
    author: "Andrew C.",
    rating: 5,
    source: "Tripadvisor",
  },
  {
    title: "What an experience!",
    quote:
      "What a spectacular day! Jimmy guided us through the Fish Market, selecting fresh local fish before treating us to an amazing breakfast and sushi-making. In Hunter Valley, we enjoyed delightful wine pairings with his delicious recipes, all while he shared entertaining stories about the region.",
    author: "Epin2016",
    rating: 5,
    source: "Tripadvisor",
  },
  {
    title: "Amazing tour, simply a must do",
    quote:
      "This is one of the best food tours you'll ever experience. Jimmy, an incredible chef, prepares a vast amount of high-quality food, leaving you stuffed and impressed. He also shares insights while guiding you to Sydney's highlights, making this tour a must-do!",
    author: "Andrew C.",
    rating: 5,
    source: "Tripadvisor",
  },
  {
    title: "Fabulous experience for wine & food lovers",
    quote:
      "What a fabulous day trip to the Hunter Valley! We began at the Sydney Fish Markets, enjoyed a bush breakfast, and rolled sushi while sampling delicious food and wines. Jimmy, our passionate chef and guide, shared insights into Australian cuisine, and the kangaroos were a fun bonus!",
    author: "Sylvia M.",
    rating: 5,
    source: "Tripadvisor",
  },
  {
    title: "Food, fun and wine!",
    quote:
      "Fantastic and informative day! Jimmy is a gem. Permanently positive and full of tons of interesting information and insights, not to mention a fabulous chef! We had a spectacular day of food, fun and great wine. This should be 6 stars. Thank you Jimmy for a life memory. You're the best. Aussie Aussie Aussie Oy Oy Oy!",
    author: "Thomas B.",
    rating: 5,
    source: "Tripadvisor",
  },
];
