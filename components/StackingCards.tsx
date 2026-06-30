"use client";

import { useReveal } from "./useReveal";

const CARDS = [
  {
    cls: "c1",
    art: "Vineyards & cellar doors",
    title: "Hunter Valley, private",
    mini: "Cellar doors, long lunch, and a chef who cooks to match every glass.",
    from: "A$220",
  },
  {
    cls: "c2",
    art: "Sand, surf & a cold one",
    title: "Sydney Beaches & Brewery",
    mini: "The coast at its best, finishing with a tasting paddle at a local brewery.",
    from: "A$160",
  },
  {
    cls: "c3",
    art: "Markets to morsels",
    title: "Half-Day Sydney Foodie",
    mini: "Bakery, fish market, cheese, chocolate and a pie or two. Bring an appetite.",
    from: "A$120",
  },
  {
    cls: "c4",
    art: "Cliffs, caves & campfire",
    title: "Blue Mountains & Jenolan Overnight",
    mini: "A big day in the ranges, a night under canvas, a campfire dinner.",
    from: "A$320",
  },
];

export default function StackingCards() {
  const head = useReveal<HTMLDivElement>("head");

  return (
    <section className="stacksec">
      <div className="wrap">
        <div ref={head.ref} className={head.className}>
          <div>
            <p className="eyebrow">Pick a starting point</p>
            <h2>Nine ways to spend the day.</h2>
          </div>
          <a href="#" className="btn btn-light">
            See all tours
          </a>
        </div>
        <div className="cards">
          {CARDS.map((c) => (
            <div className={`card ${c.cls}`} key={c.cls}>
              <div className="art">
                <span>{c.art}</span>
              </div>
              <div className="body">
                <h3>{c.title}</h3>
                <p className="mini">{c.mini}</p>
                <p className="from">
                  from <b>{c.from}</b> / person
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
