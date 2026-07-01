"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Primary nav. Anchor targets live on the homepage; sections are added by
// their own components, so these resolve once those land.
const NAV_LINKS = [
  { href: "/#wednesday", label: "Wednesday Tour" },
  { href: "/#private", label: "Private Tours" },
  { href: "/#about", label: "About" },
];

// Keep in sync with the `max-width:780px` breakpoint in globals.css.
const MOBILE_QUERY = "(min-width: 781px)";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const closeMenu = () => setOpen(false);

  // Subtle header shadow once the page is scrolled (mirrors mockup).
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The mobile menu is a CSS overlay only below the breakpoint; if the viewport
  // grows past it while open, drop the open state so desktop nav is clean.
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const onChange = () => {
      if (mq.matches) setOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Let Escape close the menu for keyboard users.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className={scrolled ? "scrolled" : undefined}>
      <div className="wrap nav">
        <Link href="/" className="brand" onClick={closeMenu}>
          Gourmet<span>.</span>Getaway
        </Link>

        <button
          type="button"
          className="menu-btn"
          aria-label="Menu"
          aria-expanded={open}
          aria-controls="nav-links"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close" : "Menu"}
        </button>

        <nav id="nav-links" className={open ? "nav-links open" : "nav-links"}>
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} onClick={closeMenu}>
              {link.label}
            </Link>
          ))}
          <Link href="/#builder" className="btn btn-primary" onClick={closeMenu}>
            Build your tour
          </Link>
        </nav>
      </div>
    </header>
  );
}
