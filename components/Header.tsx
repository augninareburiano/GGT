"use client";

import { useEffect, useState } from "react";

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
          <a href="#" onClick={closeMenu}>
            Wednesday Tour
          </a>
          <a href="#" onClick={closeMenu}>
            Private Tours
          </a>
          <a href="#" onClick={closeMenu}>
            About
          </a>
          <a href="#builder" className="btn btn-primary" onClick={closeMenu}>
            Build your tour
          </a>
        </nav>
      </div>
    </header>
  );
}
