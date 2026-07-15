import type { Tour } from "./tours";

/** Canonical production origin — used for metadataBase, canonical URLs, sitemap and JSON-LD. */
export const SITE_URL = "https://gourmetgetawaytours.com.au";

export const SITE_NAME = "Gourmet Getaway Tours";

export const SITE_DESCRIPTION =
  "Owner-operated food, wine and adventure tours across New South Wales. Pick the place, set your group, choose your extras — and watch the price add up as you go.";

/** Business phone, mirrored from the site footer. */
export const BUSINESS_PHONE = "+61416139567";

/**
 * JSON-LD describing the business itself. TravelAgency is a subtype of
 * LocalBusiness, so it carries name/description/telephone plus travel context.
 */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    image: `${SITE_URL}/opengraph-image`,
    telephone: BUSINESS_PHONE,
    priceRange: "$$",
    sameAs: [
      "https://www.facebook.com/GourmetGetawayTours/",
      "https://www.instagram.com/gourmetgetawaytours/",
      "https://www.youtube.com/channel/UCdEIGgqZqPOtDQXrR5AaG3w",
    ],
    areaServed: {
      "@type": "State",
      name: "New South Wales",
    },
    address: {
      "@type": "PostalAddress",
      addressRegion: "NSW",
      addressCountry: "AU",
    },
  };
}

/**
 * JSON-LD for the tours offered, as a list of TouristTrip products. Built from
 * the live tour data so pricing stays in sync with what the builder shows.
 */
export function toursJsonLd(tours: Tour[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: tours.map((tour, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "TouristTrip",
        name: tour.name,
        url: `${SITE_URL}/#builder`,
        provider: { "@id": `${SITE_URL}/#organization` },
        offers: {
          "@type": "Offer",
          price: tour.base,
          priceCurrency: "AUD",
          availability: "https://schema.org/InStock",
          url: `${SITE_URL}/#builder`,
        },
      },
    })),
  };
}
