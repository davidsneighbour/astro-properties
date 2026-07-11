import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  Category,
  ListingType,
  PropertyStatus,
  PropertyType,
  Tenure,
} from "@davidsneighbour/astro-properties/schema";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";

const PROPERTIES_DIR = resolve(process.cwd(), "src/content/properties");

const PRICE_PERIODS = ["month", "week", "night", "year", "pppw"] as const;
const AREA_UNITS = ["sqft", "sqm"] as const;
const LAND_UNITS = ["sqft", "sqm", "acre", "rai"] as const;

function loadFrontmatter(): Record<string, unknown>[] {
  const slugs = readdirSync(PROPERTIES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  return slugs.map((slug) => {
    const raw = readFileSync(
      resolve(PROPERTIES_DIR, slug, "index.mdx"),
      "utf-8",
    );
    const match = raw.match(/^---\n([\s\S]*?)\n---/);
    if (!match) {
      throw new Error(`No frontmatter found in ${slug}/index.mdx`);
    }
    return parse(match[1]) as Record<string, unknown>;
  });
}

describe("seed property content", () => {
  const listings = loadFrontmatter();

  it("has at least 12 seed listings", () => {
    expect(listings.length).toBeGreaterThanOrEqual(12);
  });

  it.each(ListingType.options)("exercises listingType %s", (value) => {
    expect(listings.some((listing) => listing.listingType === value)).toBe(
      true,
    );
  });

  it.each(Category.options)("exercises category %s", (value) => {
    expect(listings.some((listing) => listing.category === value)).toBe(true);
  });

  it.each(PropertyStatus.options)("exercises status %s", (value) => {
    expect(listings.some((listing) => listing.status === value)).toBe(true);
  });

  it.each(PropertyType.options)("exercises type %s", (value) => {
    expect(listings.some((listing) => listing.type === value)).toBe(true);
  });

  it.each(Tenure.options)("exercises tenure %s", (value) => {
    expect(listings.some((listing) => listing.tenure === value)).toBe(true);
  });

  it.each(PRICE_PERIODS)("exercises price period %s", (value) => {
    expect(
      listings.some(
        (listing) =>
          (listing.price as { period?: string } | undefined)?.period === value,
      ),
    ).toBe(true);
  });

  it.each(AREA_UNITS)("exercises areaUnit %s", (value) => {
    expect(listings.some((listing) => listing.areaUnit === value)).toBe(true);
  });

  it.each(LAND_UNITS)("exercises landUnit %s", (value) => {
    expect(listings.some((listing) => listing.landUnit === value)).toBe(true);
  });

  it("has at least one onRequest (POA) listing", () => {
    expect(
      listings.some(
        (listing) =>
          (listing.price as { onRequest?: boolean } | undefined)?.onRequest ===
          true,
      ),
    ).toBe(true);
  });

  it("has at least one listing with floorPlans", () => {
    expect(
      listings.some(
        (listing) =>
          Array.isArray(listing.floorPlans) && listing.floorPlans.length > 0,
      ),
    ).toBe(true);
  });

  it("has at least one listing referencing a development", () => {
    expect(
      listings.some((listing) => typeof listing.development === "string"),
    ).toBe(true);
  });
});
