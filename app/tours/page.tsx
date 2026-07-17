import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SHOWCASE_TOURS } from "@/lib/showcase";

export const metadata: Metadata = {
  title: "Private tours — Gourmet Getaway Tours",
  description:
    "Nine private food, wine and adventure tours across New South Wales. Pick a starting point, set your group, and build the day around what you love.",
};

export default function ToursPage() {
  return (
    <>
      <Header />
      <main className="tours-page">
        <div className="wrap">
          <header className="tours-head">
            <p className="eyebrow">Private tours</p>
            <h1>Nine ways to spend the day.</h1>
            <p className="tours-lead">
              Every tour is private, owner-operated, and yours to shape. Pick a
              starting point below, then build the day around your group.
            </p>
          </header>

          <div className="tours-grid">
            {SHOWCASE_TOURS.map((tour) => (
              <Link
                key={tour.id}
                href={`/tours/${tour.id}`}
                className="tour-card"
              >
                {/* Placeholder art — swap `bg` in lib/showcase.ts for a photo. */}
                <div className="tour-card-art" style={{ background: tour.bg }}>
                  <span className="tour-card-region">{tour.region}</span>
                </div>
                <div className="tour-card-body">
                  <h2>{tour.name}</h2>
                  <p className="tour-card-blurb">{tour.blurb}</p>
                  <p className="tour-card-foot">
                    <span className="from">
                      from <b>{tour.from}</b> / person
                    </span>
                    <span className="tour-card-more">View tour →</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
