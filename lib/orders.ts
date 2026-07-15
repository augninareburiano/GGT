/** Shared order types (safe to import on client and server). */

export type OrderStatus =
  | "pending" // created, awaiting first payment
  | "deposit_paid" // deposit captured, balance owing
  | "paid" // paid in full
  | "failed" // last payment attempt failed
  | "cancelled"
  | "refunded"
  | "partially_refunded";

export type OrderAddOn = { id: string; name: string; price: number };

export type Order = {
  id: string;
  tourId: string;
  tourName: string;
  guests: number;
  addOns: OrderAddOn[];
  customer: { name: string; email: string; phone: string };

  // AUD is the accounting currency (invoices, GST).
  subtotalAud: number;
  gstAud: number;
  totalAud: number;
  depositAud: number;
  balanceAud: number;

  // Presentment: what the customer is actually charged.
  presentmentCurrency: string;
  fxRate: number; // 1 AUD = fxRate * presentmentCurrency
  fxCapturedAt: string;
  amountDueNowAud: number;
  presentmentAmount: number; // major units, in presentmentCurrency

  paymentType: "deposit" | "full";
  balanceDueDate: string | null;
  status: OrderStatus;
  stripePaymentIntentIds: string[];
  invoiceNumber: string | null;
  createdAt: string | null;
};
