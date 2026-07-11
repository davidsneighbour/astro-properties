import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it } from "vitest";
import Gallery from "../src/components/Gallery.astro";

describe("Gallery", () => {
  it("renders nothing for an empty image list", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(Gallery, {
      props: { images: [] },
    });
    expect(result.trim()).toBe("");
  });

  it("renders a single image without error", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(Gallery, {
      props: { images: [{ src: "/a.jpg", alt: "Cover" }] },
    });
    expect(result).toContain('src="/a.jpg"');
    expect(result).toContain('alt="Cover"');
  });

  it("renders many images, each as a lightbox trigger", async () => {
    const container = await AstroContainer.create();
    const images = [
      { src: "/a.jpg", alt: "A" },
      { src: "/b.jpg", alt: "B" },
      { src: "/c.jpg", alt: "C" },
    ];
    const result = await container.renderToString(Gallery, {
      props: { images },
    });

    const triggers = result.match(/data-lightbox-trigger/g) ?? [];
    expect(triggers).toHaveLength(3);
    expect(result).toContain('data-lightbox-index="0"');
    expect(result).toContain('data-lightbox-index="1"');
    expect(result).toContain('data-lightbox-index="2"');
  });

  it("includes a Lightbox instance carrying the full image list as JSON", async () => {
    const container = await AstroContainer.create();
    const images = [
      { src: "/a.jpg", alt: "A" },
      { src: "/b.jpg", alt: "B" },
    ];
    const result = await container.renderToString(Gallery, {
      props: { images },
    });

    expect(result).toContain("data-lightbox=");
    expect(result).toContain(JSON.stringify(images).replace(/"/g, "&quot;"));
  });
});
