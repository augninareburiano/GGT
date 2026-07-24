import Image from "next/image";

/** The business's public listing — the badge is proof, so it should be checkable. */
const TRIPADVISOR_LISTING =
  "https://www.tripadvisor.com/Attraction_Review-g255060-d7171789-Reviews-Gourmet_Getaway_Tours-Sydney_New_South_Wales.html";

/**
 * Award and press marks. The files are our own copies under
 * `public/images/trust/` rather than hotlinks to the client's WordPress, so
 * nothing here breaks if the old site goes away.
 *
 * Rendered inside <JimmyStrip>, in the band the "Hi, I'm Jimmy." headline used
 * to hold — hence no <section> or .wrap of its own, which would double up on
 * the padding it already sits inside.
 *
 * All four are transparent PNGs sitting straight on the backdrop, no tile. The
 * two near-black marks would sink into the photo behind, so they carry
 * `knockout` and get flattened to solid white in CSS. Viator is left alone:
 * it's a solid green ticket that already reads, and knocking it out would take
 * the white text inside the ticket down with it.
 */
const BADGES: { src: string; alt: string; href?: string; knockout?: boolean }[] = [
  {
    src: "/images/trust/viator-experience-award-winner-2023.png",
    alt: "Viator Experience Award winner, 2023",
  },
  {
    src: "/images/trust/tripadvisor.png",
    alt: "Tripadvisor Certificate of Excellence, 2019",
    href: TRIPADVISOR_LISTING,
    knockout: true,
  },
  {
    // Already white script — nothing to knock out.
    src: "/images/trust/sydney-weekender.png",
    alt: "Featured on the television show Sydney Weekender",
  },
  {
    src: "/images/trust/destination-nsw.png",
    alt: "Listed with Destination NSW, the state tourism body",
    knockout: true,
  },
];

export default function TrustBadges() {
  return (
    <div className="trust">
      <p className="eyebrow trust-title">Awarded &amp; featured</p>

      <ul className="trust-row">
        {BADGES.map((badge) => {
          const tile = `trust-tile${badge.knockout ? " is-knockout" : ""}`;
          const logo = (
            // 320 rather than the ~210px the tile paints at: the prop is what
            // Next builds the srcset from, so it has to cover a 2x screen.
            <Image src={badge.src} alt={badge.alt} width={320} height={240} />
          );

          return (
            <li key={badge.src}>
              {badge.href ? (
                <a
                  href={badge.href}
                  className={tile}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {logo}
                </a>
              ) : (
                // Not a link: the other three have no listing of ours to point
                // at, and a dead-ended anchor is worse than none.
                <span className={tile}>{logo}</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
