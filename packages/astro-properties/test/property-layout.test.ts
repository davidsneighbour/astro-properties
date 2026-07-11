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
});
