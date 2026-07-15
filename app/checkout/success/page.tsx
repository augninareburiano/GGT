"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { money } from "@/lib/money";

type OrderView = {
  tourName: string;
  status: string;
  paymentType: "deposit" | "full";
  balanceAud: number;
  invoiceNumber: string | null;
  customerName: string;
};

function SuccessInner() {
  const params = useSearchParams();
  const orderId = params.get("orderId");
  const redirectStatus = params.get("redirect_status");

  const [order, setOrder] = useState<OrderView | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "pending" | "failed" | "error">(
    "loading",
  );

  useEffect(() => {
    if (!orderId) {
      setState("error");
      return;
    }
    if (redirectStatus === "failed") {
      setState("failed");
      return;
    }

    let tries = 0;
    let cancelled = false;

    // The webhook confirms payment asynchronously — poll until the order leaves
    // the "pending" state (or give up and show an optimistic message).
    async function poll() {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (!res.ok) throw new Error();
        const data: OrderView = await res.json();
        if (cancelled) return;
        setOrder(data);
        if (data.status === "deposit_paid" || data.status === "paid") {
          setState("ready");
          return;
        }
        if (data.status === "failed") {
          setState("failed");
          return;
        }
      } catch {
        if (cancelled) return;
      }
      if (++tries < 8) {
        setTimeout(poll, 1500);
      } else if (!cancelled) {
        setState("pending");
      }
    }
    poll();
    return () => {
      cancelled = true;
    };
  }, [orderId, redirectStatus]);

  if (state === "loading") {
    return <Card title="Confirming your payment…" body="Just a moment." />;
  }
  if (state === "failed") {
    return (
      <Card
        title="Payment not completed"
        body="Your payment didn't go through and you haven't been charged. Please head back and try again."
      />
    );
  }
  if (state === "error") {
    return <Card title="We couldn't find that order" body="Please check your confirmation email." />;
  }

  const paid = state === "ready" && order;
  const title = paid
    ? `You're booked, ${order!.customerName || "friend"}! 🎉`
    : "Payment received — finalising";
  const body = paid
    ? order!.paymentType === "deposit"
      ? `Your deposit for ${order!.tourName} is in. Balance owing: ${money(order!.balanceAud)}, due before your tour.`
      : `Your payment for ${order!.tourName} is complete. Nothing further to pay.`
    : "Your payment went through. Your receipt and tax invoice are on their way by email.";

  return (
    <Card title={title} body={body}>
      {paid && order!.invoiceNumber && (
        <a className="btn btn-primary" href={`/api/invoices/${order!.invoiceNumber}`} target="_blank" rel="noreferrer">
          View tax invoice {order!.invoiceNumber} →
        </a>
      )}
      <Link className="btn" href="/" style={{ marginTop: 10 }}>
        Back to home
      </Link>
    </Card>
  );
}

function Card({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <main style={{ maxWidth: 560, margin: "80px auto", padding: "0 20px", textAlign: "center" }}>
      <h1 style={{ fontSize: 28, marginBottom: 12 }}>{title}</h1>
      <p style={{ color: "#555", lineHeight: 1.6 }}>{body}</p>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, marginTop: 24 }}>
        {children}
      </div>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<Card title="Loading…" body="" />}>
      <SuccessInner />
    </Suspense>
  );
}
