import { describe, expect, it } from "vitest";
import {
  agentSchema,
  LocationSchema,
  PriceSchema,
  propertyBaseSchema,
} from "../src/schema.js";

const validLocation = {
  city: "Koh Samui",
  country: "Thailand",
  lat: 9.512,
  lng: 100.013,
};

function minimalProperty(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    title: "Seaview Villa",
    listingType: "sale",
    status: "for-sale",
    type: "villa",
    price: { amount: 350000, currency: "USD" },
    location: validLocation,
    ...overrides,
  };
}

describe("PriceSchema", () => {
  it("requires amount unless onRequest is true", () => {
    const result = PriceSchema.safeParse({ currency: "USD" });
    expect(result.success).toBe(false);
  });

  it("allows a missing amount when onRequest is true", () => {
    const result = PriceSchema.safeParse({ currency: "USD", onRequest: true });
    expect(result.success).toBe(true);
  });

  it("accepts a valid sale price", () => {
    const result = PriceSchema.safeParse({ amount: 200000, currency: "USD" });
    expect(result.success).toBe(true);
  });
});

describe("LocationSchema", () => {
  it("rejects out-of-range latitude", () => {
    const result = LocationSchema.safeParse({ ...validLocation, lat: 200 });
    expect(result.success).toBe(false);
  });

  it("rejects out-of-range longitude", () => {
    const result = LocationSchema.safeParse({ ...validLocation, lng: -200 });
    expect(result.success).toBe(false);
  });

  it("defaults hideExact to false and zoom to 14", () => {
    const result = LocationSchema.parse(validLocation);
    expect(result.hideExact).toBe(false);
    expect(result.zoom).toBe(14);
  });
});

describe("propertyBaseSchema", () => {
  it("parses a minimal valid property", () => {
    const result = propertyBaseSchema.safeParse(minimalProperty());
    expect(result.success).toBe(true);
  });

  it("defaults category to residential and areaUnit to sqm", () => {
    const result = propertyBaseSchema.parse(minimalProperty());
    expect(result.category).toBe("residential");
    expect(result.areaUnit).toBe("sqm");
  });

  it("rejects a property missing location", () => {
    const { location, ...withoutLocation } = minimalProperty();
    const result = propertyBaseSchema.safeParse(withoutLocation);
    expect(result.success).toBe(false);
  });

  it("rejects a property with an invalid price (no amount, not onRequest)", () => {
    const result = propertyBaseSchema.safeParse(
      minimalProperty({ price: { currency: "USD" } }),
    );
    expect(result.success).toBe(false);
  });

  it("accepts free-form custom attributes", () => {
    const result = propertyBaseSchema.safeParse(
      minimalProperty({
        custom: { hoaFee: 150, hasGarden: true, notes: "corner unit" },
      }),
    );
    expect(result.success).toBe(true);
  });
});

describe("agentSchema", () => {
  it("parses a minimal agent", () => {
    const result = agentSchema.safeParse({ name: "Jane Doe" });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = agentSchema.safeParse({
      name: "Jane Doe",
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });
});
