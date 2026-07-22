"use client";

import { useReveal } from "./useReveal";
import { mediaBg } from "@/lib/media";

// Set to a photo path (e.g. "/images/jimmy.jpg") to swap in a real portrait;
// the gradient stays behind as a fallback.
const JIMMY_IMAGE: string | undefined = undefined;

export default function JimmyStrip() {
  const strip = useReveal<HTMLDivElement>("jimmy");

  return (
    <section className="wrap">
      <div ref={strip.ref} className={strip.className}>
        <div
          className="avatar"
          style={{
            background: mediaBg(
              "linear-gradient(150deg,#3FD0D0,#0A6E6E)",
              JIMMY_IMAGE,
            ),
          }}
        />
        <div>
          <p className="eyebrow" style={{ color: "rgba(255,255,255,.75)" }}>
            Owner-operated
          </p>
          <h2>Hi, I&apos;m Jimmy.</h2>
          <p>
            Thirty years cooking and guiding, now in smaller vehicles with
            driver-cooks I&apos;ve trained myself. Every tour is mine, start to
            finish — that&apos;s the whole point. Wine is my canvas; food is my
            paint.
          </p>
        </div>
      </div>
    </section>
  );
}
