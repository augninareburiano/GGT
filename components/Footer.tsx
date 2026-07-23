"use client";

import { useReveal } from "./useReveal";
import CurrencyPicker from "./CurrencyPicker";
import {
  ACCREDITATION_NUMBER,
  BUSINESS_ACN,
  BUSINESS_ADDRESS,
  BUSINESS_EMAIL,
  BUSINESS_PHONE,
  SITE_NAME,
  SOCIAL_LINKS,
} from "@/lib/seo";
import {
  bookingHref,
  flagshipBookingHref,
  giftBookingHref,
  tourItemId,
} from "@/lib/fareharbor";

export default function Footer() {
  const c1 = useReveal<HTMLDivElement>();
  const c2 = useReveal<HTMLDivElement>();
  const c3 = useReveal<HTMLDivElement>();
  const c4 = useReveal<HTMLDivElement>();
  const legal = useReveal<HTMLDivElement>("foot-legal");

  return (
    <footer>
      <div className="wrap foot">
        <div ref={c1.ref} className={c1.className}>
          <div className="brand" style={{ color: "var(--oat)" }}>
            Gourmet<span>.</span>Getaway
          </div>
          <p
            style={{
              opacity: 0.7,
              marginTop: 10,
              fontSize: 14,
              maxWidth: "30ch",
            }}
          >
            Food, wine &amp; adventure tours from Sydney, New South Wales.
          </p>
          <p className="accred">
            <span className="accred-label">Accredited tour operator</span>
            <span className="accred-no">No. {ACCREDITATION_NUMBER}</span>
          </p>
        </div>
        <div ref={c2.ref} className={c2.className}>
          <h5>Tours</h5>
          <a href={flagshipBookingHref()}>Wednesday Hunter Valley</a>
          <a href={bookingHref({ itemId: tourItemId() })}>Private tours</a>
          <a href="#builder">Build your tour</a>
        </div>
        <div ref={c3.ref} className={c3.className}>
          <h5>Company</h5>
          <a href="#">About Jimmy</a>
          <a href="#">FAQ</a>
          <a href={giftBookingHref()}>Gift cards</a>
        </div>
        <div ref={c4.ref} className={c4.className}>
          <h5>Get in touch</h5>
          <a href={`tel:${BUSINESS_PHONE}`}>+61 416 139 567</a>
          <a href={`mailto:${BUSINESS_EMAIL}`}>{BUSINESS_EMAIL}</a>
          <address className="foot-address">
            {BUSINESS_ADDRESS.street}
            <br />
            {BUSINESS_ADDRESS.suburb} {BUSINESS_ADDRESS.stateCode}{" "}
            {BUSINESS_ADDRESS.postcode}
          </address>
          {SOCIAL_LINKS.map((s) => (
            <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer">
              {s.name}
            </a>
          ))}
          <CurrencyPicker />
        </div>
      </div>
      <div className="wrap">
        <div ref={legal.ref} className={legal.className}>
          <span>ACN {BUSINESS_ACN}</span>
          <span>
            &copy; {new Date().getFullYear()} {SITE_NAME}
          </span>
        </div>
      </div>
    </footer>
  );
}
