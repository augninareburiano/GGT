"use client";

import { useReveal } from "./useReveal";

type Review = {
  quote: string;
  name: string;
  detail: string;
  source: string;
};

// Placeholder testimonials — swap for real ones (e.g. pulled from Google /
// TripAdvisor). Keep them short; the card layout is tuned for ~2–3 lines.
const REVIEWS: Review[] = [
  {
    quote:
      "The best day of our whole Australia trip. Jimmy cooked breakfast on a hilltop and matched every wine himself — we flew home and still talk about it.",
    name: "Priya & Anand",
    detail: "Singapore · Hunter Valley tour",
    source: "Google",
  },
  {
    quote:
      "Booked a private tour for six from the UK. Everything door-to-door, no fuss, and the truffle hunt was unreal. Worth every dollar.",
    name: "Hannah W.",
    detail: "London, UK · Private tour",
    source: "TripAdvisor",
  },
  {
    quote:
      "Small group, real food, no rushing between cellar doors. You can tell it's owner-run. We'll be back with friends next year.",
    name: "The Tanakas",
    detail: "Osaka, Japan · Wednesday tour",
    source: "Google",
  },
];

function Stars() {
  return (
    <div className="stars" aria-label="Rated 5 out of 5">
      {"★★★★★".split("").map((s, i) => (
        <span key={i} aria-hidden="true">
          {s}
        </span>
      ))}
    </div>
  );
}

export default function Reviews() {
  const head = useReveal<HTMLDivElement>("head");
  const c1 = useReveal<HTMLElement>();
  const c2 = useReveal<HTMLElement>();
  const c3 = useReveal<HTMLElement>();
  const cards = [c1, c2, c3];

  return (
    <section className="reviews">
      <div className="wrap">
        <div ref={head.ref} className={head.className}>
          <p className="eyebrow">Loved by guests worldwide</p>
          <h2>Five stars, from five continents.</h2>
        </div>
        <div className="review-grid">
          {REVIEWS.map((r, i) => (
            <figure
              key={r.name}
              ref={cards[i].ref}
              className={`review-card ${cards[i].className}`}
            >
              <Stars />
              <blockquote>&ldquo;{r.quote}&rdquo;</blockquote>
              <figcaption>
                <b>{r.name}</b>
                <span>{r.detail}</span>
                <span className="review-source">via {r.source}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
