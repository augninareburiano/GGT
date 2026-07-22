import Header from "@/components/Header";
import DestinationCarousel from "@/components/DestinationCarousel";
import Motto from "@/components/Motto";
import TwoDoors from "@/components/TwoDoors";
import TourBuilder from "@/components/TourBuilder";
import JimmyStrip from "@/components/JimmyStrip";
import Testimonials from "@/components/Testimonials";
import SocialCTA from "@/components/SocialCTA";
import Footer from "@/components/Footer";
import CurrencyProvider from "@/components/CurrencyProvider";
import { getTours } from "@/lib/tours.server";
import { toursJsonLd } from "@/lib/seo";
import { detectCountry } from "@/lib/geo.server";

// Re-fetch tour data on each request so Firestore edits show up without rebuild.
export const dynamic = "force-dynamic";

export default async function Home() {
  const tours = await getTours();
  // A header read, not a network call — costs nothing, and the page is already
  // dynamic. Rates are fetched client-side so nothing here can delay a price.
  const country = await detectCountry();

  return (
    <>
      {/*
        Structured data stays in AUD regardless of what the visitor sees on the
        page — it describes what the business charges, not what we display.
      */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(toursJsonLd(tours)),
        }}
      />
      <CurrencyProvider initialCountry={country}>
        <Header />
        <DestinationCarousel />
        <Motto />
        <TwoDoors />
        <TourBuilder tours={tours} />
        <JimmyStrip />
        <Testimonials />
        <SocialCTA />
        <Footer />
      </CurrencyProvider>
    </>
  );
}
