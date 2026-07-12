import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it } from "vitest";
import FloorPlans from "../src/components/FloorPlans.astro";
import type { FloorPlan } from "../src/schema.js";

function floorPlan(overrides: Partial<FloorPlan> = {}): FloorPlan {
  return {
    title: "Type A — 3 Bed",
    image: "/floor-plans/type-a.jpg",
    ...overrides,
  };
}

describe("FloorPlans", () => {
  it("renders nothing for zero floor plans", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(FloorPlans, {
      props: { floorPlans: [] },
    });

    expect(result).not.toContain("data-floor-plans");
  });

  it("renders one floor plan with its title, size, beds/baths, price, and description", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(FloorPlans, {
      props: {
        floorPlans: [
          floorPlan({
            size: 190,
            bedrooms: 3,
            bathrooms: 2,
            price: 380000,
            description: "Ground-floor unit with private garden access.",
          }),
        ],
      },
    });

    const cards = result.match(/data-floor-plan(?!s)/g) ?? [];
    expect(cards).toHaveLength(1);
    expect(result).toContain("Type A — 3 Bed");
    expect(result).toContain("190 m²");
    expect(result).toContain("3 bd");
    expect(result).toContain("2 ba");
    expect(result).toContain("$380,000");
    expect(result).toContain("Ground-floor unit with private garden access.");
  });

  it("renders many floor plans, one card each", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(FloorPlans, {
      props: {
        floorPlans: [
          floorPlan({ title: "Type A" }),
          floorPlan({ title: "Type B" }),
          floorPlan({ title: "Type C" }),
        ],
      },
    });

    const cards = result.match(/data-floor-plan(?!s)/g) ?? [];
    expect(cards).toHaveLength(3);
    expect(result).toContain("Type A");
    expect(result).toContain("Type B");
    expect(result).toContain("Type C");
  });

  it("omits optional fields (size/beds/baths/price/description) that aren't given", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(FloorPlans, {
      props: { floorPlans: [floorPlan()] },
    });

    expect(result).not.toContain(" bd");
    expect(result).not.toContain(" ba");
  });

  it("formats floor plan size in sqft when areaUnit is sqft", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(FloorPlans, {
      props: { floorPlans: [floorPlan({ size: 1200 })], areaUnit: "sqft" },
    });

    expect(result).toContain("1,200 sqft");
  });

  it("formats floor plan price with the given currency", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(FloorPlans, {
      props: { floorPlans: [floorPlan({ price: 1000 })], currency: "EUR" },
    });

    expect(result).toContain("1,000");
  });
});
