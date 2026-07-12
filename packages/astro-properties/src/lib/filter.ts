export interface RangeIndexListing {
  id: string;
  price: number | null;
  areaSize: number | null;
}

export interface RangeBucket {
  min: number;
  max: number;
  count: number;
}

export interface RangeStats {
  min: number;
  max: number;
  buckets: RangeBucket[];
}

export interface RangeIndex {
  price: RangeStats;
  area: RangeStats;
  listings: RangeIndexListing[];
}

function buildStats(values: number[], bucketCount: number): RangeStats {
  if (values.length === 0) {
    return { min: 0, max: 0, buckets: [] };
  }

  const min = Math.min(...values);
  const max = Math.max(...values);

  if (min === max) {
    return { min, max, buckets: [{ min, max, count: values.length }] };
  }

  const width = (max - min) / bucketCount;
  const counts = new Map<number, number>();
  for (const value of values) {
    const bucketIndex = Math.min(
      bucketCount - 1,
      Math.floor((value - min) / width),
    );
    counts.set(bucketIndex, (counts.get(bucketIndex) ?? 0) + 1);
  }

  const buckets: RangeBucket[] = Array.from(
    { length: bucketCount },
    (_, i) => ({
      min: min + i * width,
      max: i === bucketCount - 1 ? max : min + (i + 1) * width,
      count: counts.get(i) ?? 0,
    }),
  );

  return { min, max, buckets };
}

/**
 * Build-time JSON index for price/area range filtering. Pagefind's filters
 * are categorical (exact-match tags), too coarse for a precise numeric
 * range slider — this small index is fetched and filtered client-side
 * instead, keyed by listing id so callers can cross-reference it against
 * Pagefind search results.
 */
export function buildRangeIndex(
  listings: RangeIndexListing[],
  bucketCount = 10,
): RangeIndex {
  const prices = listings
    .map((listing) => listing.price)
    .filter((price): price is number => price != null);
  const areas = listings
    .map((listing) => listing.areaSize)
    .filter((area): area is number => area != null);

  return {
    price: buildStats(prices, bucketCount),
    area: buildStats(areas, bucketCount),
    listings,
  };
}
