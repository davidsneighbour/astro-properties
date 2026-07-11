import { describe, expect, it } from "vitest";
import {
  type FilterableListing,
  matchesFilter,
} from "../src/lib/filter-listings.js";

function listing(
  overrides: Partial<FilterableListing> = {},
): FilterableListing {
  return { type: "villa", price: 450000, beds: 4, ...overrides };
}

describe("matchesFilter", () => {
  it("matches everything when no criteria are given", () => {
    expect(matchesFilter(listing(), {})).toBe(true);
  });

  it("filters by type", () => {
    expect(matchesFilter(listing({ type: "villa" }), { type: "villa" })).toBe(
      true,
    );
    expect(
      matchesFilter(listing({ type: "condominium" }), { type: "villa" }),
    ).toBe(false);
  });

  it("ignores type when not specified", () => {
    expect(matchesFilter(listing({ type: "studio" }), { type: "" })).toBe(true);
  });

  it("filters by minimum price", () => {
    expect(
      matchesFilter(listing({ price: 500000 }), { minPrice: 400000 }),
    ).toBe(true);
    expect(
      matchesFilter(listing({ price: 300000 }), { minPrice: 400000 }),
    ).toBe(false);
  });

  it("filters by maximum price", () => {
    expect(
      matchesFilter(listing({ price: 300000 }), { maxPrice: 400000 }),
    ).toBe(true);
    expect(
      matchesFilter(listing({ price: 500000 }), { maxPrice: 400000 }),
    ).toBe(false);
  });

  it("excludes onRequest (null price) listings when a price filter is active", () => {
    expect(matchesFilter(listing({ price: null }), { minPrice: 100000 })).toBe(
      false,
    );
    expect(matchesFilter(listing({ price: null }), { maxPrice: 900000 })).toBe(
      false,
    );
  });

  it("includes onRequest (null price) listings when no price filter is active", () => {
    expect(matchesFilter(listing({ price: null }), {})).toBe(true);
  });

  it("filters by minimum beds", () => {
    expect(matchesFilter(listing({ beds: 3 }), { minBeds: 2 })).toBe(true);
    expect(matchesFilter(listing({ beds: 1 }), { minBeds: 2 })).toBe(false);
  });

  it("excludes listings with no bedrooms set when a beds filter is active", () => {
    expect(matchesFilter(listing({ beds: null }), { minBeds: 1 })).toBe(false);
  });

  it("combines type, price range, and beds filters", () => {
    const match = listing({ type: "villa", price: 450000, beds: 4 });
    expect(
      matchesFilter(match, {
        type: "villa",
        minPrice: 400000,
        maxPrice: 500000,
        minBeds: 3,
      }),
    ).toBe(true);
    expect(
      matchesFilter(match, {
        type: "villa",
        minPrice: 400000,
        maxPrice: 500000,
        minBeds: 5,
      }),
    ).toBe(false);
  });
});
