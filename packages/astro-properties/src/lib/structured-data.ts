import type { Location, Price } from "../schema.js";

export interface RealEstateListingInput {
  title: string;
  description?: string | undefined;
  url: string;
  images: string[];
  price: Price;
  location: Location;
  agentName?: string | undefined;
}

interface PostalAddress {
  "@type": "PostalAddress";
  streetAddress?: string;
  addressLocality: string;
  addressRegion?: string;
  postalCode?: string;
  addressCountry: string;
}

interface GeoCoordinates {
  "@type": "GeoCoordinates";
  latitude: number;
  longitude: number;
}

interface Offer {
  "@type": "Offer";
  price: number;
  priceCurrency: string;
  availability: string;
}

interface RealEstateAgent {
  "@type": "RealEstateAgent";
  name: string;
}

export interface RealEstateListing {
  "@context": "https://schema.org";
  "@type": "RealEstateListing";
  name: string;
  url: string;
  description?: string;
  image?: string[];
  address: PostalAddress;
  geo?: GeoCoordinates;
  offers?: Offer;
  agent?: RealEstateAgent;
}

/**
 * Builds a `schema.org` `RealEstateListing` JSON-LD object. Kept as a pure
 * function (rather than inline in the .astro component) so the mapping
 * logic is directly unit-testable without needing the Container API.
 */
export function buildRealEstateListing(
  input: RealEstateListingInput,
): RealEstateListing {
  const { title, description, url, images, price, location, agentName } = input;

  const address: PostalAddress = {
    "@type": "PostalAddress",
    addressLocality: location.city,
    addressCountry: location.country,
  };
  if (location.address) address.streetAddress = location.address;
  if (location.state) address.addressRegion = location.state;
  if (location.postalCode) address.postalCode = location.postalCode;

  const listing: RealEstateListing = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: title,
    url,
    address,
  };

  if (description) listing.description = description;
  if (images.length > 0) listing.image = images;

  if (!location.hideExact) {
    listing.geo = {
      "@type": "GeoCoordinates",
      latitude: location.lat,
      longitude: location.lng,
    };
  }

  if (!price.onRequest && price.amount != null) {
    listing.offers = {
      "@type": "Offer",
      price: price.amount,
      priceCurrency: price.currency,
      availability: "https://schema.org/InStock",
    };
  }

  if (agentName) {
    listing.agent = { "@type": "RealEstateAgent", name: agentName };
  }

  return listing;
}
