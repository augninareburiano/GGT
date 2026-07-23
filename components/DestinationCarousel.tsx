"use client";

import { useEffect, useRef, useState } from "react";
import Price from "./Price";
import { SHOWCASE_TOURS, showcaseBg, type ShowcaseTour } from "@/lib/showcase";

/**
 * A "Globe Express"–style destination carousel that doubles as the landing hero.
 *
 * Two motions work together on each advance:
 *  1. Morph — the clicked/leading thumbnail expands (FLIP-style) from its exact
 *     on-screen box out to fill the whole background, then the background
 *     commits to that slide underneath it. See `morphTo`.
 *  2. Scroll — the thumbnail strip slides left by one card, the leading card
 *     having morphed away and a fresh card entering from the right.
 *
 * Slides are the shared "Nine ways to spend the day" tours (lib/showcase).
 */
const MORPH_MS = 720; // duration of both the morph and the strip slide
const SLIDE_MS = 6000; // autoplay dwell per slide
const SLIDE_SEC = SLIDE_MS / 1000;
const VISIBLE = 3; // thumbnails fully in view; one more is rendered to slide in
const EASE = "cubic-bezier(.7,0,.2,1)";
const KEN_BURNS_SCALE = 1.085; // how far the active photo drifts over its dwell

// Cursor parallax, in px at full deflection. Both stay under the 24px bleed
// on .dc-bg-parallax so no edge can be pulled into frame.
const PARALLAX_BG = 14;
const PARALLAX_COPY = 7;
const PARALLAX_EASE = 0.06; // per-frame approach to the cursor; lower = lazier

const fmt = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/**
 * Where the Ken Burns zoom converges.
 *
 * Horizontally it reuses the tour's `focus` point, so the drift pushes *into*
 * the subject (the cellar door, the kangaroos) rather than the middle of a
 * paddock. Vertically it alternates, so nine consecutive slides don't all move
 * the same way.
 */
const kenBurnsOrigin = (t: ShowcaseTour, i: number): string => {
  const x = t.focus?.trim().split(/\s+/)[0] ?? "50%";
  return `${x} ${i % 2 === 0 ? "72%" : "28%"}`;
};

