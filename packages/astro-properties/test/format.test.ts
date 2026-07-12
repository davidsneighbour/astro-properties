import { describe, expect, it } from "vitest";
import {
  formatArea,
  formatCurrency,
  formatPrice,
  formatSortableNumber,
} from "../src/lib/format.js";
import type { Price } from "../src/schema.js";

function price(overrides: Partial<Price> = {}): Price {
  return {
    currency: "USD",
    onRequest: false,
    ...overrides,
  } as Price;
}

describe("formatCurrency", () => {
  it("formats a whole-number amount with no decimals", () => {
    expect(formatCurrency(250000, "USD")).toBe("$250,000");
  });

  it("respects the given currency code", () => {
    expect(formatCurrency(1000, "EUR")).toContain("1,000");
  });
});

describe("formatArea", () => {
  it("formats sqm with the m² suffix", () => {
    expect(formatArea(120, "sqm")).toBe("120 m²");
  });

  it("formats sqft with the sqft suffix", () => {
    expect(formatArea(1200, "sqft")).toBe("1,200 sqft");
  });
});

describe("formatPrice", () => {
  it("renders 'Price on request' when onRequest is true and no prefixLabel", () => {
    expect(formatPrice(price({ onRequest: true }))).toBe("Price on request");
  });

  it("renders the prefixLabel instead of the generic fallback when onRequest is true", () => {
    expect(
      formatPrice(price({ onRequest: true, prefixLabel: "Contact us" })),
    ).toBe("Contact us");
  });

  it("renders a plain amount", () => {
    expect(formatPrice(price({ amount: 300000 }))).toBe("$300,000");
  });

  it("renders a prefix label before the amount", () => {
    expect(
      formatPrice(price({ amount: 300000, prefixLabel: "Starting at" })),
    ).toBe("Starting at $300,000");
  });

  it("renders a rent period suffix (e.g. per month)", () => {
    expect(formatPrice(price({ amount: 1500, period: "month" }))).toBe(
      "$1,500/mo",
    );
  });

  it("renders the pppw period for student lettings", () => {
    expect(formatPrice(price({ amount: 120, period: "pppw" }))).toBe(
      "$120 pppw",
    );
  });

  it("renders a suffix label after the amount", () => {
    expect(formatPrice(price({ amount: 500, suffixLabel: "per night" }))).toBe(
      "$500 per night",
    );
  });

  it("falls back to 'Price on request' when amount is missing and onRequest is false", () => {
    expect(formatPrice(price({ amount: undefined }))).toBe("Price on request");
  });
});

describe("formatSortableNumber", () => {
  it("zero-pads to the default width so string comparison sorts numerically", () => {
    expect(formatSortableNumber(450000)).toBe("000000450000");
    expect(formatSortableNumber(1200000) > formatSortableNumber(450000)).toBe(
      true,
    );
  });

  it("rounds fractional amounts before padding", () => {
    expect(formatSortableNumber(99.6)).toBe("000000000100");
  });

  it("respects a custom width", () => {
    expect(formatSortableNumber(42, 4)).toBe("0042");
  });
});
