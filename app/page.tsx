import Header from "@/components/Header";
import DestinationCarousel from "@/components/DestinationCarousel";
import TwoDoors from "@/components/TwoDoors";
import TourBuilder from "@/components/TourBuilder";
import JimmyStrip from "@/components/JimmyStrip";
import Footer from "@/components/Footer";
import { getTours } from "@/lib/tours.server";

// Re-fetch tour data on each request so Firestore edits show up without rebuild.
export const dynamic = "force-dynamic";

export default async function Home() {
  const tours = await getTours();

  return (
    <>
      <Header />
      <main id="main" tabIndex={-1}>
        <DestinationCarousel />
        <TwoDoors />
        <TourBuilder tours={tours} />
        <JimmyStrip />
      </main>
      <Footer />
    </>
  );
}
