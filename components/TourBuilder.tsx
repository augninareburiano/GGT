"use client";

import { useEffect, useMemo, useState } from "react";
import { money } from "@/lib/money";
import type { Tour } from "@/lib/tours";
import { useReveal } from "./useReveal";
import EnquiryModal, { type EnquiryDraft } from "./EnquiryModal";
import { FAREHARBOR_ENABLED, tourItemId } from "@/lib/fareharbor";

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

  // Preselect a tour when another section (e.g. the destination carousel) asks
  // the builder to prefill. Match on id first, then name — the carousel and
  // builder datasets use different ids but share tour names.
  useEffect(() => {
    function onPrefill(e: Event) {
      const detail = (e as CustomEvent<{ id?: string; name?: string }>).detail;
      const match = tours.find(
        (t) => t.id === detail?.id || t.name === detail?.name,
      );
      if (match) changeTour(match.id);
    }
    window.addEventListener("ggt:prefill-tour", onPrefill as EventListener);
    return () =>
      window.removeEventListener("ggt:prefill-tour", onPrefill as EventListener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tours]);

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
    fareharborItemId: tourItemId(current.fareharborItemId),
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
                <output>{guests}</output>
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
                    <div
                      key={a.id}
                      className={on ? "addon on" : "addon"}
                      onClick={() => toggleAddon(a.id)}
                    >
                      <span className="left">
                        <span className="box">{on ? "✓" : ""}</span>
                        {a.name}
                      </span>
                      <span className="price">+{money(a.price)} pp</span>
                    </div>
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
            <div className="total">
              <span className="mono">Estimate</span>
              {/* key changes on total → remount re-runs the bump animation */}
              <b key={total} className="bill-bump">
                {money(total)}
              </b>
            </div>
            {/*
              Private tours are quoted per itinerary in FareHarbor, so this
              figure is a guide, not the price charged at checkout.
            */}
            <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>
              A guide only — pick-up point and itinerary change the final price,
              which is confirmed when you book.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              style={{ marginTop: 20, width: "100%", justifyContent: "center" }}
              onClick={() => setModalOpen(true)}
            >
              {FAREHARBOR_ENABLED ? "Check availability →" : "Send enquiry →"}
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
