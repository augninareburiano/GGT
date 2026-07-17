"use client";

import Link from "next/link";
import { useReveal } from "./useReveal";

export default function Footer() {
  const c1 = useReveal<HTMLDivElement>();
  const c2 = useReveal<HTMLDivElement>();
  const c3 = useReveal<HTMLDivElement>();
  const c4 = useReveal<HTMLDivElement>();

  return (
    <footer>
      <div className="wrap foot">
        <div ref={c1.ref} className={c1.className}>
          <div className="brand" style={{ color: "var(--oat)" }}>
            Gourmet<span>.</span>Getaway
          </div>
          <p
            style={{
              opacity: 0.7,
              marginTop: 10,
              fontSize: 14,
              maxWidth: "30ch",
            }}
          >
            Food, wine &amp; adventure tours from Sydney, New South Wales.
          </p>
        </div>
        <div ref={c2.ref} className={c2.className}>
          <h5>Tours</h5>
          <a href="#">Wednesday Hunter Valley</a>
          <Link href="/tours">Private tours</Link>
          <a href="#builder">Build your tour</a>
        </div>
        <div ref={c3.ref} className={c3.className}>
          <h5>Company</h5>
          <a href="#">About Jimmy</a>
          <a href="#">FAQ</a>
          <a href="#">Gift cards</a>
        </div>
        <div ref={c4.ref} className={c4.className}>
          <h5>Get in touch</h5>
          <a href="#">+61 416 139 567</a>
          <a href="#">Instagram</a>
          <a href="#">Facebook</a>
        </div>
      </div>
    </footer>
  );
}
