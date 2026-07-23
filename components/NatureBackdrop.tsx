"use client";

import { useEffect, useRef, useState } from "react";
import { SHOWCASE_TOURS, showcaseBg } from "@/lib/showcase";

/**
 * The page-wide nature backdrop.
 *
 * It mirrors whichever carousel slide is currently playing: DestinationCarousel
 * dispatches a `ggt:slide` event with the active slide's background each time it
 * commits, and this fixed layer cross-fades to match. That's what makes the
 * photo behind the glass panels below the hero the *same* tour you're looking at
 * up top, rather than one static image.
 *
 * Two stacked layers cross-fade by opacity because CSS can't tween a
 * background-image — the incoming photo fades up on its own layer over the
 * outgoing one. The dark wash and blur that turn the photo into an atmospheric
 * backdrop live in CSS (.nature-bg in globals.css).
 */
export default function NatureBackdrop() {
  const initial = showcaseBg(SHOWCASE_TOURS[0]);
  const [slotA, setSlotA] = useState(initial);
  const [slotB, setSlotB] = useState<string | null>(null);
  const [topIsB, setTopIsB] = useState(false);
  // Refs so the listener (attached once) never reads stale state.
  const current = useRef(initial);
  const topRef = useRef(false);

  useEffect(() => {
    const onSlide = (e: Event) => {
      const bg = (e as CustomEvent<{ bg: string }>).detail?.bg;
      if (!bg || bg === current.current) return;
      current.current = bg;
      // Drop the incoming photo into whichever slot is hidden, then flip which
      // one is on top so it fades in as the other fades out.
      const nextTopIsB = !topRef.current;
      topRef.current = nextTopIsB;
      if (nextTopIsB) setSlotB(bg);
      else setSlotA(bg);
      setTopIsB(nextTopIsB);
    };
    window.addEventListener("ggt:slide", onSlide as EventListener);
    return () => window.removeEventListener("ggt:slide", onSlide as EventListener);
  }, []);

  return (
    <div className="nature-bg" aria-hidden>
      <div
        className={topIsB ? "nature-bg-layer" : "nature-bg-layer is-top"}
        style={{ background: slotA }}
      />
      <div
        className={topIsB ? "nature-bg-layer is-top" : "nature-bg-layer"}
        style={slotB ? { background: slotB } : undefined}
      />
    </div>
  );
}
