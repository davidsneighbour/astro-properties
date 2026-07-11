import { describe, expect, it } from "vitest";
import {
  DEFAULT_MAP_PROVIDER,
  getMapProvider,
} from "../src/lib/map-providers.js";

describe("getMapProvider", () => {
  it("defaults to OpenStreetMap when no key is given", () => {
    const provider = getMapProvider();
    expect(provider.tileUrl).toContain("openstreetmap.org");
    expect(provider.requiresApiKey).toBe(false);
  });

  it("exposes 'osm' as the documented default provider key", () => {
    expect(DEFAULT_MAP_PROVIDER).toBe("osm");
  });

  it.each([
    "osm",
    "maptiler",
    "stadia",
    "mapbox",
    "google",
  ] as const)("returns a valid tile config for provider %s", (key) => {
    const provider = getMapProvider(key);
    expect(provider.tileUrl).toMatch(/\{[xyz]\}/);
    expect(provider.attribution.length).toBeGreaterThan(0);
  });

  it("flags providers that require an API key", () => {
    expect(getMapProvider("maptiler").requiresApiKey).toBe(true);
    expect(getMapProvider("mapbox").requiresApiKey).toBe(true);
    expect(getMapProvider("osm").requiresApiKey).toBe(false);
  });

  it("falls back to the default provider for an unknown key", () => {
    // @ts-expect-error deliberately testing runtime fallback for an invalid key
    const provider = getMapProvider("unknown");
    expect(provider).toEqual(getMapProvider("osm"));
  });
});
