import { describe, expect, it } from "vitest";
import {
  distanceKm,
  isPointInPolygon,
  isPointInRadius,
} from "../src/lib/geo.js";

// Real seed coordinates (apps/demo/src/content/properties/*/index.mdx), all on Koh Samui.
const oldTownRetailUnit = { lat: 9.6652, lng: 99.9647 };
const riversideApartment = { lat: 9.6674, lng: 99.9631 }; // ~260m from oldTownRetailUnit
const seaviewVilla = { lat: 9.5312, lng: 100.0631 }; // ~18km from oldTownRetailUnit
const hillsideFarmhouse = { lat: 9.5089, lng: 99.9219 };
const missouriLot = { lat: 9.4884, lng: 99.9012 };

describe("distanceKm", () => {
  it("is zero for a point and itself", () => {
    expect(distanceKm(seaviewVilla, seaviewVilla)).toBe(0);
  });

  it("is symmetric", () => {
    expect(distanceKm(oldTownRetailUnit, seaviewVilla)).toBeCloseTo(
      distanceKm(seaviewVilla, oldTownRetailUnit),
      10,
    );
  });

  it("approximates ~111km per degree of latitude", () => {
    expect(distanceKm({ lat: 0, lng: 0 }, { lat: 1, lng: 0 })).toBeCloseTo(
      111.19,
      0,
    );
  });

  it("reports two nearby seed listings as close together", () => {
    expect(distanceKm(oldTownRetailUnit, riversideApartment)).toBeLessThan(0.5);
  });

  it("reports two distant seed listings as far apart", () => {
    expect(distanceKm(oldTownRetailUnit, seaviewVilla)).toBeGreaterThan(15);
  });
});

describe("isPointInRadius", () => {
  it("includes a listing within the radius", () => {
    expect(isPointInRadius(riversideApartment, oldTownRetailUnit, 1)).toBe(
      true,
    );
  });

  it("excludes a listing outside the radius", () => {
    expect(isPointInRadius(seaviewVilla, oldTownRetailUnit, 1)).toBe(false);
  });

  it("includes a listing exactly at the center", () => {
    expect(isPointInRadius(oldTownRetailUnit, oldTownRetailUnit, 0.001)).toBe(
      true,
    );
  });

  it("narrows the real seed set down to the nearby pair with a 1km radius search", () => {
    const all = [
      oldTownRetailUnit,
      riversideApartment,
      seaviewVilla,
      hillsideFarmhouse,
      missouriLot,
    ];
    const matching = all.filter((point) =>
      isPointInRadius(point, oldTownRetailUnit, 1),
    );

    expect(matching).toEqual([oldTownRetailUnit, riversideApartment]);
  });
});

describe("isPointInPolygon", () => {
  const square = [
    { lat: 0, lng: 0 },
    { lat: 0, lng: 10 },
    { lat: 10, lng: 10 },
    { lat: 10, lng: 0 },
  ];

  it("includes a point inside the polygon", () => {
    expect(isPointInPolygon({ lat: 5, lng: 5 }, square)).toBe(true);
  });

  it("excludes a point outside the polygon", () => {
    expect(isPointInPolygon({ lat: 15, lng: 15 }, square)).toBe(false);
  });

  it("excludes a point outside on one axis only", () => {
    expect(isPointInPolygon({ lat: 5, lng: 15 }, square)).toBe(false);
  });

  it("handles a non-convex (L-shaped) polygon correctly", () => {
    const lShape = [
      { lat: 0, lng: 0 },
      { lat: 0, lng: 10 },
      { lat: 5, lng: 10 },
      { lat: 5, lng: 5 },
      { lat: 10, lng: 5 },
      { lat: 10, lng: 0 },
    ];

    expect(isPointInPolygon({ lat: 2, lng: 2 }, lShape)).toBe(true);
    // Inside the L's bounding box but in the notch that was cut out.
    expect(isPointInPolygon({ lat: 8, lng: 8 }, lShape)).toBe(false);
  });

  it("narrows the real seed set to a small bounding box around the nearby pair", () => {
    const boundingBox = [
      { lat: 9.66, lng: 99.96 },
      { lat: 9.66, lng: 99.97 },
      { lat: 9.67, lng: 99.97 },
      { lat: 9.67, lng: 99.96 },
    ];
    const all = [
      oldTownRetailUnit,
      riversideApartment,
      seaviewVilla,
      hillsideFarmhouse,
      missouriLot,
    ];
    const matching = all.filter((point) =>
      isPointInPolygon(point, boundingBox),
    );

    expect(matching).toEqual([oldTownRetailUnit, riversideApartment]);
  });
});
