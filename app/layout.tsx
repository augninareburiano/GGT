import type { Metadata } from "next";
import Script from "next/script";
import {
  IBM_Plex_Mono,
  Caveat,
  Fraunces,
  Hanken_Grotesk,
  Bricolage_Grotesque,
  Poppins,
} from "next/font/google";
import "./globals.css";
import TypeSwitcher from "@/components/TypeSwitcher";
import { SITE_URL, SITE_NAME, HOME_DESCRIPTION, organizationJsonLd } from "@/lib/seo";
import { FAREHARBOR_ENABLED } from "@/lib/fareharbor";

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

// Handwriting accent — used for the postcard signatures in the testimonials.
const caveat = Caveat({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-hand",
  display: "swap",
});

/* ── Type exploration (nature + glass) ──────────────────────────────────
   Three candidate directions loaded side by side so they can be compared
   live via the dev-only <TypeSwitcher>. globals.css maps each to --font /
   --font-display through a body.type-{a,b,c} class. TYPE_DEFAULT sets the
   server-rendered starting point. Once a direction is chosen, keep that
   one family and delete the other two loaders + the switcher. */
const TYPE_DEFAULT: "a" | "b" | "c" | "d" | "e" = "d";

// A — editorial serif display: warm, "gourmet" headlines over the glass.
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  variable: "--font-fraunces",
  display: "swap",
});
// A & C — clean humanist body / all-rounder.
const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-hanken",
  display: "swap",
});
// B — one organic grotesque for headlines + body.
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-bricolage",
  display: "swap",
});
// E — geometric sans (Helvetica is a system stack, needs no loader → D).
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

/*
  Brand name first, then the phrase the page is trying to win — the pattern the
  client's existing site already ranks with, and the same pairing as the home
  page's H1/H2. This is the site-wide default; the legal pages set their own
  titles through the template below.
*/
const TITLE =
  "Gourmet Getaway Tours | Hunter Valley Food and Wine Tour in NSW";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: HOME_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    title: TITLE,
    description: HOME_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "en_AU",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: HOME_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${plexMono.variable} ${caveat.variable} ${fraunces.variable} ${hanken.variable} ${bricolage.variable} ${poppins.variable} type-${TYPE_DEFAULT}`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd()),
          }}
        />
        <TypeSwitcher />
        {children}

        {/*
          FareHarbor embed API. `autolightframe=yes` makes it intercept clicks
          on any fareharbor.com/embeds/book/… link on the page and open it in a
          modal, which is how every booking CTA here works.
        */}
        {FAREHARBOR_ENABLED && (
          <Script
            src="https://fareharbor.com/embeds/api/v1/?autolightframe=yes"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
