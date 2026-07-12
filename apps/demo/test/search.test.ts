import type { RangeIndex } from "@davidsneighbour/astro-properties/lib/filter.js";
import { describe, expect, it } from "vitest";
import {
  buildPagefindFilters,
  buildPagefindSort,
  extractListingId,
  findListing,
  matchesRange,
} from "../src/lib/search.js";

describe("buildPagefindFilters", () => {
  it("returns an empty object when nothing is selected", () => {
    expect(buildPagefindFilters({})).toEqual({});
  });

  it("maps type/status/category/location to single-value filters", () => {
    expect(
      buildPagefindFilters({
        type: "villa",
        status: "for-sale",
        category: "residential",
        location: "Koh Samui",
      }),
    ).toEqual({
      type: ["villa"],
      status: ["for-sale"],
      category: ["residential"],
      location: ["Koh Samui"],
    });
  });

  it("maps minBeds to a single cumulative 'N+' threshold tag", () => {
    expect(buildPagefindFilters({ minBeds: 3 })).toEqual({ beds: ["3+"] });
  });

  it("combines multiple facets", () => {
    expect(buildPagefindFilters({ type: "condominium", minBeds: 2 })).toEqual({
      type: ["condominium"],
      beds: ["2+"],
    });
  });
});

describe("buildPagefindSort", () => {
  it("returns undefined for relevance (no explicit sort)", () => {
    expect(buildPagefindSort("relevance")).toBeUndefined();
  });

  it("sorts ascending by price", () => {
    expect(buildPagefindSort("price-asc")).toEqual({ price: "asc" });
  });

  it("sorts descending by price", () => {
    expect(buildPagefindSort("price-desc")).toEqual({ price: "desc" });
  });
});

describe("extractListingId", () => {
  it("takes the trailing path segment from a Pagefind result URL", () => {
    expect(extractListingId("http://localhost/properties/seaview-villa/")).toBe(
      "seaview-villa",
    );
  });

  it("works without a trailing slash", () => {
    expect(extractListingId("/properties/seaview-villa")).toBe("seaview-villa");
  });
});

describe("findListing", () => {
  const index: RangeIndex = {
    price: { min: 0, max: 0, buckets: [] },
    area: { min: 0, max: 0, buckets: [] },
    listings: [
      { id: "seaview-villa", price: 450_000, areaSize: 320 },
      { id: "riverside-land", price: null, areaSize: null },
    ],
  };

  it("finds a listing by id", () => {
    expect(findListing(index, "seaview-villa")).toEqual({
      id: "seaview-villa",
      price: 450_000,
      areaSize: 320,
    });
  });

  it("returns undefined for an unknown id", () => {
    expect(findListing(index, "does-not-exist")).toBeUndefined();
  });
});

describe("matchesRange", () => {
  const bounds: Pick<RangeIndex, "price" | "area"> = {
    price: { min: 100_000, max: 500_000, buckets: [] },
    area: { min: 50, max: 350, buckets: [] },
  };

  it("matches everything when the selection is unset (full bounds)", () => {
    expect(matchesRange({ price: 450_000, areaSize: 320 }, {}, bounds)).toBe(
      true,
    );
    expect(matchesRange({ price: null, areaSize: null }, {}, bounds)).toBe(
      true,
    );
  });

  it("matches everything when the selection equals the full bounds", () => {
    expect(
      matchesRange(
        { price: null, areaSize: null },
        { priceMin: 100_000, priceMax: 500_000, areaMin: 50, areaMax: 350 },
        bounds,
      ),
    ).toBe(true);
  });

  it("excludes a listing priced below a narrowed minimum", () => {
    expect(
      matchesRange(
        { price: 150_000, areaSize: 100 },
        { priceMin: 200_000 },
        bounds,
      ),
    ).toBe(false);
  });

  it("excludes a listing priced above a narrowed maximum", () => {
    expect(
      matchesRange(
        { price: 450_000, areaSize: 100 },
        { priceMax: 300_000 },
        bounds,
      ),
    ).toBe(false);
  });

  it("includes a listing within a narrowed price range", () => {
    expect(
      matchesRange(
        { price: 250_000, areaSize: 100 },
        { priceMin: 200_000, priceMax: 300_000 },
        bounds,
      ),
    ).toBe(true);
  });

  it("excludes a null-price listing once the price range is narrowed", () => {
    expect(
      matchesRange(
        { price: null, areaSize: 100 },
        { priceMin: 200_000 },
        bounds,
      ),
    ).toBe(false);
  });

  it("applies the area range independently of the price range", () => {
    expect(
      matchesRange({ price: 450_000, areaSize: 400 }, { areaMax: 300 }, bounds),
    ).toBe(false);
  });
});
