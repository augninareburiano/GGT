"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  FAREHARBOR_ENABLED,
  bookingHref,
  flagshipBookingHref,
  tourItemId,
} from "@/lib/fareharbor";

/**
 * Site header.
 *
 * Three zones on a grid — brand pill / centred links / actions — so the links
 * sit dead centre of the viewport rather than being pushed around by however
 * wide the brand happens to be.
 *
 * `overlay` floats the bar over a full-bleed hero (the home page) instead of
 * sitting above it as its own cream band. In that mode it starts transparent
 * with white type and settles into the standard cream glass once the page
 * scrolls, which is what `scrolled` has always tracked.
 */
export default function Header({ overlay = false }: { overlay?: boolean }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu = () => setOpen(false);

  const cta = FAREHARBOR_ENABLED ? "Book now" : "Build your tour";
  const className =
    [overlay && "overlay", scrolled && "scrolled"].filter(Boolean).join(" ") ||
    undefined;

  return (
    <header className={className}>
      <div className="wrap nav">
        <Link href="/" className="brand" aria-label="Gourmet Getaway Tours, home">
          <Image
            src="/images/Untitled-design-19.png"
            alt=""
            className="brand-logo"
            width={415}
            height={240}
            priority
          />
          {/* Wordmark beside the logo. It's plain text (not baked into the
              image) so it inherits the header's colour — white while floating
              over the hero, ink once scrolled. */}
          <span className="brand-word" aria-hidden>
            <span className="brand-name">Gourmet Getaway</span>
            <span className="brand-sub">&nbsp;Tours</span>
          </span>
        </Link>

        <nav className={open ? "nav-links open" : "nav-links"}>
          <a href={flagshipBookingHref()} onClick={closeMenu}>
            Hunter Valley Tour
          </a>
          <a href={bookingHref({ itemId: tourItemId() })} onClick={closeMenu}>
            Private Tours
          </a>
          {/* The bar's own CTA is hidden on narrow screens, where it would
              crowd the brand and the menu button — this one takes over inside
              the dropdown instead. */}
          <a
            href={flagshipBookingHref()}
            className="btn btn-primary nav-cta-m"
            onClick={closeMenu}
          >
            {cta}
          </a>
        </nav>

        <div className="nav-actions">
          <a href={flagshipBookingHref()} className="btn btn-primary nav-cta">
            {cta}
          </a>
          <button
            className="menu-btn"
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>
    </header>
  );
}
