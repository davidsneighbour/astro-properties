import type {
  RangeIndex,
  RangeIndexListing,
} from "@davidsneighbour/astro-properties/lib/filter.js";

export interface SearchFacetSelection {
  type?: string | undefined;
  status?: string | undefined;
  category?: string | undefined;
  location?: string | undefined;
  minBeds?: number | undefined;
}

export type SortOption = "relevance" | "price-asc" | "price-desc";

/**
 * Pagefind requires every value passed for a filter key to match (AND, not
 * OR), so there's no way to express "beds is 3 or 4 or 5" as a value list.
 * Instead, PropertyLayout indexes cumulative "N+" tags per listing (a
 * 4-bedroom listing gets `beds:1+` through `beds:4+`), so "min beds" only
 * ever needs a single filter value here.
 */
export function buildPagefindFilters(
  selection: SearchFacetSelection,
): Record<string, string[]> {
  const filters: Record<string, string[]> = {};

  if (selection.type) filters["type"] = [selection.type];
  if (selection.status) filters["status"] = [selection.status];
  if (selection.category) filters["category"] = [selection.category];
  if (selection.location) filters["location"] = [selection.location];
  if (selection.minBeds != null) filters["beds"] = [`${selection.minBeds}+`];

  return filters;
}

export function buildPagefindSort(
  sort: SortOption,
): Record<string, "asc" | "desc"> | undefined {
  if (sort === "price-asc") return { price: "asc" };
  if (sort === "price-desc") return { price: "desc" };
  return undefined;
}

/** Pagefind result URLs are `/properties/<id>/` — the trailing path segment is the listing id used in the JSON range index. */
export function extractListingId(url: string): string {
  const segments = url.split("/").filter(Boolean);
  return segments[segments.length - 1] ?? "";
}

export function findListing(
  index: RangeIndex,
  id: string,
): RangeIndexListing | undefined {
  return index.listings.find((listing) => listing.id === id);
}

export interface RangeSelection {
  priceMin?: number | undefined;
  priceMax?: number | undefined;
  areaMin?: number | undefined;
  areaMax?: number | undefined;
}

/**
 * Pagefind's filters are categorical and can't express numeric ranges, so
 * price/area narrowing happens client-side against the generated JSON range
 * index instead. A range only applies once the user has actually narrowed
 * it away from the index's full bounds — otherwise listings with no known
 * price/area (e.g. "price on request") would be excluded by default.
 */
export function matchesRange(
  listing: Pick<RangeIndexListing, "price" | "areaSize">,
  selection: RangeSelection,
  bounds: Pick<RangeIndex, "price" | "area">,
): boolean {
  const priceNarrowed =
    (selection.priceMin != null && selection.priceMin > bounds.price.min) ||
    (selection.priceMax != null && selection.priceMax < bounds.price.max);
  if (priceNarrowed) {
    if (listing.price == null) return false;
    if (selection.priceMin != null && listing.price < selection.priceMin)
      return false;
    if (selection.priceMax != null && listing.price > selection.priceMax)
      return false;
  }

  const areaNarrowed =
    (selection.areaMin != null && selection.areaMin > bounds.area.min) ||
    (selection.areaMax != null && selection.areaMax < bounds.area.max);
  if (areaNarrowed) {
    if (listing.areaSize == null) return false;
    if (selection.areaMin != null && listing.areaSize < selection.areaMin)
      return false;
    if (selection.areaMax != null && listing.areaSize > selection.areaMax)
      return false;
  }

  return true;
}
