export interface FilterableListing {
  type: string;
  price: number | null;
  beds: number | null;
}

export interface FilterCriteria {
  type?: string | undefined;
  minPrice?: number | undefined;
  maxPrice?: number | undefined;
  minBeds?: number | undefined;
}

/**
 * Pure predicate for the no-frills pre-Pagefind filter (type + numeric price
 * range + beds). Kept separate from the DOM-wiring `<script>` so the actual
 * matching logic is directly unit-testable.
 */
export function matchesFilter(
  listing: FilterableListing,
  criteria: FilterCriteria,
): boolean {
  if (criteria.type && listing.type !== criteria.type) return false;

  if (criteria.minPrice != null) {
    if (listing.price == null || listing.price < criteria.minPrice)
      return false;
  }

  if (criteria.maxPrice != null) {
    if (listing.price == null || listing.price > criteria.maxPrice)
      return false;
  }

  if (criteria.minBeds != null) {
    if (listing.beds == null || listing.beds < criteria.minBeds) return false;
  }

  return true;
}
