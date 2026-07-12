export interface PageInfo {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface PaginationResult<T> {
  items: T[];
  pageInfo: PageInfo;
}

/**
 * Pure pagination slice + page-count math, shared by the static archive
 * route (Astro `getStaticPaths`) and the client-side search results list.
 * An empty item set still reports "page 1 of 1" (not "of 0") so callers
 * don't need special-case UI for zero results. Out-of-range page numbers
 * clamp to the nearest valid page rather than returning an empty slice.
 */
export function paginate<T>(
  items: T[],
  page: number,
  pageSize: number,
): PaginationResult<T> {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const clampedPage = Math.min(Math.max(1, Math.floor(page)), totalPages);
  const startIndex = (clampedPage - 1) * pageSize;

  return {
    items: items.slice(startIndex, startIndex + pageSize),
    pageInfo: {
      page: clampedPage,
      pageSize,
      totalItems,
      totalPages,
      hasPrevious: clampedPage > 1,
      hasNext: clampedPage < totalPages,
    },
  };
}
