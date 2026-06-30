import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

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
      <body className={plexMono.variable}>{children}</body>
    </html>
  );
}
