"use client";

import { useReveal } from "./useReveal";
import { TESTIMONIALS, type Testimonial } from "@/lib/testimonials";

export default function Testimonials() {
  const head = useReveal<HTMLDivElement>();

  return (
    <section className="wrap tmns">
      <div ref={head.ref} className={head.className}>
        <p className="eyebrow">In their words</p>
        <h2 className="tmns-title">Guests on tour with Jimmy</h2>
      </div>
      <div className="tmns-grid">
        {TESTIMONIALS.map((t, i) => (
          <TestimonialCard key={i} {...t} />
        ))}
      </div>
    </section>
  );
}

function TestimonialCard({ title, quote, author, rating, source }: Testimonial) {
  const card = useReveal<HTMLElement>();
  return (
    <figure ref={card.ref} className={`tmn ${card.className}`}>
      <h3 className="tmn-title">{title}</h3>
      <div className="tmn-stars" role="img" aria-label={`${rating} out of 5 stars`}>
        {"★".repeat(rating)}
      </div>
      <blockquote>{quote}</blockquote>
      <figcaption>
        <span className="tmn-author">{author}</span>
        <span className="tmn-source">via {source}</span>
      </figcaption>
    </figure>
  );
}
