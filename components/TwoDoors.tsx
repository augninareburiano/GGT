"use client";

import { useReveal } from "./useReveal";
import { flagshipBookingHref } from "@/lib/fareharbor";

export default function TwoDoors() {
  const doorA = useReveal<HTMLDivElement>("door a");
  const doorB = useReveal<HTMLDivElement>("door b");

  return (
    <section className="wrap">
      <div className="doors">
        <div ref={doorA.ref} className={doorA.className}>
          <div>
            <p className="eyebrow" style={{ color: "rgba(255,255,255,.75)" }}>
              Every Monday &amp; Wednesday · up to 16 guests
            </p>
            <h3>The Hunter Valley Food &amp; Wine Tour</h3>
            <p>
              Our flagship day. Progressive breakfast and lunch cooked by your
              guide, three wines matched to the menu, door to door.
            </p>
          </div>
          <a
            href={flagshipBookingHref()}
            className="btn btn-light"
            style={{ alignSelf: "flex-start", marginTop: 18 }}
          >
            From A$257 →
          </a>
        </div>
        <div ref={doorB.ref} className={doorB.className}>
          <div>
            <p className="eyebrow" style={{ color: "rgba(255,255,255,.8)" }}>
              9 destinations · your itinerary
            </p>
            <h3>Build a private tour</h3>
            <p>
              Just your group. Choose a destination, the number of guests and the
              extras you fancy — oyster farm, truffle hunt, distillery and more.
            </p>
          </div>
          <a
            href="#builder"
            className="btn btn-light"
            style={{ alignSelf: "flex-start", marginTop: 18 }}
          >
            Start building →
          </a>
        </div>
      </div>
    </section>
  );
}
