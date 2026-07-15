"use client";

import { useReveal } from "./useReveal";

type Badge = {
  label: string;
  detail: string;
};

// Accreditation & insurance signals. Replace label/detail with your real
// memberships and cover — these are the trust markers overseas guests look
// for before booking.
const BADGES: Badge[] = [
  { label: "ATEC", detail: "Australian Tourism Export Council member" },
  { label: "$20M", detail: "Public liability insurance" },
  { label: "NSW", detail: "Accredited tourism operator" },
  { label: "RSA", detail: "Responsible service of alcohol certified" },
];

export default function TrustBadges() {
  const strip = useReveal<HTMLDivElement>();

  return (
    <section className="wrap">
      <div ref={strip.ref} className={`trust ${strip.className}`}>
        <p className="trust-lead">
          Fully insured &amp; accredited — book with confidence.
        </p>
        <ul className="trust-badges">
          {BADGES.map((b) => (
            <li key={b.label} className="trust-badge">
              <span className="trust-badge-mark">{b.label}</span>
              <span className="trust-badge-detail">{b.detail}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
