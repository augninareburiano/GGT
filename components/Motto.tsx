"use client";

import { useReveal } from "./useReveal";

export default function Motto() {
  const r = useReveal<HTMLDivElement>();

  return (
    <section className="wrap">
      <div ref={r.ref} className={`motto ${r.className}`}>
        <p className="eyebrow">Our whole philosophy</p>
        <p className="motto-line">
          Wine is our <em>canvas</em>.<br />
          Food is our <em>paint</em>.
        </p>
        <a href="#builder" className="btn btn-primary">
          Build your tour →
        </a>
      </div>
    </section>
  );
}
