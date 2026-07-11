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
    type: "villa",
    status: "for-sale",
    category: "residential",
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

  it("marks the grid with data-pagefind-body", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(ListingLayout, {
      props: { title: "All listings", listings: [listing()] },
    });

    expect(result).toContain("data-pagefind-body");
  });

  it("adds data-pagefind-filter attributes for type/status/category", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(ListingLayout, {
      props: {
        title: "All listings",
        listings: [
          listing({
            type: "condominium",
            status: "for-rent",
            category: "student",
          }),
        ],
      },
    });

    expect(result).toContain('data-pagefind-filter="type:condominium"');
    expect(result).toContain('data-pagefind-filter="status:for-rent"');
    expect(result).toContain('data-pagefind-filter="category:student"');
  });

  it("adds data-filter-type/price/beds attributes for the pre-Pagefind filter", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(ListingLayout, {
      props: {
        title: "All listings",
        listings: [
          listing({ type: "condominium", bedrooms: 2, price: price(1200) }),
        ],
      },
    });

    expect(result).toContain('data-filter-type="condominium"');
    expect(result).toContain('data-filter-price="1200"');
    expect(result).toContain('data-filter-beds="2"');
  });

  it("leaves data-filter-price empty for an onRequest listing", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(ListingLayout, {
      props: {
        title: "All listings",
        listings: [listing({ price: { currency: "USD", onRequest: true } })],
      },
    });

    expect(result).toMatch(/data-filter-price(?!=)/);
  });

  it("leaves data-filter-beds empty when bedrooms is not set", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(ListingLayout, {
      props: {
        title: "All listings",
        listings: [listing({ bedrooms: undefined })],
      },
    });

    expect(result).toMatch(/data-filter-beds(?!=)/);
  });

  it("renders the page title", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(ListingLayout, {
      props: { title: "All listings", listings: [] },
    });

    expect(result).toContain("<title>All listings</title>");
  });
});
