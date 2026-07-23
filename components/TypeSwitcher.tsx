"use client";

import { useEffect, useState } from "react";

/**
 * Dev-only type-theme switcher.
 *
 * Flips the `type-{a,b,c}` class on <body> so the three candidate font
 * directions (see app/layout.tsx + globals.css) can be compared live without
 * editing code or reloading. The choice is remembered in localStorage.
 *
 * Renders nothing in a production build, so it never ships. Delete this
 * component (and the extra font loaders in layout.tsx) once a direction is
 * chosen.
 */
const THEMES = [
  { id: "a", label: "A", name: "Fraunces + Hanken" },
  { id: "b", label: "B", name: "Bricolage" },
  { id: "c", label: "C", name: "Hanken" },
  { id: "d", label: "D", name: "Helvetica" },
  { id: "e", label: "E", name: "Poppins" },
] as const;

type ThemeId = (typeof THEMES)[number]["id"];

const STORAGE_KEY = "ggt-type-theme";

function apply(id: ThemeId) {
  for (const t of THEMES) document.body.classList.remove(`type-${t.id}`);
  document.body.classList.add(`type-${id}`);
}

export default function TypeSwitcher() {
  const [active, setActive] = useState<ThemeId>("a");

  // Restore the last pick on mount. Body already carries the SSR default class,
  // so this only overrides it client-side — no hydration mismatch.
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeId | null;
    const current =
      saved ??
      (THEMES.map((t) => t.id).find((id) =>
        document.body.classList.contains(`type-${id}`),
      ) ||
        "a");
    setActive(current);
    if (saved) apply(saved);
  }, []);

  if (process.env.NODE_ENV === "production") return null;

  const pick = (id: ThemeId) => {
    setActive(id);
    apply(id);
    localStorage.setItem(STORAGE_KEY, id);
  };

  return (
    <div
      style={{
        position: "fixed",
        left: 14,
        bottom: 14,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 8px",
        borderRadius: 999,
        background: "rgba(18,24,18,.72)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,.22)",
        boxShadow: "0 12px 30px -14px rgba(0,0,0,.7)",
        fontFamily: "var(--font-mono), monospace",
      }}
      aria-label="Font theme (dev only)"
    >
      <span
        style={{
          fontSize: 9,
          letterSpacing: ".14em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,.55)",
          padding: "0 4px",
        }}
      >
        Type
      </span>
      {THEMES.map((t) => {
        const on = t.id === active;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => pick(t.id)}
            title={t.name}
            style={{
              cursor: "pointer",
              border: "none",
              borderRadius: 999,
              width: 26,
              height: 26,
              fontSize: 12,
              fontWeight: 700,
              fontFamily: "var(--font-mono), monospace",
              color: on ? "#211C24" : "rgba(255,255,255,.85)",
              background: on ? "#F4B400" : "rgba(255,255,255,.10)",
              transition: "background .15s ease, color .15s ease",
            }}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
