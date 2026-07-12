import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it } from "vitest";
import SuperMap from "../src/components/SuperMap.astro";
import type { SuperMapListing } from "../src/components/super-map-listing.js";

function listing(overrides: Partial<SuperMapListing> = {}): SuperMapListing {
  return {
    id: "seaview-villa",
    href: "/properties/seaview-villa",
    title: "Seaview Villa",
    price: { amount: 450_000, currency: "USD", onRequest: false },
    lat: 9.5312,
    lng: 100.0631,
    ...overrides,
  };
}

describe("SuperMap", () => {
  it("renders a map container with a marker for every listing, serialized as JSON", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(SuperMap, {
      props: {
        listings: [
          listing(),
          listing({
            id: "downtown-condo",
            title: "Downtown Condo",
            lat: 9.5721,
            lng: 100.0453,
          }),
        ],
      },
    });

    expect(result).toContain("data-super-map");
    expect(result).toContain("Seaview Villa");
    expect(result).toContain("Downtown Condo");
    expect(result).toContain("&quot;lat&quot;:9.5312");
    expect(result).toContain("&quot;lng&quot;:100.0453");
  });

  it("formats each listing's price for the marker popup", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(SuperMap, {
      props: {
        listings: [
          listing({
            price: { amount: 450_000, currency: "USD", onRequest: false },
          }),
        ],
      },
    });

    expect(result).toContain("$450,000");
  });

  it("shows the initial 'N of N listings shown' count", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(SuperMap, {
      props: {
        listings: [listing(), listing({ id: "b" }), listing({ id: "c" })],
      },
    });

    expect(result).toContain("3 of 3 listings shown");
  });

  it("defaults to the OSM tile provider", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(SuperMap, {
      props: { listings: [listing()] },
    });

    expect(result).toContain("tile.openstreetmap.org");
  });

  it("uses the requested tile provider", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(SuperMap, {
      props: { listings: [listing()], provider: "stadia" },
    });

    expect(result).toContain("tiles.stadiamaps.com");
  });

  it("renders an empty marker set without error", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(SuperMap, {
      props: { listings: [] },
    });

    expect(result).toContain("0 of 0 listings shown");
    expect(result).toContain('data-markers="[]"');
  });
});
