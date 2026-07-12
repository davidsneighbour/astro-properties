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
