"use client";

import { useState } from "react";
import Price, { ChargedInAud } from "./Price";
import { FAREHARBOR_ENABLED, type FareHarborPrefill } from "@/lib/fareharbor";
import { openFareHarbor } from "@/lib/fareharbor.client";

type DraftAddOn = { id: string; name: string; price: number };

export type EnquiryDraft = {
  tourId: string;
  tourName: string;
  guests: number;
  /** Extras we charge for. These, and only these, are inside `total`. */
  addOns: DraftAddOn[];
  /**
   * Third-party extras the guest pays direct on the day. Carried for the
   * record and the emails; deliberately kept out of `total`, and a `price` of
   * 0 means it varies. Never bill against these.
   */
  payOnDayAddOns: DraftAddOn[];
  total: number;
  /** FareHarbor item for the selected tour, if one is configured. */
  fareharborItemId?: string;
};

type Status = "idle" | "sending" | "ok" | "err";

export default function EnquiryModal({
  draft,
  onClose,
}: {
  draft: EnquiryDraft;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [preferredDate, setPreferredDate] = useState("");

  /**
   * Everything the guest has told us so far, mapped onto FareHarbor's booking
   * flow. Selections FareHarbor has no field for (extras, our estimate) ride
   * along as tracking params so they show up on the booking in the dashboard.
   */
  function prefill(): FareHarborPrefill {
    return {
      itemId: draft.fareharborItemId || undefined,
      guests: draft.guests,
      date: preferredDate || undefined,
      name,
      email,
      phone,
      note: message,
      context: {
        tour: draft.tourName,
        extras: draft.addOns.map((a) => a.name).join(", "),
        // Separate param, so the booking record never reads these as ours to
        // charge. `estimate` stays the amount we quote.
        extrasPaidOnDay: draft.payOnDayAddOns.map((a) => a.name).join(", "),
        estimate: draft.total,
      },
    };
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          message,
          tourId: draft.tourId,
          tourName: draft.tourName,
          guests: draft.guests,
          preferredDate,
          addOns: draft.addOns,
          payOnDayAddOns: draft.payOnDayAddOns,
          total: draft.total,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Something went wrong. Please try again.");
      }
      setStatus("ok");
      // Lead is safely saved — hand the guest straight to FareHarbor to
      // actually book, carrying everything they just typed.
      openFareHarbor(prefill());
    } catch (err) {
      setStatus("err");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" aria-label="Close" onClick={onClose}>
          ×
        </button>

        {status === "ok" ? (
          <>
            <h3>Thanks, {name || "friend"}! 🎉</h3>
            <p className="sub">
              {FAREHARBOR_ENABLED
                ? "Your details are saved and the booking window is opening — pick your date and confirm. Jimmy will be in touch either way."
                : "Your enquiry is in. Jimmy will be in touch shortly to lock in the details."}
            </p>
            <div className="modal-actions">
              {FAREHARBOR_ENABLED && (
                <button
                  className="btn btn-primary"
                  onClick={() => openFareHarbor(prefill())}
                >
                  Open booking →
                </button>
              )}
              <button className="btn btn-ghost" onClick={onClose}>
                Done
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={submit}>
            <h3>{FAREHARBOR_ENABLED ? "Almost there" : "Send your enquiry"}</h3>
            <p className="sub">
              {FAREHARBOR_ENABLED
                ? "A few details and we'll take you to checkout with everything filled in."
                : "We'll get back to you about your tailored day out."}
            </p>

            <div className="summary">
              <div className="row">
                <span>{draft.tourName}</span>
                <span>
                  {draft.guests} guest{draft.guests > 1 ? "s" : ""}
                </span>
              </div>
              {draft.addOns.map((a) => (
                <div className="row" key={a.id}>
                  <span>+ {a.name}</span>
                  <span>
                    <Price aud={a.price * draft.guests} />
                  </span>
                </div>
              ))}
              <div className="row">
                <b>Estimate</b>
                <b>
                  <Price aud={draft.total} />
                </b>
              </div>
              {/*
                Last screen before checkout, so the amount that will actually
                hit the card belongs here whenever the total above is converted.
              */}
              <ChargedInAud aud={draft.total} className="summary-charged" />
              {draft.payOnDayAddOns.length > 0 && (
                <>
                  {draft.payOnDayAddOns.map((a) => (
                    <div className="row onday" key={a.id}>
                      <span>{a.name}</span>
                      <span>
                        {a.price > 0 ? (
                          <>
                            ~<Price aud={a.price * draft.guests} />
                          </>
                        ) : (
                          "Varies"
                        )}
                      </span>
                    </div>
                  ))}
                  <p className="summary-onday-note">
                    Paid direct to the provider on the day — not part of the
                    estimate and not charged by us.
                  </p>
                </>
              )}
            </div>

            {status === "err" && (
              <div className="form-msg err">{error}</div>
            )}

            <div className="field">
              <label className="flabel" htmlFor="enq-name">
                Your name
              </label>
              <input
                id="enq-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="field">
              <label className="flabel" htmlFor="enq-email">
                Email
              </label>
              <input
                id="enq-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="field">
              <label className="flabel" htmlFor="enq-phone">
                Phone (optional)
              </label>
              <input
                id="enq-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="field">
              <label className="flabel" htmlFor="enq-date">
                Preferred date (optional)
              </label>
              <input
                id="enq-date"
                type="date"
                value={preferredDate}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setPreferredDate(e.target.value)}
              />
            </div>
            <div className="field">
              <label className="flabel" htmlFor="enq-message">
                Anything else? (optional)
              </label>
              <textarea
                id="enq-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <div className="modal-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={status === "sending"}
                style={{ flex: 1, justifyContent: "center" }}
              >
                {status === "sending"
                  ? "Sending…"
                  : FAREHARBOR_ENABLED
                    ? "Continue to booking →"
                    : "Send enquiry →"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
