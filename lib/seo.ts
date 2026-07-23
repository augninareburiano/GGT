import type { Tour } from "./tours";

/** Canonical production origin — used for metadataBase, canonical URLs, sitemap and JSON-LD. */
export const SITE_URL = "https://gourmetgetawaytours.com.au";

export const SITE_NAME = "Gourmet Getaway Tours";

export const SITE_DESCRIPTION =
  "Owner-operated food, wine and adventure tours across New South Wales. Pick the place, set your group, choose your extras — and watch the price add up as you go.";

/** Business phone, mirrored from the site footer. */
export const BUSINESS_PHONE = "+61416139567";

/** Public enquiry address, mirrored from the site footer. */
export const BUSINESS_EMAIL = "info@gourmetgetawaytours.com.au";

/**
 * Registered business identifiers shown in the footer so visitors can verify
 * who they are dealing with. The ACN (a nine-digit company number) and the ABN
 * are different registrations — never label one as the other. The ABN is still
 * outstanding from the client, so it is deliberately absent rather than stubbed.
 */
export const ACCREDITATION_NUMBER = "40079";
export const BUSINESS_ACN = "627 789 146";

/** Registered business address, mirrored from the site footer. */
export const BUSINESS_ADDRESS = {
  street: "17 Allambie Rd",
  suburb: "Allambie Heights",
  state: "New South Wales",
  stateCode: "NSW",
  postcode: "2100",
  country: "AU",
} as const;

/**
 * Social profiles — single source of truth for the footer, the "follow" band
 * and the Organization `sameAs` structured data.
 */
export const SOCIAL_LINKS = [
  {
    name: "Instagram",
    url: "https://www.instagram.com/gourmetgetawaytours/",
    cta: "Follow on Instagram",
  },
  {
    name: "Facebook",
    url: "https://www.facebook.com/GourmetGetawayTours/",
    cta: "Like on Facebook",
  },
  {
    name: "YouTube",
    url: "https://www.youtube.com/channel/UCdEIGgqZqPOtDQXrR5AaG3w",
    cta: "Watch on YouTube",
  },
] as const;

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
    email: BUSINESS_EMAIL,
    priceRange: "$$",
    sameAs: SOCIAL_LINKS.map((s) => s.url),
    identifier: [
      { "@type": "PropertyValue", name: "ACN", value: BUSINESS_ACN },
      {
        "@type": "PropertyValue",
        name: "Accreditation number",
        value: ACCREDITATION_NUMBER,
      },
    ],
    areaServed: {
      "@type": "State",
      name: "New South Wales",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: BUSINESS_ADDRESS.street,
      addressLocality: BUSINESS_ADDRESS.suburb,
      addressRegion: BUSINESS_ADDRESS.stateCode,
      postalCode: BUSINESS_ADDRESS.postcode,
      addressCountry: BUSINESS_ADDRESS.country,
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
