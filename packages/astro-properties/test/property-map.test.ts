import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it } from "vitest";
import PropertyMap from "../src/components/PropertyMap.astro";
import type { Location } from "../src/schema.js";

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

describe("PropertyMap", () => {
  it("renders a map container with the location's lat/lng/zoom", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(PropertyMap, {
      props: { location: location() },
    });

    expect(result).toContain('data-lat="9.5312"');
    expect(result).toContain('data-lng="100.0631"');
    expect(result).toContain('data-zoom="14"');
    expect(result).toContain('data-hide-exact="false"');
  });

  it("defaults to the OSM tile provider", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(PropertyMap, {
      props: { location: location() },
    });

    expect(result).toContain("tile.openstreetmap.org");
  });

  it("uses the requested tile provider", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(PropertyMap, {
      props: { location: location(), provider: "stadia" },
    });

    expect(result).toContain("tiles.stadiamaps.com");
  });

  it("reduces zoom when hideExact is true, to avoid pinpointing the exact location", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(PropertyMap, {
      props: { location: location({ hideExact: true, zoom: 14 }) },
    });

    expect(result).toContain('data-zoom="10"');
    expect(result).toContain('data-hide-exact="true"');
  });

  it("never reduces zoom below 1", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(PropertyMap, {
      props: { location: location({ hideExact: true, zoom: 2 }) },
    });

    expect(result).toContain('data-zoom="1"');
  });
});
