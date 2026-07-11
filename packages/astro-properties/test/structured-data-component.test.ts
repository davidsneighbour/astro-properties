import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it } from "vitest";
import StructuredData from "../src/components/StructuredData.astro";

describe("StructuredData", () => {
  it("emits a well-formed application/ld+json script for a seed listing", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(StructuredData, {
      props: {
        title: "Seaview Villa",
        description: "A four-bedroom villa with an infinity pool.",
        url: "https://example.com/properties/seaview-villa",
        images: ["/images/seaview-villa.jpg"],
        price: { amount: 450000, currency: "USD", onRequest: false },
        location: {
          city: "Koh Samui",
          country: "Thailand",
          lat: 9.5312,
          lng: 100.0631,
          zoom: 14,
          hideExact: false,
        },
        agentName: "Jane Doe",
      },
    });

    expect(result).toContain('type="application/ld+json"');

    const match = result.match(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
    );
    expect(match).not.toBeNull();

    const parsed = JSON.parse(match?.[1] ?? "");
    expect(parsed["@context"]).toBe("https://schema.org");
    expect(parsed["@type"]).toBe("RealEstateListing");
    expect(parsed.name).toBe("Seaview Villa");
    expect(parsed.offers.price).toBe(450000);
    expect(parsed.agent.name).toBe("Jane Doe");
  });
});
