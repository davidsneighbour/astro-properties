import type { SchemaContext } from "astro:content";
import { reference } from "astro:content";
import { z } from "zod";
import { propertyBaseSchema } from "./schema.js";

/**
 * Wraps `propertyBaseSchema` with the Astro-specific `image()`/`reference()`
 * fields that can only be resolved inside a real Astro content collection
 * (as opposed to the framework-agnostic base schema, which is unit-tested
 * directly in `test/schema.test.ts`).
 */
export function definePropertySchema({ image }: SchemaContext) {
  return propertyBaseSchema.extend({
    coverImage: image(),
    gallery: z.array(image()).default([]),
    agent: reference("agents").optional(),
    agency: reference("agencies").optional(),
    office: reference("offices").optional(),
    development: reference("developments").optional(),
  });
}

export function defineDevelopmentSchema({ image }: SchemaContext) {
  return z.object({
    title: z.string(),
    hero: image(),
    location: propertyBaseSchema.shape.location,
  });
}
