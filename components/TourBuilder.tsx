"use client";

import { useMemo, useState } from "react";
import { money } from "@/lib/money";
import type { Tour } from "@/lib/tours";
import { useReveal } from "./useReveal";
import EnquiryModal, { type EnquiryDraft } from "./EnquiryModal";

const MAX_GUESTS = 16;

export default function TourBuilder({ tours }: { tours: Tour[] }) {
  const controls = useReveal<HTMLDivElement>("controls");
  const bill = useReveal<HTMLDivElement>("bill");

  const [currentId, setCurrentId] = useState(tours[0]?.id ?? "");
  const [guests, setGuests] = useState(tours[0]?.min ?? 2);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [modalOpen, setModalOpen] = useState(false);

  const current = useMemo(
    () => tours.find((t) => t.id === currentId) ?? tours[0],
    [tours, currentId],
  );

  function changeTour(id: string) {
    const next = tours.find((t) => t.id === id);
    if (!next) return;
    setCurrentId(id);
    setSelected({});
    setGuests((g) => (g < next.min ? next.min : g));
  }

  function toggleAddon(id: string) {
    setSelected((s) => ({ ...s, [id]: !s[id] }));
  }

  if (!current) return null;

  const selectedAddOns = current.addOns.filter((a) => selected[a.id]);
  const total =
    current.base * guests +
    selectedAddOns.reduce((sum, a) => sum + a.price * guests, 0);

  const draft: EnquiryDraft = {
    tourId: current.id,
    tourName: current.name,
    guests,
    addOns: selectedAddOns.map((a) => ({ id: a.id, name: a.name, price: a.price })),
    total,
  };

  return (
    <section className="builder" id="builder">
      <div className="wrap">
        <p className="eyebrow">Build your tour</p>
        <h2 className="builder-title">Plate your own day, see the price grow.</h2>
        <div className="builder-grid">
          <div ref={controls.ref} className={controls.className}>
            <div className="field">
              <label className="flabel" htmlFor="tour">
                1 · Destination
              </label>
              <select
                id="tour"
                value={current.id}
                onChange={(e) => changeTour(e.target.value)}
              >
                {tours.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <span className="flabel">2 · Guests</span>
              <div className="stepper">
                <button
                  type="button"
                  aria-label="Fewer guests"
                  onClick={() =>
                    setGuests((g) => (g > current.min ? g - 1 : g))
                  }
                >
                  −
                </button>
                <output aria-live="polite" aria-label={`${guests} guests`}>
                  {guests}
                </output>
                <button
                  type="button"
                  aria-label="More guests"
                  onClick={() =>
                    setGuests((g) => (g < MAX_GUESTS ? g + 1 : g))
                  }
                >
                  +
                </button>
              </div>
            </div>

            <div className="field">
              <span className="flabel">3 · Add extras (per person)</span>
              <div className="addons">
                {current.addOns.map((a) => {
                  const on = !!selected[a.id];
                  return (
                    <label key={a.id} className={on ? "addon on" : "addon"}>
                      <input
                        type="checkbox"
                        className="addon-input"
                        checked={on}
                        onChange={() => toggleAddon(a.id)}
                      />
                      <span className="left">
                        <span className="box" aria-hidden="true">
                          {on ? "✓" : ""}
                        </span>
                        {a.name}
                      </span>
                      <span className="price">+{money(a.price)} pp</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <div ref={bill.ref} className={`${bill.className} bill`}>
            <p className="t">Your day so far</p>
            <h4>{current.name}</h4>
            <div>
              <div className="line">
                <span>
                  Base · {guests} guest{guests > 1 ? "s" : ""}
                </span>
                <span>{money(current.base * guests)}</span>
              </div>
              {selectedAddOns.map((a) => (
                <div className="line add" key={a.id}>
                  <span>
                    + {a.name} ×{guests}
                  </span>
                  <span>{money(a.price * guests)}</span>
                </div>
              ))}
            </div>
            <div className="total" aria-live="polite" aria-atomic="true">
              <span className="mono">Total</span>
              {/* key changes on total → remount re-runs the bump animation */}
              <b key={total} className="bill-bump">
                {money(total)}
              </b>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              style={{ marginTop: 20, width: "100%", justifyContent: "center" }}
              onClick={() => setModalOpen(true)}
            >
              Send enquiry →
            </button>
          </div>
        </div>
      </div>

      {modalOpen && (
        <EnquiryModal draft={draft} onClose={() => setModalOpen(false)} />
      )}
    </section>
  );
}
