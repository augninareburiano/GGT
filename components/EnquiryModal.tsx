"use client";

import { useEffect, useRef, useState } from "react";
import { money } from "@/lib/money";
import { trackEvent } from "@/lib/analytics";

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
  const [message, setMessage] = useState("");
  // Honeypot: real users leave this empty; bots tend to fill every field.
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const dialogRef = useRef<HTMLDivElement>(null);
  // When the form was opened — used to reject implausibly fast (bot) submits.
  const openedAt = useRef(Date.now());

  // Accessibility: trap focus inside the dialog, close on Escape, and restore
  // focus to whatever was focused before the modal opened.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const dialog = dialogRef.current;
    // Focus the first focusable element so screen-reader/keyboard users land
    // inside the dialog rather than back at the top of the page.
    const focusable = dialog?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    focusable?.[0]?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !dialog) return;
      const items = dialog.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (items.length === 0) return;
      const first = items[0]!;
      const last = items[items.length - 1]!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [onClose]);

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
          company,
          elapsedMs: Date.now() - openedAt.current,
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
      trackEvent("Enquiry", { tour: draft.tourName, guests: draft.guests });
    } catch (err) {
      setStatus("err");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        ref={dialogRef}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="enq-heading"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" aria-label="Close" onClick={onClose}>
          ×
        </button>

        {status === "ok" ? (
          <>
            <h3 id="enq-heading">Thanks, {name || "friend"}! 🎉</h3>
            <p className="sub" role="status">
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
            <h3 id="enq-heading">Send your enquiry</h3>
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
              <div className="form-msg err" role="alert">
                {error}
              </div>
            )}

            {/* Honeypot: hidden from users, off the tab order, ignored by AT. */}
            <div className="hp-field" aria-hidden="true">
              <label htmlFor="enq-company">Company</label>
              <input
                id="enq-company"
                name="company"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>

            <div className="field">
              <label className="flabel" htmlFor="enq-name">
                Your name
              </label>
              <input
                id="enq-name"
                required
                autoComplete="name"
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
                autoComplete="email"
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
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
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
