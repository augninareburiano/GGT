import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TourEnquiryButton from "@/components/TourEnquiryButton";
import {
  SHOWCASE_TOURS,
  getShowcaseTour,
  galleryTileBg,
  GROUP_SIZE,
} from "@/lib/showcase";

type Params = { id: string };

export function generateStaticParams(): Params[] {
  return SHOWCASE_TOURS.map((t) => ({ id: t.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const tour = getShowcaseTour(id);
  if (!tour) return { title: "Tour not found — Gourmet Getaway Tours" };
  return {
    title: `${tour.name} — Gourmet Getaway Tours`,
    description: tour.blurb,
  };
}

export default async function TourDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const tour = getShowcaseTour(id);
  if (!tour) notFound();

  return (
    <>
      <Header />
      <main className="tour-detail">
        {/* Placeholder hero — swap `bg` in lib/showcase.ts for a photo. */}
        <div className="tour-hero" style={{ background: tour.bg }}>
          <div className="tour-hero-scrim" aria-hidden />
          <div className="wrap tour-hero-inner">
            <Link href="/tours" className="tour-back">
              ← All tours
            </Link>
            <p className="tour-hero-region">{tour.region}</p>
            <h1>{tour.name}</h1>
          </div>
        </div>

        <div className="wrap tour-detail-grid">
          <article className="tour-detail-main">
            <div className="tour-facts">
              <div>
                <span className="tour-fact-label">From</span>
                <b>{tour.from}</b>
                <span className="tour-fact-note">per person</span>
              </div>
              <div>
                <span className="tour-fact-label">Duration</span>
                <b>{tour.duration}</b>
              </div>
              <div>
                <span className="tour-fact-label">Group</span>
                <b>{GROUP_SIZE}</b>
                <span className="tour-fact-note">private, just yours</span>
              </div>
            </div>

            <section className="tour-section">
              <h2>The day</h2>
              {tour.description.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </section>

            <section className="tour-section">
              <h2>What&apos;s included</h2>
              <ul className="tour-highlights">
                {tour.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </section>

            <section className="tour-section">
              <h2>Gallery</h2>
              {/* Placeholder tiles until photography lands (lib/showcase.ts). */}
              <div className="tour-gallery">
                {tour.gallery.map((caption, i) => (
                  <div
                    key={caption}
                    className="tour-gallery-tile"
                    style={{ background: galleryTileBg(tour.bg, i) }}
                  >
                    <span>{caption}</span>
                    <span className="tour-gallery-ph">Photo coming soon</span>
                  </div>
                ))}
              </div>
            </section>
          </article>

          <aside className="tour-detail-side">
            <div className="tour-cta-card">
              <p className="eyebrow">Ready when you are</p>
              <p className="tour-cta-from">
                from <b>{tour.from}</b> / person
              </p>
              {tour.tourId ? (
                <>
                  <Link
                    href={`/?tour=${tour.tourId}#builder`}
                    className="btn btn-primary tour-cta-btn"
                  >
                    Build your tour →
                  </Link>
                  <p className="tour-cta-note">
                    Set your group and extras, see the price as you go.
                  </p>
                </>
              ) : (
                <>
                  <TourEnquiryButton tourId={tour.id} tourName={tour.name} />
                  <p className="tour-cta-note">
                    Pricing for this tour is finalised per group — send an
                    enquiry and Jimmy will put a day together for you.
                  </p>
                </>
              )}
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
