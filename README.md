# Gourmet Getaway Tours

Marketing site + interactive tour builder for Gourmet Getaway Tours, converted
from the original HTML mockup to **Next.js (App Router) + TypeScript**, with a
**Firebase** backend and deployment on **Netlify**.

## What's here

- **Homepage** (`app/page.tsx`) — sticky header, hero, two doors, sticky
  stacking cards, the interactive tour builder, Jimmy bio, footer. Styling is
  the original mockup CSS, ported verbatim into `app/globals.css`.
- **Tour builder** (`components/TourBuilder.tsx`) — destination select, guest
  stepper, per-person add-ons, live price bill, and a "Send enquiry" modal.
- **Enquiries** — submitted to `POST /api/enquiries`, validated with `zod`,
  saved to Firestore via the Admin SDK, and emailed to the business (Resend).
- **Tours in Firestore** — read server-side with a fallback to `SEED_TOURS`
  (`lib/tours.ts`) so the site always renders. Seed with `npm run seed`.
- **Admin** (`/admin`) — Firebase Auth login + dashboard to view/handle
  enquiries and edit tours. Access restricted to the `ADMIN_EMAILS` allowlist.

## Setup

1. Install dependencies:
   ```
   npm install
   ```
2. Create a Firebase project; enable **Firestore** and **Authentication →
   Email/Password**. Create an admin user (Authentication → Users) and add their
   email to `ADMIN_EMAILS`.
3. Copy `.env.local.example` to `.env.local` and fill in all values (web app
   config + service-account JSON + admin email; Resend is optional).
4. Seed tour data:
   ```
   npm run seed
   ```
5. Run locally:
   ```
   npm run dev
   ```

## Firestore security rules

`firestore.rules` denies all direct client access — every read of enquiries and
all writes go through the Admin SDK in API routes. Deploy with the Firebase CLI:
```
firebase deploy --only firestore:rules
```

## Deploy to Netlify

1. Push this repo to GitHub and import it into Netlify ("Add new site → Import
   an existing project"). Netlify auto-detects Next.js and installs
   `@netlify/plugin-nextjs`; the build command is `next build`.
2. Add every variable from `.env.local.example` to the Netlify site's
   Environment Variables (Site configuration → Environment variables),
   including `FIREBASE_SERVICE_ACCOUNT` as a single-line JSON string.
3. Deploy. The app runs on Netlify; Firebase only provides Firestore + Auth.

## Notes

- Image placeholders are CSS gradients (matching the mockup); swap in real
  photos via `next/image` as a follow-up.
- Email uses Resend. To use the pure-Firebase "Trigger Email" extension instead,
  remove `sendNotification` from `app/api/enquiries/route.ts` and write to a
  `mail` collection / install the extension.
- Enquiries are written to Firestore *before* either email is attempted, and
  both sends are best-effort — a Resend outage, a bad key or an unverified
  domain can never lose an enquiry or fail the request. Rejected sends are
  logged server-side (`… rejected by Resend …`); the client is told the
  enquiry succeeded, because it did.
- Sending requires a domain verified in Resend that exactly matches the domain
  in `ENQUIRY_FROM_EMAIL`. See the comments in `.env.local.example`.
