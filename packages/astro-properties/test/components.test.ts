import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it } from "vitest";
import AmenitiesList from "../src/components/AmenitiesList.astro";
import PriceBadge from "../src/components/PriceBadge.astro";
import PropertyCard from "../src/components/PropertyCard.astro";
import SpecsBar from "../src/components/SpecsBar.astro";
import type { Price } from "../src/schema.js";

function price(overrides: Partial<Price> = {}): Price {
  return { currency: "USD", onRequest: false, ...overrides } as Price;
}

describe("PriceBadge", () => {
  it("renders a formatted price", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(PriceBadge, {
      props: { price: price({ amount: 250000 }) },
    });
    expect(result).toContain("$250,000");
  });

  it("renders 'Price on request' for POA listings", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(PriceBadge, {
      props: { price: price({ onRequest: true }) },
    });
    expect(result).toContain("Price on request");
  });
});

describe("SpecsBar", () => {
  it("renders provided specs only", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(SpecsBar, {
      props: { bedrooms: 3, areaSize: 120, areaUnit: "sqm" },
    });
    expect(result).toContain("3 bd");
    expect(result).toContain("120 m²");
    expect(result).not.toContain("ba<");
  });

  it("renders nothing when no specs are given", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(SpecsBar, { props: {} });
    expect(result).not.toContain("data-spec");
  });
});

describe("AmenitiesList", () => {
  it("renders each amenity", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(AmenitiesList, {
      props: { amenities: ["Pool", "Garden"] },
    });
    expect(result).toContain("Pool");
    expect(result).toContain("Garden");
  });

  it("renders nothing for an empty amenities list", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(AmenitiesList, {
      props: { amenities: [] },
    });
    expect(result).not.toContain("amenities-list");
  });
});

describe("PropertyCard", () => {
  it("renders title, price, specs, and links to the detail page", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(PropertyCard, {
      props: {
        href: "/properties/seaview-villa",
        title: "Seaview Villa",
        price: price({ amount: 350000 }),
        coverImageSrc: "/images/seaview-villa.jpg",
        coverImageAlt: "Seaview Villa",
        bedrooms: 4,
        bathrooms: 3,
        areaSize: 220,
      },
    });
    expect(result).toContain("Seaview Villa");
    expect(result).toContain("$350,000");
    expect(result).toContain("/properties/seaview-villa");
    expect(result).toContain("4 bd");
  });

  it("renders label badges when provided", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(PropertyCard, {
      props: {
        href: "/properties/seaview-villa",
        title: "Seaview Villa",
        price: price({ amount: 350000 }),
        coverImageSrc: "/images/seaview-villa.jpg",
        coverImageAlt: "Seaview Villa",
        labels: ["New", "Price Reduced"],
      },
    });
    expect(result).toContain("New");
    expect(result).toContain("Price Reduced");
  });
});
