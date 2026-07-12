import { describe, expect, it } from "vitest";
import { buildPagefindFilters, buildPagefindSort } from "../src/lib/search.js";

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
