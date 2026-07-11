import { describe, expect, it } from "vitest";
import {
  closeLightbox,
  createLightboxState,
  currentLightboxImage,
  openLightbox,
  stepLightbox,
} from "../src/lib/lightbox.js";

const images = [
  { src: "/a.jpg", alt: "A" },
  { src: "/b.jpg", alt: "B" },
  { src: "/c.jpg", alt: "C" },
];

describe("createLightboxState", () => {
  it("starts closed at index 0", () => {
    const state = createLightboxState(images);
    expect(state.isOpen).toBe(false);
    expect(state.index).toBe(0);
  });
});

describe("openLightbox", () => {
  it("opens at the given index", () => {
    const state = openLightbox(createLightboxState(images), 2);
    expect(state.isOpen).toBe(true);
    expect(state.index).toBe(2);
  });

  it("clamps an out-of-range index", () => {
    const state = openLightbox(createLightboxState(images), 99);
    expect(state.index).toBe(2);
  });

  it("is a no-op when there are no images", () => {
    const state = openLightbox(createLightboxState([]), 0);
    expect(state.isOpen).toBe(false);
  });
});

describe("closeLightbox (Esc key)", () => {
  it("closes an open lightbox", () => {
    const opened = openLightbox(createLightboxState(images), 1);
    const closed = closeLightbox(opened);
    expect(closed.isOpen).toBe(false);
  });

  it("preserves the current index when closing", () => {
    const opened = openLightbox(createLightboxState(images), 1);
    const closed = closeLightbox(opened);
    expect(closed.index).toBe(1);
  });
});

describe("stepLightbox (arrow key navigation)", () => {
  it("steps forward", () => {
    const state = stepLightbox(openLightbox(createLightboxState(images), 0), 1);
    expect(state.index).toBe(1);
  });

  it("steps backward", () => {
    const state = stepLightbox(
      openLightbox(createLightboxState(images), 1),
      -1,
    );
    expect(state.index).toBe(0);
  });

  it("wraps forward past the last image to the first", () => {
    const state = stepLightbox(openLightbox(createLightboxState(images), 2), 1);
    expect(state.index).toBe(0);
  });

  it("wraps backward past the first image to the last", () => {
    const state = stepLightbox(
      openLightbox(createLightboxState(images), 0),
      -1,
    );
    expect(state.index).toBe(2);
  });

  it("is a no-op when there are no images", () => {
    const state = stepLightbox(createLightboxState([]), 1);
    expect(state.index).toBe(0);
  });
});

describe("currentLightboxImage", () => {
  it("returns the image at the current index", () => {
    const state = openLightbox(createLightboxState(images), 1);
    expect(currentLightboxImage(state)).toEqual({ src: "/b.jpg", alt: "B" });
  });

  it("returns undefined for an empty image list", () => {
    expect(currentLightboxImage(createLightboxState([]))).toBeUndefined();
  });
});
