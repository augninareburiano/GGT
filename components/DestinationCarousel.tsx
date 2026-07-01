"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A "Globe Express"–style destination carousel.
 *
 * Signature effect: advancing to the next slide takes the clicked thumbnail
 * and morphs it (FLIP-style) from its exact on-screen box out to fill the
 * whole background. Once the morph lands, the background commits to that slide
 * underneath the clone, so the swap is seamless.
 *
 * Each slide's visual is driven by `bg` — a CSS background value. It's a
 * gradient here to match the rest of the site, but you can drop in a real
 * photo (`url("/photos/hunter.jpg") center/cover`) with no other changes.
 */
type Slide = {
  region: string;
  name: string;
  blurb: string;
  bg: string;
};

const SLIDES: Slide[] = [
  {
    region: "Blue Mountains · NSW",
    name: "Katoomba Ridge",
    blurb:
      "Clifftop lookouts, a gourmet picnic on the escarpment, and a chef cooking to the view.",
    bg: "linear-gradient(160deg,#8FB31E,#3C4A14)",
  },
  {
    region: "Wine Country · NSW",
    name: "Hunter Valley",
    blurb:
      "Cellar doors, a long lunch, and a glass matched to every course of the day.",
    bg: "linear-gradient(160deg,#FF7A2E,#D63E00)",
  },
  {
    region: "Coastal · NSW",
    name: "Northern Beaches",
    blurb:
      "Sand, surf and a cold one — finishing on a tasting paddle at a local brewery.",
    bg: "linear-gradient(160deg,#19B3B3,#0A6E6E)",
  },
  {
    region: "Central Tablelands · NSW",
    name: "Jenolan Caves",
    blurb:
      "A big day in the ranges, a cave tour underground, and a campfire dinner by night.",
    bg: "linear-gradient(160deg,#F4B400,#B5790A)",
  },
  {
    region: "Inner City · NSW",
    name: "Sydney Foodie",
    blurb:
      "Bakery, fish market, cheese and chocolate — a half-day grazing the best of the city.",
    bg: "linear-gradient(160deg,#5F7321,#211C24)",
  },
];

const MORPH_MS = 720; // duration of the thumbnail→background morph
const SLIDE_MS = 6000; // autoplay dwell per slide
const SLIDE_SEC = SLIDE_MS / 1000;

const fmt = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

export default function DestinationCarousel() {
  const n = SLIDES.length;
  const [index, setIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [elapsed, setElapsed] = useState(0);

  const sectionRef = useRef<HTMLElement>(null);
  const cloneRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<Record<number, HTMLButtonElement | null>>({});

  // The thumbnails show the upcoming slides in order (wrapping around).
  const order = Array.from(
    { length: Math.min(4, n - 1) },
    (_, k) => (index + 1 + k) % n,
  );

  const prefersReduced = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const morphTo = (target: number) => {
    const section = sectionRef.current;
    const clone = cloneRef.current;
    const thumb = thumbRefs.current[target];
    if (!section || !clone || !thumb) {
      setIndex(target);
      return;
    }

    setAnimating(true);
    const sr = section.getBoundingClientRect();
    const tr = thumb.getBoundingClientRect();

    // Start: sitting exactly where the thumbnail is.
    clone.style.transition = "none";
    clone.style.background = SLIDES[target].bg;
    clone.style.backgroundSize = "cover";
    clone.style.backgroundPosition = "center";
    clone.style.left = `${tr.left - sr.left}px`;
    clone.style.top = `${tr.top - sr.top}px`;
    clone.style.width = `${tr.width}px`;
    clone.style.height = `${tr.height}px`;
    clone.style.borderRadius = "16px";
    clone.style.display = "block";

    // Force a reflow so the browser registers the start box…
    void clone.offsetWidth;

    // …then animate out to fill the whole section.
    const ease = "cubic-bezier(.7,0,.2,1)";
    clone.style.transition = [
      `left ${MORPH_MS}ms ${ease}`,
      `top ${MORPH_MS}ms ${ease}`,
      `width ${MORPH_MS}ms ${ease}`,
      `height ${MORPH_MS}ms ${ease}`,
      `border-radius ${MORPH_MS}ms ease`,
    ].join(",");
    clone.style.left = "0px";
    clone.style.top = "0px";
    clone.style.width = `${sr.width}px`;
    clone.style.height = `${sr.height}px`;
    clone.style.borderRadius = "0px";

    window.setTimeout(() => {
      // Commit the background to the new slide, then hide the clone one frame
      // later so the freshly-painted background is already in place — no flash.
      setIndex(target);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          clone.style.display = "none";
          setAnimating(false);
        }),
      );
    }, MORPH_MS);
  };

  const go = (target: number) => {
    if (target === index || animating) return;
    if (prefersReduced() || !thumbRefs.current[target]) {
      setIndex(target); // fallback: plain cross-fade via the bg layers
      return;
    }
    morphTo(target);
  };

  const next = () => go((index + 1) % n);
  const prev = () => go((index - 1 + n) % n);

  // Autoplay: advance one slide after the dwell time, restart on every change.
  useEffect(() => {
    if (!playing) return;
    const id = window.setTimeout(() => go((index + 1) % n), SLIDE_MS);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, index]);

  // Elapsed readout for the timer, reset whenever the slide changes.
  useEffect(() => {
    setElapsed(0);
    if (!playing) return;
    const id = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => window.clearInterval(id);
  }, [index, playing]);

  const slide = SLIDES[index];

  return (
    <section className="dc" ref={sectionRef} id="destinations">
      {SLIDES.map((s, i) => (
        <div
          key={i}
          className="dc-bg-layer"
          style={{ background: s.bg, opacity: i === index ? 1 : 0 }}
        />
      ))}

      {/* The morphing clone lives above the background, below the UI. */}
      <div className="dc-clone" ref={cloneRef} aria-hidden />

      <div className="wrap dc-inner">
        <div className="dc-copy" key={index}>
          <p className="dc-region">{slide.region}</p>
          <h2 className="dc-title">{slide.name}</h2>
          <p className="dc-blurb">{slide.blurb}</p>
          <a href="#builder" className="btn btn-light">
            Discover location →
          </a>
        </div>

        <div className="dc-thumbs">
          {order.map((id) => (
            <button
              key={id}
              type="button"
              className="dc-thumb"
              style={{ background: SLIDES[id].bg }}
              ref={(el) => {
                thumbRefs.current[id] = el;
              }}
              onClick={() => go(id)}
              aria-label={`Go to ${SLIDES[id].name}`}
            >
              <span className="dc-cap">{SLIDES[id].name}</span>
            </button>
          ))}
        </div>

        <div className="dc-controls">
          <div className="dc-time">
            <button
              type="button"
              className="dc-play"
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? "❚❚" : "►"}
            </button>
            <span className="dc-progress">
              <span
                key={index}
                className="dc-fill"
                style={{
                  animationDuration: `${SLIDE_MS}ms`,
                  animationPlayState: playing ? "running" : "paused",
                }}
              />
            </span>
            <span className="dc-clock">
              {fmt(elapsed)} / {fmt(SLIDE_SEC)}
            </span>
          </div>

          <div className="dc-nav">
            <button
              type="button"
              onClick={prev}
              aria-label="Previous"
              disabled={animating}
            >
              ‹
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next"
              disabled={animating}
            >
              ›
            </button>
          </div>

          <div className="dc-index">
            <b>{String(index + 1).padStart(2, "0")}</b>
            <span>/ {String(n).padStart(2, "0")}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
