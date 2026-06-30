"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Scroll-reveal hook. Returns a ref to attach to the target element and the
 * className string to apply directly to it (so grid/flex layout is preserved,
 * unlike a wrapper element). Mirrors the original IntersectionObserver:
 * adds `in` once the element is 15% visible, then stops observing.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  extraClass = "",
) {
  const ref = useRef<T>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const className = ["reveal", shown ? "in" : "", extraClass]
    .filter(Boolean)
    .join(" ");

  return { ref, className };
}
