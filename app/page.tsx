import Header from "@/components/Header";
import DestinationCarousel from "@/components/DestinationCarousel";
import Motto from "@/components/Motto";
import TwoDoors from "@/components/TwoDoors";
import TourBuilder from "@/components/TourBuilder";
import JimmyStrip from "@/components/JimmyStrip";
import Testimonials from "@/components/Testimonials";
import SocialCTA from "@/components/SocialCTA";
import Footer from "@/components/Footer";
import { getTours } from "@/lib/tours.server";
import { toursJsonLd } from "@/lib/seo";

// Re-fetch tour data on each request so Firestore edits show up without rebuild.
export const dynamic = "force-dynamic";

export default async function Home() {
  const tours = await getTours();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(toursJsonLd(tours)),
        }}
      />
      <Header />
      <DestinationCarousel />
      <Motto />
      <TwoDoors />
      <TourBuilder tours={tours} />
      <JimmyStrip />
      <Testimonials />
      <SocialCTA />
      <Footer />
    </>
  );
}
