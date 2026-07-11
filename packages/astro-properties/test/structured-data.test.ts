import { describe, expect, it } from "vitest";
import { buildRealEstateListing } from "../src/lib/structured-data.js";
import type { Location, Price } from "../src/schema.js";

function location(overrides: Partial<Location> = {}): Location {
  return {
    city: "Koh Samui",
    country: "Thailand",
    lat: 9.5312,
    lng: 100.0631,
    zoom: 14,
    hideExact: false,
    ...overrides,
  };
}

function price(overrides: Partial<Price> = {}): Price {
  return { currency: "USD", onRequest: false, ...overrides };
}

describe("buildRealEstateListing", () => {
  it("includes the required @context/@type/name/url/address fields", () => {
    const listing = buildRealEstateListing({
      title: "Seaview Villa",
      url: "https://example.com/properties/seaview-villa",
      images: [],
      price: price({ amount: 450000 }),
      location: location(),
    });

    expect(listing["@context"]).toBe("https://schema.org");
    expect(listing["@type"]).toBe("RealEstateListing");
    expect(listing.name).toBe("Seaview Villa");
    expect(listing.url).toBe("https://example.com/properties/seaview-villa");
    expect(listing.address).toMatchObject({
      "@type": "PostalAddress",
      addressLocality: "Koh Samui",
      addressCountry: "Thailand",
    });
  });

  it("produces valid, parseable JSON", () => {
    const listing = buildRealEstateListing({
      title: "Seaview Villa",
      url: "https://example.com/properties/seaview-villa",
      images: ["/a.jpg"],
      price: price({ amount: 450000 }),
      location: location(),
    });

    expect(() => JSON.parse(JSON.stringify(listing))).not.toThrow();
  });

  it("includes geo coordinates when the location is not hidden", () => {
    const listing = buildRealEstateListing({
      title: "Seaview Villa",
      url: "https://example.com/properties/seaview-villa",
      images: [],
      price: price({ amount: 450000 }),
      location: location({ hideExact: false }),
    });

    expect(listing.geo).toEqual({
      "@type": "GeoCoordinates",
      latitude: 9.5312,
      longitude: 100.0631,
    });
  });

  it("omits geo coordinates when the location is hidden", () => {
    const listing = buildRealEstateListing({
      title: "Riverside Land Plot",
      url: "https://example.com/properties/riverside-land",
      images: [],
      price: price({ onRequest: true }),
      location: location({ hideExact: true }),
    });

    expect(listing.geo).toBeUndefined();
  });

  it("includes an Offer with price/priceCurrency for a fixed-price listing", () => {
    const listing = buildRealEstateListing({
      title: "Seaview Villa",
      url: "https://example.com/properties/seaview-villa",
      images: [],
      price: price({ amount: 450000, currency: "USD" }),
      location: location(),
    });

    expect(listing.offers).toEqual({
      "@type": "Offer",
      price: 450000,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    });
  });

  it("omits offers for an onRequest (POA) listing", () => {
    const listing = buildRealEstateListing({
      title: "Riverside Land Plot",
      url: "https://example.com/properties/riverside-land",
      images: [],
      price: price({ onRequest: true }),
      location: location(),
    });

    expect(listing.offers).toBeUndefined();
  });

  it("includes the image list when images are given", () => {
    const listing = buildRealEstateListing({
      title: "Seaview Villa",
      url: "https://example.com/properties/seaview-villa",
      images: ["/a.jpg", "/b.jpg"],
      price: price({ amount: 450000 }),
      location: location(),
    });

    expect(listing.image).toEqual(["/a.jpg", "/b.jpg"]);
  });

  it("omits the image field when there are no images", () => {
    const listing = buildRealEstateListing({
      title: "Seaview Villa",
      url: "https://example.com/properties/seaview-villa",
      images: [],
      price: price({ amount: 450000 }),
      location: location(),
    });

    expect(listing.image).toBeUndefined();
  });

  it("includes an agent when agentName is given", () => {
    const listing = buildRealEstateListing({
      title: "Seaview Villa",
      url: "https://example.com/properties/seaview-villa",
      images: [],
      price: price({ amount: 450000 }),
      location: location(),
      agentName: "Jane Doe",
    });

    expect(listing.agent).toEqual({
      "@type": "RealEstateAgent",
      name: "Jane Doe",
    });
  });

  it("includes optional address fields (street/state/postalCode) when present", () => {
    const listing = buildRealEstateListing({
      title: "Seaview Villa",
      url: "https://example.com/properties/seaview-villa",
      images: [],
      price: price({ amount: 450000 }),
      location: location({
        address: "88 Coastal Road",
        state: "Surat Thani",
        postalCode: "84320",
      }),
    });

    expect(listing.address).toEqual({
      "@type": "PostalAddress",
      streetAddress: "88 Coastal Road",
      addressLocality: "Koh Samui",
      addressRegion: "Surat Thani",
      postalCode: "84320",
      addressCountry: "Thailand",
    });
  });
});
