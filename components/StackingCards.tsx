"use client";

import Link from "next/link";
import { useReveal } from "./useReveal";
import { SHOWCASE_TOURS } from "@/lib/showcase";

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
          <Link href="/tours" className="btn btn-light">
            See all tours
          </Link>
        </div>
        <div className="cards">
          {SHOWCASE_TOURS.map((c) => (
            <div className="card" key={c.id}>
              <div className="art" style={{ background: c.bg }}>
                <span>{c.region}</span>
              </div>
              <div className="body">
                <h3>{c.name}</h3>
                <p className="mini">{c.blurb}</p>
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
