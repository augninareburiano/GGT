"use client";

import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { useRef, useState } from "react";
import { useReveal } from "./useReveal";
import { TESTIMONIALS, type Testimonial } from "@/lib/testimonials";

// Small per-card variety so the postcards look hand-placed, not machine-set.
const TILTS = [-1.5, 1, -1.1, 1.3, -1.2, 1];
const MOTIFS = ["🍷", "🐟", "🥂", "🏔️", "🍇", "🧀"];
const DRAG_THRESHOLD = 110;

export default function Testimonials() {
  const head = useReveal<HTMLDivElement>();
  const stageRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startX: 0, moved: 0 });
  const [active, setActive] = useState(0);
  const [dragX, setDragX] = useState(0);
  const count = TESTIMONIALS.length;

  const next = () => setActive((a) => (a + 1) % count);
  const prev = () => setActive((a) => (a - 1 + count) % count);

  // Where card `i` sits relative to the front of the deck (0 = front).
  const orderOf = (i: number) => (i - active + count) % count;

  const slotStyle = (i: number): CSSProperties => {
    const o = orderOf(i);
    const tilt = TILTS[i % TILTS.length];
    if (o === 0) {
      return {
        transform: `translate(-50%,-50%) translateX(${dragX}px) rotate(${tilt + dragX * 0.03}deg)`,
        zIndex: 200,
        opacity: 1,
      };
    }
    const c = Math.min(o, 4);
    const dir = c % 2 ? 1 : -1;
    return {
      transform: `translate(-50%,-50%) translate(${dir * c * 10}px, ${c * 14}px) scale(${1 - c * 0.05}) rotate(${dir * c * 2.2}deg)`,
      zIndex: 200 - o,
      opacity: o > 3 ? 0 : 1,
      pointerEvents: "none",
    };
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    drag.current = { active: true, startX: e.clientX, moved: 0 };
    stageRef.current?.classList.add("grabbing");
    stageRef.current?.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current.active) return;
    drag.current.moved = e.clientX - drag.current.startX;
    setDragX(drag.current.moved);
  };
  const onPointerUp = () => {
    if (!drag.current.active) return;
    const dx = drag.current.moved;
    drag.current.active = false;
    stageRef.current?.classList.remove("grabbing");
    if (Math.abs(dx) < 8) next(); // tap to flip
    else if (dx <= -DRAG_THRESHOLD) next();
    else if (dx >= DRAG_THRESHOLD) prev();
    setDragX(0);
  };

  return (
    <section className="tmns" id="reviews">
      <div className="tmns-inner wrap">
        <div ref={head.ref} className={`tmns-aside ${head.className}`}>
          <p className="eyebrow">Postcards from the road</p>
          <h2 className="tmns-title">Guests on tour with Jimmy</h2>
          <p className="tmns-lead">
            Don&apos;t just take our word for it — here&apos;s what guests wrote
            after a day on the road with Jimmy, straight from their Tripadvisor
            reviews.
          </p>
          <p className="tmns-badge">
            <span className="s" aria-hidden="true">
              ★★★★★
            </span>
            <span>Loved by guests on Tripadvisor</span>
          </p>
          <div className="tmns-controls">
            <button className="tmns-btn" onClick={prev} aria-label="Previous testimonial">
              ‹
            </button>
            <span className="tmns-index" aria-hidden="true">
              {String(active + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
            </span>
            <button className="tmns-btn" onClick={next} aria-label="Next testimonial">
              ›
            </button>
          </div>
          <a href="#builder" className="btn btn-ghost tmns-cta">
            Build your tour →
          </a>
        </div>

        <div className="tmns-deck">
          <div
            ref={stageRef}
            className="tmns-stage"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            role="group"
            aria-roledescription="carousel"
            aria-label="Guest testimonials"
          >
            {TESTIMONIALS.map((t, i) => (
              <Postcard
                key={i}
                index={i}
                front={orderOf(i) === 0}
                style={slotStyle(i)}
                {...t}
              />
            ))}
          </div>
          <p className="tmns-hint">Drag a card, tap to flip, or use the arrows</p>
        </div>
      </div>
    </section>
  );
}

function Postcard({
  index,
  front,
  style,
  title,
  quote,
  author,
  rating,
  source,
}: Testimonial & { index: number; front: boolean; style: CSSProperties }) {
  return (
    <figure className={`tmn${front ? " is-front" : ""}`} style={style} aria-hidden={!front}>
      <div className="tmn-msg">
        <h3 className="tmn-title">{title}</h3>
        <div className="tmn-stars" role="img" aria-label={`${rating} out of 5 stars`}>
          {"★".repeat(rating)}
        </div>
        <blockquote>{quote}</blockquote>
        <p className="tmn-sign">— {author}</p>
      </div>

      <div className="tmn-post">
        <Postmark id={index} />
        <div className="tmn-stamp" aria-hidden="true">
          <span className="emoji">{MOTIFS[index % MOTIFS.length]}</span>
          <span className="denom">{"★".repeat(rating)}</span>
          <span className="par">PAR AVION</span>
        </div>
        <p className="tmn-via">via {source}</p>
      </div>
    </figure>
  );
}

/** Circular ink postmark, stamped over the postage stamp. */
function Postmark({ id }: { id: number }) {
  const ring = `pm-ring-${id}`;
  return (
    <svg className="tmn-mark" viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="50" cy="50" r="36" stroke="currentColor" strokeWidth="1" />
      <path id={ring} d="M 9,50 A 41,41 0 1 1 91,50 A 41,41 0 1 1 9,50" />
      <text
        className="tmn-mark-text"
        fill="currentColor"
        fontSize="8.2"
        letterSpacing="1.1"
      >
        <textPath href={`#${ring}`} startOffset="1%">
          GOURMET GETAWAY · NEW SOUTH WALES · AUSTRALIA ·
        </textPath>
      </text>
      <text x="50" y="47" textAnchor="middle" className="tmn-mark-big" fill="currentColor">
        NSW
      </text>
      <text x="50" y="61" textAnchor="middle" className="tmn-mark-sub" fill="currentColor">
        EST · AUS
      </text>
    </svg>
  );
}
