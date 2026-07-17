"use client";

import { useState } from "react";
import EnquiryModal, { type EnquiryDraft } from "./EnquiryModal";

/**
 * Enquiry CTA for detail pages of tours that have no published builder pricing
 * yet (see ShowcaseTour.tourId). Opens the shared EnquiryModal with an empty
 * draft — no guests/add-ons/total to quote, so `total` is 0.
 */
export default function TourEnquiryButton({
  tourId,
  tourName,
}: {
  tourId: string;
  tourName: string;
}) {
  const [open, setOpen] = useState(false);

  const draft: EnquiryDraft = {
    tourId,
    tourName,
    guests: 2,
    addOns: [],
    total: 0,
  };

  return (
    <>
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => setOpen(true)}
      >
        Enquire about this tour →
      </button>
      {open && <EnquiryModal draft={draft} onClose={() => setOpen(false)} />}
    </>
  );
}
