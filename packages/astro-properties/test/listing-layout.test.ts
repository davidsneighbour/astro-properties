import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it } from "vitest";
import ListingLayout from "../src/layouts/ListingLayout.astro";
import type { ListingCard } from "../src/layouts/listing-card.js";
import type { Price } from "../src/schema.js";

function price(amount: number): Price {
  return { amount, currency: "USD", onRequest: false };
}

function listing(overrides: Partial<ListingCard> = {}): ListingCard {
  return {
    href: "/properties/seaview-villa",
    title: "Seaview Villa",
    price: price(450000),
    coverImageSrc: "/images/seaview-villa.jpg",
    coverImageAlt: "Seaview Villa",
    ...overrides,
  };
}

describe("ListingLayout", () => {
  it("renders one card per listing", async () => {
    const container = await AstroContainer.create();
    const listings = [
      listing(),
      listing({ href: "/properties/downtown-condo", title: "Downtown Condo" }),
      listing({
        href: "/properties/riverside-land",
        title: "Riverside Land Plot",
      }),
    ];
    const result = await container.renderToString(ListingLayout, {
      props: { title: "All listings", listings },
    });

    const cardMatches = result.match(/data-listing-card/g) ?? [];
    expect(cardMatches).toHaveLength(3);
    expect(result).toContain("Seaview Villa");
    expect(result).toContain("Downtown Condo");
    expect(result).toContain("Riverside Land Plot");
  });

  it("renders zero cards for an empty listing set", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(ListingLayout, {
      props: { title: "All listings", listings: [] },
    });

    expect(result.match(/data-listing-card/g)).toBeNull();
  });

  it("marks the grid with a stable id for the search island to target", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(ListingLayout, {
      props: { title: "All listings", listings: [listing()] },
    });

    expect(result).toContain('id="static-listings"');
  });

  it("renders the page title", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(ListingLayout, {
      props: { title: "All listings", listings: [] },
    });

    expect(result).toContain("<title>All listings</title>");
  });
});
