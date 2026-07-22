"use client";

import { useEffect, useState } from "react";
import {
  FAREHARBOR_ENABLED,
  bookingHref,
  flagshipBookingHref,
  tourItemId,
} from "@/lib/fareharbor";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu = () => setOpen(false);

  return (
    <header className={scrolled ? "scrolled" : undefined}>
      <div className="wrap nav">
        <div className="brand">
          Gourmet<span>.</span>Getaway
        </div>
        <button
          className="menu-btn"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "Close" : "Menu"}
        </button>
        <nav className={open ? "nav-links open" : "nav-links"}>
          <a href={flagshipBookingHref()} onClick={closeMenu}>
            Hunter Valley Tour
          </a>
          <a href={bookingHref({ itemId: tourItemId() })} onClick={closeMenu}>
            Private Tours
          </a>
          <a href="#" onClick={closeMenu}>
            About
          </a>
          <a
            href={flagshipBookingHref()}
            className="btn btn-primary"
            onClick={closeMenu}
          >
            {FAREHARBOR_ENABLED ? "Book now" : "Build your tour"}
          </a>
        </nav>
      </div>
    </header>
  );
}
