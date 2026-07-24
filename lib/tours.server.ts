import "server-only";
import { adminDb } from "./firebase.admin";
import { DEFAULT_MAX_GUESTS, SEED_TOURS, type Tour } from "./tours";

/**
 * Fetches tours from the Firestore `tours` collection, ordered by `order`.
 * Falls back to SEED_TOURS when the collection is empty or Firestore is
 * unreachable / unconfigured, so the homepage always renders.
 */
export async function getTours(): Promise<Tour[]> {
  try {
    const snap = await adminDb().collection("tours").orderBy("order").get();
    if (snap.empty) return SEED_TOURS;
    return snap.docs.map((d) => {
      const data = d.data();
      // Spread rather than list fields by hand — the field list has gone
      // stale before (this is the second pricing-shape change) and a
      // hand-copied list silently drops whatever's newest.
      return {
        ...data,
        id: d.id,
        max: data.max ?? DEFAULT_MAX_GUESTS,
        addOns: data.addOns ?? [],
      } as Tour;
    });
  } catch (err) {
    console.warn("getTours: falling back to seed data –", err);
    return SEED_TOURS;
  }
}
