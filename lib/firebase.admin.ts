import {
  cert,
  getApp,
  getApps,
  initializeApp,
  type App,
} from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

/**
 * Initialises the Firebase Admin SDK on the server.
 *
 * Credentials are read from the FIREBASE_SERVICE_ACCOUNT env var, which should
 * contain the full service-account JSON (as a single-line string). Guards
 * against re-initialisation during hot reloads.
 */
function getAdminApp(): App {
  if (getApps().length) return getApp();

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT env var is not set. Add the service-account JSON to your environment.",
    );
  }

  const serviceAccount = JSON.parse(raw);
  // Support keys whose newlines were escaped when stored as an env var.
  if (typeof serviceAccount.private_key === "string") {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
  }

  return initializeApp({ credential: cert(serviceAccount) });
}

export function adminDb(): Firestore {
  return getFirestore(getAdminApp());
}

export function adminAuth(): Auth {
  return getAuth(getAdminApp());
}

/** Email allowlist for admin access (comma-separated ADMIN_EMAILS env var). */
export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  const allow = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allow.includes(email.toLowerCase());
}

/**
 * Verifies the Bearer token from an incoming request and ensures the caller is
 * an allowlisted admin. Returns the decoded token, or null if unauthorised.
 */
export async function verifyAdmin(authHeader: string | null) {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const idToken = authHeader.slice("Bearer ".length).trim();
  try {
    const decoded = await adminAuth().verifyIdToken(idToken);
    if (!isAdminEmail(decoded.email)) return null;
    return decoded;
  } catch {
    return null;
  }
}
