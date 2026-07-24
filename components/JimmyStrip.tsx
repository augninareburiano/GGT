"use client";

import { useReveal } from "./useReveal";
import { mediaBg } from "@/lib/media";
import TrustBadges from "./TrustBadges";

// The gradient stays behind as a fallback while this loads.
const JIMMY_IMAGE: string | undefined = "/images/jimmy.webp";

// The two country shots that bracket him. Smaller and set back, so the middle
// print stays the subject — these are the road he drives, not the story.
const SHOTS = [
  {
    src: "/images/tours/blue-mountains-day.webp",
    alt: "The Three Sisters above the Blue Mountains valley",
    fallback: "linear-gradient(150deg,#6d7f8c,#2f3a3f)",
  },
  {
    src: "/images/tours/kangaroo-valley.webp",
    alt: "Kangaroos grazing between the vines",
    fallback: "linear-gradient(150deg,#8f9a5e,#39401f)",
  },
];

// Loose snaps laid under the card. The stack beside it is all country, so
// these are the other half of the day — what he cooks and what he pours.
// Square crops, because a scrapbook corner is trimmed by hand, not to 3:2.
const SNAPS = [
  {
    src: "/images/tours/central-coast.webp",
    alt: "Scallops grilled in the shell",
    fallback: "linear-gradient(150deg,#c2a06a,#5c4526)",
    focus: "center",
  },
  {
    src: "/images/creme-brulee-and-white-wine-1024x439-1.jpg",
    alt: "Two glasses of white wine on a timber bench",
    // The glasses sit left of centre in a very wide frame; hold them.
    fallback: "linear-gradient(150deg,#8d8f6a,#2b3330)",
    focus: "38% center",
  },
  {
    src: "/images/tours/hunter.webp",
    alt: "A cellar door at the end of the vines",
    fallback: "linear-gradient(150deg,#7d9455,#2e3a22)",
    focus: "34% center",
  },
];

// Label/value rows on the record card. Mono and ruled, so the section reads
// like a filed record of the man rather than marketing copy.
const SPECS: [string, string][] = [
  ["Host", "Jimmy — owner, driver & head cook"],
  ["On the road", "30 years"],
  ["Vehicles", "Small — never a coach"],
  ["Menus", "Written by hand"],
];

export default function JimmyStrip() {
  const strip = useReveal<HTMLDivElement>("jimmy");

  return (
    <section className="wrap">
      <div ref={strip.ref} className={strip.className}>
        {/* Micro-type running heads, pinned to the corners above the spread. */}
        <div className="jimmy-head">
          <p className="eyebrow">Owner-operated</p>
          <p className="jimmy-place mono">Hunter Valley · NSW</p>
        </div>
        {/* The awards take the band the "Hi, I'm Jimmy." headline used to fill,
            directly under the running heads. The dossier card's own h3 below
            carries the section's heading now. */}
        <TrustBadges />

        {/* The spread: a dossier card, and a strip of three prints pinned
            beside it. Jimmy's is the middle one — widest, straightest, and the
            only one that breaks left across the card. */}
        <div className="jimmy-scrap">
          <div>
            <article className="jimmy-card">
              {/* A plain div, not <header>: the global `header {}` rule styles
                  every header element as the cream nav bar — sticky, blurred,
                  z-index 60 — which painted a light slab behind this row. */}
              <div className="jimmy-card-head">
                <h3>Your driver, your chef, your guide</h3>
              </div>

              <dl className="jimmy-specs">
                {SPECS.map(([label, value]) => (
                  <div key={label}>
                    <dt className="mono">{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>

              <div className="jimmy-note">
                <p className="jimmy-label mono">About</p>
                <p className="jimmy-lead">
                  Thirty years cooking and guiding, in small vehicles, never a
                  coach. Every tour is mine, start to finish — that&apos;s the
                  whole point.
                </p>
              </div>

              <p className="jimmy-sign">
                Sydney&rsquo;s Best Hunter Valley tour
              </p>
            </article>

            {/* Torn-off ticket, stepped past the card's bottom-left corner. */}
            <p className="jimmy-rating">
              <span className="mono">Guest rating 5.0 / 5</span>
              <span className="s" aria-hidden="true">
                ★★★★★
              </span>
              <span className="mono dim">via Tripadvisor</span>
            </p>
          </div>

          {/* Six pictures in three bands: the country he drives through, him,
              then the table he sets. Jimmy's print is the widest and sits
              between the two, so it stays the subject however many snaps
              surround it. */}
          <div className="jimmy-stack">
            <div className="jimmy-pair">
              {SHOTS.map((shot, i) => (
                <figure
                  key={shot.src}
                  className={`jimmy-shot${i ? " is-low" : ""}`}
                >
                  <div
                    className="shot-img"
                    role="img"
                    aria-label={shot.alt}
                    style={{ background: mediaBg(shot.fallback, shot.src) }}
                  />
                </figure>
              ))}
            </div>

            <figure className="jimmy-print">
              <span className="jimmy-tape" aria-hidden="true" />
              {/* Wraps the picture alone, so the credit can be anchored to the
                  photo's bottom edge rather than the print's lower margin. */}
              <div className="jimmy-frame">
                <div
                  className="avatar"
                  role="img"
                  aria-label="Jimmy, in a Hunter Valley vineyard"
                  style={{
                    background: mediaBg(
                      "linear-gradient(150deg,#969477,#3c3b30)",
                      JIMMY_IMAGE,
                    ),
                  }}
                />
                {/* Set straight onto the photo, no tag — the way a press
                    picture is credited in its own corner. */}
                <span className="jimmy-callout" aria-hidden="true">
                  Jimmy <em>/ owner &amp; head cook</em>
                </span>
              </div>
              <Seal />
              <figcaption>thirty years on this road</figcaption>
            </figure>

            {/* Three small snaps dealt under the print's lower edge. Stepped
                and counter-tilted so they read as laid down by hand rather
                than set in a row. */}
            <div className="jimmy-snaps">
              {SNAPS.map((snap) => (
                <figure key={snap.src} className="jimmy-snap">
                  <div
                    className="shot-img"
                    role="img"
                    aria-label={snap.alt}
                    style={{
                      background: mediaBg(snap.fallback, snap.src, snap.focus),
                    }}
                  />
                </figure>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Circular rubber stamp, pressed over the print's edge. */
function Seal() {
  return (
    <svg
      className="jimmy-seal"
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="50" cy="50" r="49" className="jimmy-seal-disc" />
      <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="1" />
      <path
        id="jimmy-seal-ring"
        d="M 10,50 A 40,40 0 1 1 90,50 A 40,40 0 1 1 10,50"
      />
      <text fill="currentColor" fontSize="8" letterSpacing="1.1" className="jimmy-seal-text">
        <textPath href="#jimmy-seal-ring" startOffset="1%">
          GOURMET GETAWAY · HUNTER VALLEY · NSW ·
        </textPath>
      </text>
      <text x="50" y="47" textAnchor="middle" className="jimmy-seal-big" fill="currentColor">
        30
      </text>
      <text x="50" y="60" textAnchor="middle" className="jimmy-seal-sub" fill="currentColor">
        YEARS
      </text>
    </svg>
  );
}
