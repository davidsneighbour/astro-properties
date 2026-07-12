import type { Price } from "../schema.js";

const PERIOD_SUFFIX: Record<NonNullable<Price["period"]>, string> = {
  month: "/mo",
  week: "/wk",
  night: "/night",
  year: "/yr",
  pppw: " pppw",
};

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPrice(price: Price): string {
  if (price.onRequest || price.amount == null) {
    return price.prefixLabel ?? "Price on request";
  }

  const amount =
    formatCurrency(price.amount, price.currency) +
    (price.period ? PERIOD_SUFFIX[price.period] : "");
  const parts = [price.prefixLabel, amount, price.suffixLabel].filter(
    (part): part is string => Boolean(part),
  );

  return parts.join(" ");
}

export function formatArea(size: number, unit: "sqft" | "sqm"): string {
  const formatted = new Intl.NumberFormat("en-US").format(size);
  return `${formatted} ${unit === "sqm" ? "m²" : "sqft"}`;
}

/**
 * Zero-pads a non-negative number into a fixed-width string so it sorts
 * correctly lexicographically — used for `data-pagefind-sort`, which only
 * ever compares sort values as plain strings.
 */
export function formatSortableNumber(value: number, length = 12): string {
  return Math.round(value).toString().padStart(length, "0");
}
