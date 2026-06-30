import Header from "@/components/Header";
import Hero from "@/components/Hero";
import TwoDoors from "@/components/TwoDoors";
import StackingCards from "@/components/StackingCards";
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
      <Hero />
      <TwoDoors />
      <StackingCards />
      <TourBuilder tours={tours} />
      <JimmyStrip />
      <Footer />
    </>
  );
}
