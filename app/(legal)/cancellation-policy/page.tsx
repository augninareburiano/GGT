import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cancellation policy",
  description:
    "How payment, cancellations and refunds work for Gourmet Getaway Tours private tours.",
  alternates: {
    canonical: "/cancellation-policy",
  },
};

/*
  Every clause below is the client's supplied wording. Nothing here may be
  added to, softened or "rounded out" without the client saying so — on a legal
  page an invented clause is worse than a missing one.
*/
export default function CancellationPolicy() {
  return (
    <>
      <p className="eyebrow">Legal</p>
      <h1 className="legal-title">Cancellation policy</h1>

      <ol className="legal-list">
        <li className="legal-item">
          <div>
            <span className="legal-label">Securing a date</span>
            <p>
              Private tours require full payment to secure a specific date.
            </p>
          </div>
        </li>
        <li className="legal-item">
          <div>
            <span className="legal-label">Full refund</span>
            <p>
              Full refund if cancelled more than 5 days before the tour date.
            </p>
          </div>
        </li>
        <li className="legal-item">
          <div>
            <span className="legal-label">No refund</span>
            <p>No refund if cancelled within 5 days of the tour date.</p>
          </div>
        </li>
      </ol>

      <p className="legal-more">
        <Link href="/terms-and-conditions">Terms and conditions</Link>
      </p>
    </>
  );
}
