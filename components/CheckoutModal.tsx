"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/stripe.client";
import { money } from "@/lib/money";
import { formatCurrency } from "@/lib/currency";

export type CheckoutDraft = {
  tourId: string;
  tourName: string;
  guests: number;
  addOnIds: string[];
  /** Client estimate only — the server recomputes the authoritative total. */
  totalAud: number;
};

type RatesResponse = { currencies: string[]; rates: Record<string, number> };
type PaymentType = "deposit" | "full";

const DEPOSIT_PERCENT = Number(process.env.NEXT_PUBLIC_DEPOSIT_PERCENT) || 20;

/** Best-effort currency guess from the browser locale; falls back to AUD. */
function guessCurrency(supported: string[]): string {
  const map: Record<string, string> = {
    US: "USD", GB: "GBP", NZ: "NZD", CA: "CAD", SG: "SGD", JP: "JPY",
    DE: "EUR", FR: "EUR", IE: "EUR", ES: "EUR", IT: "EUR", NL: "EUR",
  };
  try {
    const region = new Intl.Locale(navigator.language).region ?? "AU";
    const guess = region === "AU" ? "AUD" : map[region];
    if (guess && supported.includes(guess)) return guess;
  } catch {
    /* ignore */
  }
  return "AUD";
}

export default function CheckoutModal({
  draft,
  onClose,
}: {
  draft: CheckoutDraft;
  onClose: () => void;
}) {
  const [stage, setStage] = useState<"details" | "payment">("details");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [currency, setCurrency] = useState("AUD");
  const [paymentType, setPaymentType] = useState<PaymentType>("deposit");

  const [rates, setRates] = useState<RatesResponse | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [serverAmounts, setServerAmounts] = useState<{
    amountDueNowAud: number;
    presentmentAmount: number;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/rates")
      .then((r) => r.json())
      .then((d: RatesResponse) => {
        setRates(d);
        setCurrency(guessCurrency(d.currencies ?? ["AUD"]));
      })
      .catch(() => setRates({ currencies: ["AUD"], rates: { AUD: 1 } }));
  }, []);

  const depositAud = useMemo(
    () => Math.round(draft.totalAud * (DEPOSIT_PERCENT / 100) * 100) / 100,
    [draft.totalAud],
  );
  const dueNowAud = paymentType === "deposit" ? depositAud : draft.totalAud;
  const rate = rates?.rates?.[currency] ?? 1;
  const converted = dueNowAud * rate;

  async function startPayment(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tourId: draft.tourId,
          guests: draft.guests,
          addOnIds: draft.addOnIds,
          currency,
          paymentType,
          customer: { name, email, phone },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not start payment.");
      setClientSecret(data.clientSecret);
      setOrderId(data.orderId);
      setServerAmounts({
        amountDueNowAud: data.amountDueNowAud,
        presentmentAmount: data.presentmentAmount,
      });
      setStage("payment");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" aria-label="Close" onClick={onClose}>
          ×
        </button>

        {stage === "details" && (
          <form onSubmit={startPayment}>
            <h3>Book &amp; pay</h3>
            <p className="sub">Secure your spot on {draft.tourName}.</p>

            <div className="summary">
              <div className="row">
                <span>{draft.tourName}</span>
                <span>
                  {draft.guests} guest{draft.guests > 1 ? "s" : ""}
                </span>
              </div>
              <div className="row">
                <b>Tour total</b>
                <b>{money(draft.totalAud)}</b>
              </div>
            </div>

            <div className="field">
              <span className="flabel">Pay now</span>
              <div className="pay-toggle">
                <button
                  type="button"
                  className={paymentType === "deposit" ? "on" : ""}
                  onClick={() => setPaymentType("deposit")}
                >
                  {DEPOSIT_PERCENT}% deposit
                  <small>{money(depositAud)}</small>
                </button>
                <button
                  type="button"
                  className={paymentType === "full" ? "on" : ""}
                  onClick={() => setPaymentType("full")}
                >
                  Pay in full
                  <small>{money(draft.totalAud)}</small>
                </button>
              </div>
            </div>

            <div className="field">
              <label className="flabel" htmlFor="co-currency">
                Pay in your currency
              </label>
              <select
                id="co-currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                {(rates?.currencies ?? ["AUD"]).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="summary">
              <div className="row">
                <b>Due now</b>
                <b>
                  {money(dueNowAud)}
                  {currency !== "AUD" && (
                    <span className="muted">
                      {" "}
                      ≈ {formatCurrency(converted, currency)}
                    </span>
                  )}
                </b>
              </div>
              {paymentType === "deposit" && (
                <div className="row muted">
                  <span>Balance due before your tour</span>
                  <span>{money(draft.totalAud - depositAud)}</span>
                </div>
              )}
              {currency !== "AUD" && (
                <p className="muted" style={{ fontSize: 12, marginTop: 6 }}>
                  Charged in {currency} at the mid-market rate. Your tax invoice is
                  issued in AUD.
                </p>
              )}
            </div>

            {error && <div className="form-msg err">{error}</div>}

            <div className="field">
              <label className="flabel" htmlFor="co-name">Your name</label>
              <input id="co-name" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="field">
              <label className="flabel" htmlFor="co-email">Email</label>
              <input id="co-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="field">
              <label className="flabel" htmlFor="co-phone">Phone (optional)</label>
              <input id="co-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>

            <div className="modal-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={busy}
                style={{ flex: 1, justifyContent: "center" }}
              >
                {busy ? "Preparing…" : "Continue to payment →"}
              </button>
            </div>
          </form>
        )}

        {stage === "payment" && clientSecret && orderId && (
          <Elements
            stripe={getStripe()}
            options={{ clientSecret, appearance: { theme: "flat" } }}
          >
            <PaymentStep
              orderId={orderId}
              tourName={draft.tourName}
              dueNowAud={serverAmounts?.amountDueNowAud ?? dueNowAud}
              currency={currency}
              presentmentAmount={serverAmounts?.presentmentAmount ?? converted}
              onBack={() => setStage("details")}
            />
          </Elements>
        )}
      </div>
    </div>
  );
}

function PaymentStep({
  orderId,
  tourName,
  dueNowAud,
  currency,
  presentmentAmount,
  onBack,
}: {
  orderId: string;
  tourName: string;
  dueNowAud: number;
  currency: string;
  presentmentAmount: number;
  onBack: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setBusy(true);
    setError("");

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success?orderId=${orderId}`,
      },
    });

    // If we get here, confirmation failed immediately (e.g. validation/decline);
    // otherwise the browser has already redirected to return_url.
    if (submitError) {
      setError(submitError.message ?? "Your payment could not be processed.");
      setBusy(false);
    }
  }

  const amountLabel =
    currency === "AUD"
      ? money(dueNowAud)
      : `${formatCurrency(presentmentAmount, currency)} (${money(dueNowAud)})`;

  return (
    <form onSubmit={pay}>
      <h3>Payment</h3>
      <p className="sub">
        {tourName} — paying {amountLabel}.
      </p>

      <PaymentElement />

      {error && <div className="form-msg err" style={{ marginTop: 12 }}>{error}</div>}

      <div className="modal-actions" style={{ marginTop: 16 }}>
        <button type="button" className="btn" onClick={onBack} disabled={busy}>
          ← Back
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!stripe || busy}
          style={{ flex: 1, justifyContent: "center" }}
        >
          {busy ? "Processing…" : `Pay ${amountLabel}`}
        </button>
      </div>
    </form>
  );
}
