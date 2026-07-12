import { getCollection } from "astro:content";
import { buildRangeIndex } from "@davidsneighbour/astro-properties/lib/filter.js";
import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  const properties = await getCollection("properties");
  const index = buildRangeIndex(
    properties.map((entry) => ({
      id: entry.id,
      price: entry.data.price.onRequest
        ? null
        : (entry.data.price.amount ?? null),
      areaSize: entry.data.areaSize ?? null,
    })),
  );

  return new Response(JSON.stringify(index), {
    headers: { "content-type": "application/json" },
  });
};
