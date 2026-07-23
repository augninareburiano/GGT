import type { Metadata } from "next";
import Link from "next/link";
import { ACCREDITATION_NUMBER, BUSINESS_ACN, SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Terms and conditions",
  description:
    "Terms and conditions for travelling with Gourmet Getaway Tours — liability, travel insurance, changes to tours and age requirements.",
  alternates: {
    canonical: "/terms-and-conditions",
  },
};

/*
  Every clause below is the client's supplied wording. Nothing here may be
  added to, softened or "rounded out" without the client saying so — on a legal
  page an invented clause is worse than a missing one.
*/
export default function TermsAndConditions() {
  return (
    <>
      <p className="eyebrow">Legal</p>
      <h1 className="legal-title">Terms and conditions</h1>

      <ol className="legal-list">
        <li className="legal-item">
          <div>
            <span className="legal-label">Liability</span>
            <p>
              {SITE_NAME} is not liable for illness, injury, damages, loss,
              delay or failure to join the tour due to factors beyond its
              control.
            </p>
          </div>
        </li>
        <li className="legal-item">
          <div>
            <span className="legal-label">Travel insurance</span>
            <p>Travel insurance is strongly recommended for all passengers.</p>
          </div>
        </li>
        <li className="legal-item">
          <div>
            <span className="legal-label">Changes to tours</span>
            <p>
              The company may alter routes, itineraries, fares, inclusions, days
              of operation, or cancel tours if unforeseen circumstances occur.
            </p>
          </div>
        </li>
        <li className="legal-item">
          <div>
            <span className="legal-label">Wine tasting</span>
            <p>Guests must be 18 or older to taste wine.</p>
          </div>
        </li>
        <li className="legal-item">
          <div>
            <span className="legal-label">Return time</span>
            <p>
              The 6pm return time is a guide, not a guarantee — traffic and
              unforeseen circumstances apply.
            </p>
          </div>
        </li>
      </ol>

      {/* Registered identifiers, kept out of the numbered clauses — they say
          who the operator is, they are not terms a guest agrees to. */}
      <dl className="legal-ids">
        <div>
          <dt>Accreditation number</dt>
          <dd>{ACCREDITATION_NUMBER}</dd>
        </div>
        <div>
          <dt>ACN</dt>
          <dd>{BUSINESS_ACN}</dd>
        </div>
      </dl>

      <p className="legal-more">
        <Link href="/cancellation-policy">Cancellation policy</Link>
      </p>
    </>
  );
}
