import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

// Plausible loads only when a domain is configured, so local/dev stays clean.
const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
const plausibleSrc =
  process.env.NEXT_PUBLIC_PLAUSIBLE_SRC ?? "https://plausible.io/js/script.js";

export const metadata: Metadata = {
  title: "Gourmet Getaway Tours — food, wine & adventure tours from Sydney",
  description:
    "Owner-operated food, wine and adventure tours across New South Wales. Pick the place, set your group, choose your extras — and watch the price add up as you go.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={plexMono.variable}>
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        {children}
        {plausibleDomain && (
          <Script
            defer
            data-domain={plausibleDomain}
            src={plausibleSrc}
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
