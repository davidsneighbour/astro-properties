import { describe, expect, it } from "vitest";
import { buildRangeIndex } from "../src/lib/filter.js";

describe("buildRangeIndex", () => {
  it("computes min/max/buckets for price and area, ignoring nulls", () => {
    const index = buildRangeIndex(
      [
        { id: "a", price: 100_000, areaSize: 50 },
        { id: "b", price: 200_000, areaSize: 100 },
        { id: "c", price: 300_000, areaSize: null },
        { id: "d", price: 400_000, areaSize: 150 },
        { id: "e", price: 500_000, areaSize: 200 },
        { id: "f", price: null, areaSize: 75 },
      ],
      5,
    );

    expect(index.price.min).toBe(100_000);
    expect(index.price.max).toBe(500_000);
    expect(index.price.buckets).toHaveLength(5);
    expect(
      index.price.buckets.reduce((sum, bucket) => sum + bucket.count, 0),
    ).toBe(5);
    // Five evenly spaced prices across five buckets land one per bucket.
    expect(index.price.buckets.every((bucket) => bucket.count === 1)).toBe(
      true,
    );

    expect(index.area.min).toBe(50);
    expect(index.area.max).toBe(200);
    expect(
      index.area.buckets.reduce((sum, bucket) => sum + bucket.count, 0),
    ).toBe(5);

    expect(index.listings).toHaveLength(6);
  });

  it("returns zero/empty stats when every value is null", () => {
    const index = buildRangeIndex([
      { id: "a", price: null, areaSize: null },
      { id: "b", price: null, areaSize: null },
    ]);

    expect(index.price).toEqual({ min: 0, max: 0, buckets: [] });
    expect(index.area).toEqual({ min: 0, max: 0, buckets: [] });
  });

  it("returns zero/empty stats for an empty listing set", () => {
    const index = buildRangeIndex([]);

    expect(index.price).toEqual({ min: 0, max: 0, buckets: [] });
    expect(index.listings).toEqual([]);
  });

  it("collapses into a single bucket when every value is identical", () => {
    const index = buildRangeIndex([
      { id: "a", price: 250_000, areaSize: 80 },
      { id: "b", price: 250_000, areaSize: 80 },
      { id: "c", price: 250_000, areaSize: 80 },
    ]);

    expect(index.price.buckets).toEqual([
      { min: 250_000, max: 250_000, count: 3 },
    ]);
  });

  it("puts the maximum value in the last bucket, not out of range", () => {
    const index = buildRangeIndex(
      [
        { id: "a", price: 0, areaSize: null },
        { id: "b", price: 1000, areaSize: null },
      ],
      2,
    );

    expect(index.price.buckets).toEqual([
      { min: 0, max: 500, count: 1 },
      { min: 500, max: 1000, count: 1 },
    ]);
  });

  it("defaults to 10 buckets when bucketCount is not given", () => {
    const index = buildRangeIndex([
      { id: "a", price: 0, areaSize: null },
      { id: "b", price: 1000, areaSize: null },
    ]);

    expect(index.price.buckets).toHaveLength(10);
  });
});
