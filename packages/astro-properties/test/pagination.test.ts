import { describe, expect, it } from "vitest";
import { paginate } from "../src/lib/pagination.js";

const items = Array.from({ length: 25 }, (_, i) => i + 1);

describe("paginate", () => {
  it("returns page 1 of 1 for an empty item set", () => {
    const result = paginate([], 1, 10);

    expect(result.items).toEqual([]);
    expect(result.pageInfo).toEqual({
      page: 1,
      pageSize: 10,
      totalItems: 0,
      totalPages: 1,
      hasPrevious: false,
      hasNext: false,
    });
  });

  it("reports exactly one page when every item fits on it", () => {
    const result = paginate([1, 2, 3], 1, 10);

    expect(result.items).toEqual([1, 2, 3]);
    expect(result.pageInfo.totalPages).toBe(1);
    expect(result.pageInfo.hasPrevious).toBe(false);
    expect(result.pageInfo.hasNext).toBe(false);
  });

  it("slices the first page correctly for a padded set spanning multiple pages", () => {
    const result = paginate(items, 1, 10);

    expect(result.items).toEqual(items.slice(0, 10));
    expect(result.pageInfo).toMatchObject({
      page: 1,
      totalItems: 25,
      totalPages: 3,
      hasPrevious: false,
      hasNext: true,
    });
  });

  it("slices a middle page correctly", () => {
    const result = paginate(items, 2, 10);

    expect(result.items).toEqual(items.slice(10, 20));
    expect(result.pageInfo).toMatchObject({
      page: 2,
      hasPrevious: true,
      hasNext: true,
    });
  });

  it("slices the last (partial) page correctly", () => {
    const result = paginate(items, 3, 10);

    expect(result.items).toEqual(items.slice(20, 25));
    expect(result.pageInfo).toMatchObject({
      page: 3,
      totalPages: 3,
      hasPrevious: true,
      hasNext: false,
    });
  });

  it("clamps a page number above the last page down to the last page", () => {
    const result = paginate(items, 99, 10);

    expect(result.pageInfo.page).toBe(3);
    expect(result.items).toEqual(items.slice(20, 25));
  });

  it("clamps a page number below 1 up to page 1", () => {
    const result = paginate(items, 0, 10);

    expect(result.pageInfo.page).toBe(1);
    expect(result.items).toEqual(items.slice(0, 10));
  });

  it("clamps a negative page number up to page 1", () => {
    const result = paginate(items, -5, 10);

    expect(result.pageInfo.page).toBe(1);
  });
});
