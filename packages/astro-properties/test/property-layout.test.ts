import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it } from "vitest";
import PropertyLayout from "../src/layouts/PropertyLayout.astro";
import type { PropertyDetail } from "../src/layouts/property-detail.js";

function detail(overrides: Partial<PropertyDetail> = {}): PropertyDetail {
  return {
    title: "Seaview Villa",
    url: "https://example.com/properties/seaview-villa",
    price: { amount: 450000, currency: "USD", onRequest: false },
    bedrooms: 4,
    bathrooms: 3,
    areaSize: 320,
    areaUnit: "sqm",
    amenities: ["Private pool", "Sea view"],
    location: {
      city: "Koh Samui",
      country: "Thailand",
      lat: 9.5312,
      lng: 100.0631,
      zoom: 14,
      hideExact: false,
    },
    images: [{ src: "/cover.jpg", alt: "Seaview Villa" }],
    type: "villa",
    status: "for-sale",
    category: "residential",
    coverImageSrc: "/cover.jpg",
    ...overrides,
  };
}

describe("PropertyLayout", () => {
  it("renders the title, price, specs, and amenities", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(PropertyLayout, {
      props: { ...detail() },
    });

    expect(result).toContain("<title>Seaview Villa</title>");
    expect(result).toContain("$450,000");
    expect(result).toContain("4 bd");
    expect(result).toContain("Private pool");
  });

  it("renders the gallery for the given images", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(PropertyLayout, {
      props: {
        ...detail({
          images: [
            { src: "/a.jpg", alt: "A" },
            { src: "/b.jpg", alt: "B" },
          ],
        }),
      },
    });

    const triggers = result.match(/data-lightbox-trigger/g) ?? [];
    expect(triggers).toHaveLength(2);
  });

  it("renders the map container with the location", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(PropertyLayout, {
      props: { ...detail() },
    });

    expect(result).toContain('data-lat="9.5312"');
  });

  it("renders StructuredData JSON-LD in the head", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(PropertyLayout, {
      props: { ...detail() },
    });

    expect(result).toContain('type="application/ld+json"');
    expect(result).toContain('"@type":"RealEstateListing"');
  });

  it("renders AgentCard when an agent is given", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(PropertyLayout, {
      props: { ...detail({ agent: { name: "Jane Doe", socials: {} } }) },
    });

    expect(result).toContain("Jane Doe");
  });

  it("omits AgentCard when no agent is given", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(PropertyLayout, {
      props: { ...detail({ agent: undefined }) },
    });

    expect(result).not.toContain("agent-card");
  });

  it("renders slotted content (the MDX body) after the main sections", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(PropertyLayout, {
      props: { ...detail() },
      slots: { default: "<p>A lovely description.</p>" },
    });

    expect(result).toContain("A lovely description.");
  });

  it("marks the page as a Pagefind document with type/status/category/beds/location filters", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(PropertyLayout, {
      props: {
        ...detail({
          type: "condominium",
          status: "for-rent",
          category: "student",
          bedrooms: 2,
        }),
      },
    });

    expect(result).toContain("data-pagefind-body");
    expect(result).toContain('data-pagefind-filter="type:condominium"');
    expect(result).toContain('data-pagefind-filter="status:for-rent"');
    expect(result).toContain('data-pagefind-filter="category:student"');
    expect(result).toContain('data-pagefind-filter="location:Koh Samui"');
  });

  it("emits a cumulative 'N+' beds filter tag per threshold up to the bedroom count", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(PropertyLayout, {
      props: { ...detail({ bedrooms: 3 }) },
    });

    expect(result).toContain('data-pagefind-filter="beds:1+"');
    expect(result).toContain('data-pagefind-filter="beds:2+"');
    expect(result).toContain('data-pagefind-filter="beds:3+"');
    expect(result).not.toContain('data-pagefind-filter="beds:4+"');
  });

  it("omits the beds filter when bedrooms is not set", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(PropertyLayout, {
      props: { ...detail({ bedrooms: undefined }) },
    });

    expect(result).not.toContain('data-pagefind-filter="beds:');
  });

  it("adds pagefind meta for image/price/beds/baths/area", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(PropertyLayout, {
      props: { ...detail({ coverImageSrc: "/villa-cover.jpg" }) },
    });

    expect(result).toContain('data-pagefind-meta="image:/villa-cover.jpg"');
    expect(result).toContain('data-pagefind-meta="price:$450,000"');
    expect(result).toContain('data-pagefind-meta="beds:4"');
    expect(result).toContain('data-pagefind-meta="baths:3"');
    expect(result).toContain('data-pagefind-meta="area:320 m²"');
  });

  it("zero-pads the price sort value and falls back to a large sentinel for on-request pricing", async () => {
    const container = await AstroContainer.create();

    const priced = await container.renderToString(PropertyLayout, {
      props: {
        ...detail({
          price: { amount: 450000, currency: "USD", onRequest: false },
        }),
      },
    });
    expect(priced).toContain('data-pagefind-sort="price:000000450000"');

    const onRequest = await container.renderToString(PropertyLayout, {
      props: { ...detail({ price: { currency: "USD", onRequest: true } }) },
    });
    expect(onRequest).toContain('data-pagefind-sort="price:999999999999"');
  });
});
