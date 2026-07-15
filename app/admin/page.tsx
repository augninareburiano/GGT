"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase.client";
import { money } from "@/lib/money";
import type { Tour } from "@/lib/tours";

type EnquiryStatus = "new" | "confirmed" | "handled";

type Enquiry = {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  tourName: string;
  guests: number;
  addOns: { id: string; name: string; price: number }[];
  total: number;
  preferredDate: string | null;
  tourDate: string | null;
  status: EnquiryStatus;
  createdAt: string | null;
};

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [loadError, setLoadError] = useState("");

  // Auth guard.
  useEffect(() => {
    const auth = getFirebaseAuth();
    return onAuthStateChanged(auth, (u) => {
      if (!u) {
        router.replace("/admin/login");
        return;
      }
      setUser(u);
      setChecking(false);
    });
  }, [router]);

  const authHeader = useCallback(async () => {
    const token = await user?.getIdToken();
    return { Authorization: `Bearer ${token}` };
  }, [user]);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoadError("");
    try {
      const headers = await authHeader();
      const [eRes, tRes] = await Promise.all([
        fetch("/api/enquiries", { headers }),
        fetch("/api/tours"),
      ]);
      if (eRes.status === 401) {
        setLoadError(
          "Your account isn't on the admin allowlist (ADMIN_EMAILS).",
        );
        return;
      }
      const eData = await eRes.json();
      const tData = await tRes.json();
      setEnquiries(eData.enquiries ?? []);
      setTours(tData.tours ?? []);
    } catch {
      setLoadError("Failed to load data.");
    }
  }, [user, authHeader]);

  useEffect(() => {
    if (user) loadData();
  }, [user, loadData]);

  async function setStatus(id: string, status: EnquiryStatus) {
    const headers = { ...(await authHeader()), "Content-Type": "application/json" };
    await fetch(`/api/enquiries/${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ status }),
    });
    setEnquiries((list) =>
      list.map((e) => (e.id === id ? { ...e, status } : e)),
    );
  }

  async function confirmBooking(id: string, tourDate: string) {
    const headers = { ...(await authHeader()), "Content-Type": "application/json" };
    const res = await fetch(`/api/enquiries/${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ status: "confirmed", tourDate }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.error ?? "Failed to confirm booking.");
      return;
    }
    setEnquiries((list) =>
      list.map((e) =>
        e.id === id ? { ...e, status: "confirmed", tourDate } : e,
      ),
    );
  }

  async function saveTour(tour: Tour) {
    const headers = { ...(await authHeader()), "Content-Type": "application/json" };
    const res = await fetch("/api/tours", {
      method: "PUT",
      headers,
      body: JSON.stringify(tour),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.error ?? "Failed to save tour.");
      return;
    }
    loadData();
  }

  async function deleteTour(id: string) {
    if (!confirm(`Delete tour "${id}"?`)) return;
    const headers = await authHeader();
    await fetch(`/api/tours?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers,
    });
    loadData();
  }

  if (checking) {
    return (
      <main className="admin">
        <div className="wrap">
          <p className="muted">Loading…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="admin">
      <div className="wrap">
        <div className="admin-bar">
          <h1>Admin dashboard</h1>
          <button
            className="btn btn-ghost"
            onClick={() => signOut(getFirebaseAuth())}
          >
            Sign out
          </button>
        </div>
        <p className="muted">Signed in as {user?.email}</p>

        {loadError && <div className="form-msg err">{loadError}</div>}

        <h2>Enquiries ({enquiries.length})</h2>
        {enquiries.length === 0 && <p className="muted">No enquiries yet.</p>}
        {enquiries.map((e) => (
          <EnquiryCard
            key={e.id}
            enquiry={e}
            onConfirm={confirmBooking}
            onSetStatus={setStatus}
          />
        ))}

        <h2>Tours ({tours.length})</h2>
        {tours.map((t) => (
          <TourEditor
            key={t.id}
            tour={t}
            onSave={saveTour}
            onDelete={() => deleteTour(t.id)}
          />
        ))}
        <NewTour onSave={saveTour} existingCount={tours.length} />
      </div>
    </main>
  );
}

function fmtDate(ymd: string | null): string {
  if (!ymd) return "—";
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12)).toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function EnquiryCard({
  enquiry: e,
  onConfirm,
  onSetStatus,
}: {
  enquiry: Enquiry;
  onConfirm: (id: string, tourDate: string) => void;
  onSetStatus: (id: string, status: EnquiryStatus) => void;
}) {
  // Tour date the admin will lock in — defaults to the guest's preferred date.
  const [date, setDate] = useState(e.tourDate ?? e.preferredDate ?? "");

  return (
    <div className="card-box">
      <div className="enq-head">
        <b>
          {e.name} · {e.tourName}
        </b>
        <span className={`badge ${e.status !== "new" ? "handled" : ""}`}>
          {e.status}
        </span>
      </div>
      <p className="enq-meta">
        {e.email}
        {e.phone ? ` · ${e.phone}` : ""}
        {e.createdAt
          ? ` · ${new Date(e.createdAt).toLocaleString("en-AU")}`
          : ""}
      </p>
      <p style={{ marginTop: 8, fontSize: 14 }}>
        {e.guests} guest{e.guests > 1 ? "s" : ""} ·{" "}
        {e.addOns.length
          ? e.addOns.map((a) => a.name).join(", ")
          : "no add-ons"}{" "}
        · <b>{money(e.total)}</b>
      </p>
      <p style={{ marginTop: 8, fontSize: 14 }} className="muted">
        Preferred: {fmtDate(e.preferredDate)}
        {e.status === "confirmed" && ` · Confirmed for ${fmtDate(e.tourDate)}`}
      </p>
      {e.message && (
        <p style={{ marginTop: 8, fontSize: 14 }} className="muted">
          “{e.message}”
        </p>
      )}

      <div
        style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}
      >
        <input
          type="date"
          value={date}
          onChange={(ev) => setDate(ev.target.value)}
          aria-label="Tour date"
        />
        <button
          className="btn btn-primary"
          disabled={!date}
          onClick={() => onConfirm(e.id, date)}
        >
          {e.status === "confirmed" ? "Update date" : "Confirm booking"}
        </button>
        {e.status === "new" ? (
          <button className="btn btn-ghost" onClick={() => onSetStatus(e.id, "handled")}>
            Mark handled
          </button>
        ) : (
          <button className="btn btn-ghost" onClick={() => onSetStatus(e.id, "new")}>
            Reopen
          </button>
        )}
      </div>
    </div>
  );
}

function TourEditor({
  tour,
  onSave,
  onDelete,
}: {
  tour: Tour;
  onSave: (t: Tour) => void;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState<Tour>(tour);

  function updateAddon(idx: number, patch: Partial<Tour["addOns"][number]>) {
    setDraft((d) => ({
      ...d,
      addOns: d.addOns.map((a, i) => (i === idx ? { ...a, ...patch } : a)),
    }));
  }

  return (
    <div className="card-box">
      <div className="tour-edit">
        <input
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          placeholder="Tour name"
        />
        <input
          type="number"
          value={draft.base}
          onChange={(e) => setDraft({ ...draft, base: Number(e.target.value) })}
          placeholder="Base"
        />
        <input
          type="number"
          value={draft.min}
          onChange={(e) => setDraft({ ...draft, min: Number(e.target.value) })}
          placeholder="Min"
        />
      </div>
      <p className="enq-meta" style={{ marginBottom: 10 }}>
        id: {draft.id}
      </p>

      {draft.addOns.map((a, i) => (
        <div className="tour-edit" key={a.id}>
          <input
            value={a.name}
            onChange={(e) => updateAddon(i, { name: e.target.value })}
            placeholder="Add-on name"
          />
          <input
            type="number"
            value={a.price}
            onChange={(e) => updateAddon(i, { price: Number(e.target.value) })}
            placeholder="Price"
          />
          <button
            className="btn btn-ghost"
            onClick={() =>
              setDraft((d) => ({
                ...d,
                addOns: d.addOns.filter((_, idx) => idx !== i),
              }))
            }
          >
            Remove
          </button>
        </div>
      ))}

      <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
        <button
          className="btn btn-ghost"
          onClick={() =>
            setDraft((d) => ({
              ...d,
              addOns: [
                ...d.addOns,
                { id: `addon-${Date.now()}`, name: "New add-on", price: 0 },
              ],
            }))
          }
        >
          + Add-on
        </button>
        <button className="btn btn-primary" onClick={() => onSave(draft)}>
          Save
        </button>
        <button className="btn btn-ghost" onClick={onDelete}>
          Delete tour
        </button>
      </div>
    </div>
  );
}

function NewTour({
  onSave,
  existingCount,
}: {
  onSave: (t: Tour) => void;
  existingCount: number;
}) {
  const [id, setId] = useState("");
  const [name, setName] = useState("");

  function create() {
    const slug = id.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-");
    if (!slug || !name.trim()) {
      alert("Enter an id (slug) and a name.");
      return;
    }
    onSave({
      id: slug,
      name: name.trim(),
      base: 0,
      min: 2,
      order: existingCount + 1,
      addOns: [],
    });
    setId("");
    setName("");
  }

  return (
    <div className="card-box">
      <b>Add a new tour</b>
      <div className="tour-edit" style={{ marginTop: 10 }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tour name"
        />
        <input
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="id-slug"
          style={{ gridColumn: "span 1" }}
        />
        <button className="btn btn-primary" onClick={create}>
          Create
        </button>
      </div>
    </div>
  );
}