export default function DestinationCarousel() {
  const slides = SHOWCASE_TOURS;
  const n = slides.length;

  const [index, setIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [morphingId, setMorphingId] = useState<number | null>(null);
  // The copy is driven off its own index, not `index`. `index` doesn't change
  // until the morph finishes (finalize), so keying the copy to it made the text
  // swap only after the photo had already landed. copyIndex is moved the instant
  // the morph begins, so the headline animates in together with the photo.
  const [copyIndex, setCopyIndex] = useState(0);

  const sectionRef = useRef<HTMLElement>(null);
  const cloneRef = useRef<HTMLDivElement>(null);
  const clonePhotoRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const photoRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const kenBurnsRef = useRef<Record<number, Animation | null>>({});
  const bgParallaxRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const copyParallaxRef = useRef<HTMLDivElement>(null);
  // Mirror of `animating` that `go` can read live — the autoplay timeout closes
  // over stale state, so the ref is what actually gates re-entry.
  const animatingRef = useRef(false);
  const setAnim = (v: boolean) => {
    animatingRef.current = v;
    setAnimating(v);
  };

  // Upcoming slides in order; one extra is rendered so it can slide in from the
  // right during the transition (wraps around).
  const renderCount = Math.min(VISIBLE + 1, n);
  const windowIds = Array.from(
    { length: renderCount },
    (_, k) => (index + 1 + k) % n,
  );

  const prefersReduced = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Land on the new slide: re-index, snap the strip back to rest, drop the clone.
  const finalize = (target: number) => {
    const track = trackRef.current;
    if (track) {
      track.style.transition = "none";
      track.style.transform = "translateX(0)";
    }
    setMorphingId(null);
    setIndex(target);

    const clone = cloneRef.current;
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (clone) clone.style.display = "none";
        setAnim(false);
      }),
    );
  };

  /** Slide the thumbnail strip left by exactly one card. True if it animated. */
  const slideStrip = (): boolean => {
    const track = trackRef.current;
    const first = thumbRefs.current[windowIds[0]];
    const second = thumbRefs.current[windowIds[1]];
    if (!track || !first || !second) return false;
    const step =
      second.getBoundingClientRect().left - first.getBoundingClientRect().left;
    track.style.transition = "none";
    track.style.transform = "translateX(0)";
    void track.offsetWidth; // reflow so the rest position is registered
    track.style.transition = `transform ${MORPH_MS}ms ${EASE}`;
    track.style.transform = `translateX(-${step}px)`;
    return true;
  };

  const morphTo = (target: number) => {
    const section = sectionRef.current;
    const clone = cloneRef.current;
    const thumb = thumbRefs.current[target];
    if (!section || !clone || !thumb) {
      setIndex(target);
      setCopyIndex(target);
      return;
    }

    setAnim(true);
    // Move the copy now, at the start of the morph, so its entrance runs while
    // the photo grows rather than after it commits.
    setCopyIndex(target);
    const isNext = target === (index + 1) % n;
    const sr = section.getBoundingClientRect();
    const tr = thumb.getBoundingClientRect();

    // 1) Morph the thumbnail out to fill the background.
    const photo = clonePhotoRef.current;
    clone.style.transition = "none";
    if (photo) {
      photo.style.transition = "none";
      photo.style.background = showcaseBg(slides[target]);
      photo.style.backgroundSize = "cover";
      photo.style.backgroundPosition = "center";
      // Starts at the card's softness and lands at the backdrop's. The blur
      // has to travel with the box: hold either value for the whole morph and
      // the photo visibly snaps at one end or the other.
      photo.style.filter = "blur(var(--dc-thumb-blur))";
    }
    clone.style.left = `${tr.left - sr.left}px`;
    clone.style.top = `${tr.top - sr.top}px`;
    clone.style.width = `${tr.width}px`;
    clone.style.height = `${tr.height}px`;
    // Read rather than hardcode — the card radius is fluid now.
    clone.style.borderRadius = getComputedStyle(thumb).borderRadius;
    clone.style.display = "block";
    void clone.offsetWidth; // reflow so the start box is registered
    if (photo) {
      photo.style.transition = `filter ${MORPH_MS}ms ${EASE}`;
      photo.style.filter = "blur(var(--dc-blur))";
    }
    clone.style.transition = [
      `left ${MORPH_MS}ms ${EASE}`,
      `top ${MORPH_MS}ms ${EASE}`,
      `width ${MORPH_MS}ms ${EASE}`,
      `height ${MORPH_MS}ms ${EASE}`,
      `border-radius ${MORPH_MS}ms ease`,
    ].join(",");
    clone.style.left = "0px";
    clone.style.top = "0px";
    clone.style.width = `${sr.width}px`;
    clone.style.height = `${sr.height}px`;
    clone.style.borderRadius = "0px";

    // 2) On a natural "next", slide the strip left by one card as the leading
    //    card morphs away.
    if (isNext) {
      setMorphingId(target); // hide the morphing card so only the clone shows
      slideStrip();
    }

    window.setTimeout(() => finalize(target), MORPH_MS);
  };

  const go = (target: number) => {
    if (target === index || animatingRef.current) return;
    if (prefersReduced() || !thumbRefs.current[target]) {
      setIndex(target); // fallback: straight cut between bg layers
      setCopyIndex(target); // and the copy cuts with it, no cross-fade
      return;
    }
    morphTo(target);
  };

  const next = () => go((index + 1) % n);
  const prev = () => go((index - 1 + n) % n);

  // Autoplay: advance after the dwell, restart on every change.
  useEffect(() => {
    if (!playing) return;
    const id = window.setTimeout(() => go((index + 1) % n), SLIDE_MS);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, index]);

  // Ken Burns: the active photo drifts for as long as the slide is up, so the
  // 6s dwell is never a still frame. Driven by WAAPI rather than a CSS class
  // because `fill: "forwards"` leaves the outgoing photo at its final scale —
  // a CSS animation would unset and snap it back mid cross-fade.
  //
  // Every slide starts at scale(1) so it lines up with the morph clone, which
  // hands over at its natural size. Scale only ever grows, so no edge gaps.
  useEffect(() => {
    const el = photoRefs.current[index];
    if (!el || prefersReduced()) return;
    // Drop this layer's previous run before starting another, so repeat visits
    // to a slide don't stack fill-forwards animations on the same element.
    kenBurnsRef.current[index]?.cancel();
    kenBurnsRef.current[index] = el.animate(
      [{ transform: "scale(1)" }, { transform: `scale(${KEN_BURNS_SCALE})` }],
      { duration: SLIDE_MS + MORPH_MS, easing: "linear", fill: "forwards" },
    );
    // Deliberately no cleanup: the outgoing photo must hold its final scale
    // while it cross-fades out. Cancelling here would snap it back to 1.
  }, [index]);

  // Pausing the carousel pauses the drift too, so the photo doesn't keep
  // moving behind a stopped progress bar.
  useEffect(() => {
    const anim = kenBurnsRef.current[index];
    if (!anim) return;
    if (playing) anim.play();
    else anim.pause();
  }, [index, playing]);

  // Cursor parallax. Kept off React state — this runs every frame, and a
  // re-render per frame would be absurd. Pointer-coarse devices have no cursor
  // to follow, so they skip it entirely.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || prefersReduced()) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let targetX = 0,
      targetY = 0,
      curX = 0,
      curY = 0,
      raf = 0;

    const onMove = (e: MouseEvent) => {
      const r = section.getBoundingClientRect();
      targetX = ((e.clientX - r.left) / r.width - 0.5) * 2;
      targetY = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    const onLeave = () => {
      targetX = 0;
      targetY = 0;
    };

    const tick = () => {
      curX += (targetX - curX) * PARALLAX_EASE;
      curY += (targetY - curY) * PARALLAX_EASE;
      for (const el of Object.values(bgParallaxRefs.current)) {
        if (el)
          el.style.transform = `translate3d(${curX * PARALLAX_BG}px, ${curY * PARALLAX_BG * 0.6}px, 0)`;
      }
      // Copy drifts against the photo — that opposition is what reads as depth.
      const copy = copyParallaxRef.current;
      if (copy)
        copy.style.transform = `translate3d(${curX * -PARALLAX_COPY}px, ${curY * -PARALLAX_COPY * 0.6}px, 0)`;
      raf = requestAnimationFrame(tick);
    };

    section.addEventListener("mousemove", onMove);
    section.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(tick);
    return () => {
      section.removeEventListener("mousemove", onMove);
      section.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Timer readout, reset whenever the slide changes.
  useEffect(() => {
    setElapsed(0);
    if (!playing) return;
    const id = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => window.clearInterval(id);
  }, [index, playing]);

  // Broadcast the active slide so the page backdrop (NatureBackdrop) can mirror
  // whichever tour is currently playing. Fires for index 0 on mount too, which
  // the backdrop treats as a no-op since it already starts on that slide.
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("ggt:slide", {
        detail: { bg: showcaseBg(slides[index]) },
      }),
    );
  }, [index, slides]);

  // The copy tracks copyIndex, not index, so it can lead the background commit.
  const slide = slides[copyIndex];

  return (
    <section className="dc" ref={sectionRef} id="destinations">
      {slides.map((s, i) => (
        <div
          key={i}
          className={i === index ? "dc-bg-layer is-active" : "dc-bg-layer"}
        >
          <div
            className="dc-bg-parallax"
            ref={(el) => {
              bgParallaxRefs.current[i] = el;
            }}
          >
            {/* Own element so the Ken Burns scale and the parallax translate
                don't overwrite each other — one transform per ring. */}
            <div
              className="dc-bg-photo"
              ref={(el) => {
                photoRefs.current[i] = el;
              }}
              style={{
                background: showcaseBg(s),
                transformOrigin: kenBurnsOrigin(s, i),
              }}
            />
          </div>
        </div>
      ))}

      {/* Bottom scrim keeps the controls legible over bright slides. */}
      <div className="dc-scrim" aria-hidden />

      {/* The morphing clone lives above the background, below the UI. Its photo
          is a separate inset child so the blur can't feather the clone's own
          corners as it grows (see .dc-clone-photo). */}
      <div className="dc-clone" ref={cloneRef} aria-hidden>
        <div className="dc-clone-photo" ref={clonePhotoRef} />
      </div>

      <div className="wrap dc-inner">
        {/* Wrapper carries the parallax so it can't collide with the fadeUp
            animation on .dc-copy, which also writes transform. */}
        <div className="dc-copy-parallax" ref={copyParallaxRef}>
        <div className="dc-copy" key={copyIndex}>
          <p className="dc-region">{slide.region}</p>
          <h2 className="dc-title">{slide.name}</h2>
          <p className="dc-blurb">{slide.blurb}</p>
          <div className="dc-cta">
            <a
              href="#builder"
              className="btn btn-primary"
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent("ggt:prefill-tour", {
                    detail: { id: slide.id, name: slide.name },
                  }),
                )
              }
            >
              <span className="btn-badge" aria-hidden>
                →
              </span>
              Build your tour
            </a>
            <a href="#destinations" className="btn btn-light">
              Discover location
            </a>
          </div>
        </div>
        </div>

        <div className="dc-thumbs">
          <div className="dc-track" ref={trackRef}>
            {windowIds.map((id, k) => (
              <button
                key={`${id}-${k}`}
                type="button"
                className={k === 0 ? "dc-thumb dc-thumb-next" : "dc-thumb"}
                style={{ opacity: id === morphingId ? 0 : 1 }}
                ref={(el) => {
                  thumbRefs.current[id] = el;
                }}
                onClick={() => go(id)}
                tabIndex={k >= VISIBLE ? -1 : 0}
                aria-label={`Go to ${slides[id].name}`}
              >
                {/* The photo is its own layer so the card's blur doesn't take
                    the caption with it. */}
                <span
                  className="dc-thumb-photo"
                  style={{ background: showcaseBg(slides[id]) }}
                />
                <span className="dc-thumb-meta">
                  <span className="dc-thumb-region">{slides[id].region}</span>
                  <span className="dc-cap">{slides[id].name}</span>
                  <span className="dc-price">
                    <span className="dc-from">from</span>{" "}
                    <Price aud={slides[id].fromAud} />
                  </span>
                </span>
              </button>
            ))}
          </div>
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
              {fmt(Math.min(elapsed, SLIDE_SEC))} / {fmt(SLIDE_SEC)}
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
