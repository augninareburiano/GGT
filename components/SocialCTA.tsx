"use client";

import { useReveal } from "./useReveal";
import { SOCIAL_LINKS } from "@/lib/seo";

export default function SocialCTA() {
  const band = useReveal<HTMLDivElement>();

  return (
    <section className="wrap">
      <div ref={band.ref} className={`social ${band.className}`}>
        <div className="social-copy">
          <p className="eyebrow" style={{ color: "var(--gold)" }}>
            Follow the journey
          </p>
          <h2>Come along for the ride</h2>
          <p>
            Behind-the-scenes cooks, cellar doors and clifftop lunches — see
            where the van heads next.
          </p>
        </div>
        <div className="social-links">
          {SOCIAL_LINKS.map((s) => (
            <a
              key={s.name}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`social-btn s-${s.name.toLowerCase()}`}
            >
              <SocialIcon name={s.name} />
              <span>{s.cta}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function SocialIcon({ name }: { name: string }) {
  switch (name) {
    case "Instagram":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="2.5" y="2.5" width="19" height="19" rx="5" stroke="currentColor" strokeWidth="2" />
          <circle cx="12" cy="12" r="4.3" stroke="currentColor" strokeWidth="2" />
          <circle cx="17.4" cy="6.6" r="1.3" fill="currentColor" />
        </svg>
      );
    case "Facebook":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M14.5 8.5V6.9c0-.8.2-1.2 1.3-1.2h1.5V2.6h-2.5c-2.7 0-3.8 1.4-3.8 3.9v2H8.7v3.1h2.3V21h3.5v-9.4h2.4l.4-3.1z" />
        </svg>
      );
    case "YouTube":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M22 12s0-3.2-.4-4.7a2.5 2.5 0 0 0-1.7-1.7C18.4 5.2 12 5.2 12 5.2s-6.4 0-7.9.4A2.5 2.5 0 0 0 2.4 7.3C2 8.8 2 12 2 12s0 3.2.4 4.7a2.5 2.5 0 0 0 1.7 1.7c1.5.4 7.9.4 7.9.4s6.4 0 7.9-.4a2.5 2.5 0 0 0 1.7-1.7C22 15.2 22 12 22 12zM10 15.2V8.8l5.2 3.2z" />
        </svg>
      );
    default:
      return null;
  }
}
