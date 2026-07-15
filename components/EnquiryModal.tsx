"use client";

import { useState } from "react";
import { money } from "@/lib/money";

export type EnquiryDraft = {
  tourId: string;
  tourName: string;
  guests: number;
  addOns: { id: string; name: string; price: number }[];
  total: number;
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
  const [preferredDate, setPreferredDate] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  // Guests can't pick a date in the past.
  const today = new Date().toLocaleDateString("en-CA");

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
          preferredDate,
          tourId: draft.tourId,
          tourName: draft.tourName,
          guests: draft.guests,
          addOns: draft.addOns,
          total: draft.total,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Something went wrong. Please try again.");
      }
      setStatus("ok");
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
              Your enquiry is in. Jimmy will be in touch shortly to lock in the
              details.
            </p>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={onClose}>
                Done
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={submit}>
            <h3>Send your enquiry</h3>
            <p className="sub">
              We&apos;ll get back to you about your tailored day out.
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
                  <span>{money(a.price * draft.guests)}</span>
                </div>
              ))}
              <div className="row">
                <b>Estimated total</b>
                <b>{money(draft.total)}</b>
              </div>
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
                Preferred date
              </label>
              <input
                id="enq-date"
                type="date"
                required
                min={today}
                value={preferredDate}
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
                {status === "sending" ? "Sending…" : "Send enquiry →"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
