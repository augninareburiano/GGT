/**
 * Seeds the Firestore `tours` collection with SEED_TOURS.
 *
 * Usage:
 *   1. Ensure FIREBASE_SERVICE_ACCOUNT is set (e.g. in .env.local).
 *   2. npm run seed
 *
 * Safe to re-run: it upserts each tour by id (merge), so existing edits to
 * other fields are overwritten with the seed values.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { SEED_TOURS } from "../lib/tours";

// Minimal .env.local loader (so the script works without extra deps).
function loadEnvLocal() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) return;
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    /* no .env.local — rely on the ambient environment */
  }
}

async function main() {
  loadEnvLocal();

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT is not set.");
  }
  const serviceAccount = JSON.parse(raw);
  if (typeof serviceAccount.private_key === "string") {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
  }

  if (!getApps().length) {
    initializeApp({ credential: cert(serviceAccount) });
  }
  const db = getFirestore();

  const batch = db.batch();
  for (const { id, base, min, ...rest } of SEED_TOURS) {
    // A merge write leaves fields absent from `rest` untouched, so a tour
    // that previously had a placeholder base/min needs an explicit delete,
    // not just an omission, to actually clear it.
    batch.set(
      db.collection("tours").doc(id),
      { ...rest, base: base ?? FieldValue.delete(), min: min ?? FieldValue.delete() },
      { merge: true },
    );
  }
  await batch.commit();

  console.log(`Seeded ${SEED_TOURS.length} tours.`);
}

main().then(
  () => process.exit(0),
  (err) => {
    console.error(err);
    process.exit(1);
  },
);
