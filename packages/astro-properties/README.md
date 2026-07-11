# @davidsneighbour/astro-properties

Property-sales features (schemas, components, layouts, search) for Astro sites — Zod
schemas over Markdown/MDX + YAML frontmatter and TOML data collections, plus a
Tailwind + shadcn/ui component library for listings, galleries, maps, and agent pages.

> **Status:** early prototype (Phase 1). See the repository root `ROADMAP.md` for what's
> built and what's next.

## Requirements

* Astro `>=7.0.0`
* Tailwind CSS 4 configured in the consuming project
* `@astrojs/react` + `react`/`react-dom` (interactive components use shadcn/ui, which is
  React + Radix UI based — see `ASSUMPTIONS.md` at the repo root for why)

## Install

```bash
npm install @davidsneighbour/astro-properties
```

## Quickstart

1. Define collections in the consuming project's `src/content.config.ts`:

   ```ts
   import { definePropertySchema } from "@davidsneighbour/astro-properties/content-schema";
   import { agentSchema } from "@davidsneighbour/astro-properties/schema";
   import { tomlLoader } from "@davidsneighbour/astro-properties/lib/toml-loader.js";
   import { defineCollection } from "astro:content";
   import { glob } from "astro/loaders";

   const properties = defineCollection({
     loader: glob({ pattern: "**/*.mdx", base: "./src/content/properties" }),
     schema: definePropertySchema,
   });

   const agents = defineCollection({
     loader: tomlLoader({ pattern: "**/*.toml", base: "./src/content/agents" }),
     schema: agentSchema,
   });

   export const collections = { properties, agents };
   ```

2. Author a property as `src/content/properties/seaview-villa/index.mdx` — YAML
   frontmatter for structured fields, MDX body for the long description:

   ```mdx
   ---
   title: "Seaview Villa"
   listingType: sale
   status: for-sale
   type: villa
   price:
     amount: 450000
     currency: USD
   location:
     city: "Koh Samui"
     country: "Thailand"
     lat: 9.5312
     lng: 100.0631
   coverImage: "./cover.jpg"
   agent: jane-doe
   ---

   A four-bedroom villa with an infinity pool and sea views.
   ```

   Author an agent as `src/content/agents/jane-doe.toml` (TOML, since it has no
   long-form body):

   ```toml
   name = "Jane Doe"
   email = "jane@example.com"
   ```

3. Use the components in a page:

   ```astro
   ---
   import PropertyCard from "@davidsneighbour/astro-properties/components/PropertyCard.astro";
   import { getCollection } from "astro:content";

   const properties = await getCollection("properties");
   ---

   {properties.map((entry) => (
     <PropertyCard
       href={`/properties/${entry.id}`}
       title={entry.data.title}
       price={entry.data.price}
       coverImageSrc={entry.data.coverImage.src}
       coverImageAlt={entry.data.title}
       bedrooms={entry.data.bedrooms}
       bathrooms={entry.data.bathrooms}
     />
   ))}
   ```

See `apps/demo` in this repository for a complete, working example site.

## What's exported

* `.` / `./schema` — framework-agnostic Zod schemas (`propertyBaseSchema`, `agentSchema`,
  `agencySchema`, `officeSchema`, enums, `Price`/`Location`/`Energy` types)
* `./content-schema` — `definePropertySchema()` / `defineDevelopmentSchema()`, wrapping
  the base schema with Astro's `image()`/`reference()` for use in `content.config.ts`
* `./lib/*` — `formatPrice`/`formatCurrency`/`formatArea`, `getMapProvider` (Leaflet
  tile-provider adapter), `tomlLoader` (TOML content-collection loader)
* `./components/*` — `PriceBadge`, `SpecsBar`, `AmenitiesList`, `PropertyCard` (more
  landing as later phases build them — see the repo root `ROADMAP.md`)

## Testing

```bash
npm test           # vitest
npm run test:coverage
npm run typecheck  # tsc --noEmit
```

Components are tested with Astro's Container API (`experimental_AstroContainer`);
library logic (schemas, formatters, the TOML loader) has plain unit tests. See
`ASSUMPTIONS.md` at the repo root for why this package typechecks with plain `tsc`
rather than `astro check`.

## Release

```bash
npm run release:dry
npm run release
```

Releases are handled by `release-it` + `@dnbhq/release-config`. Pushing a `v*` tag
triggers the `Publish @davidsneighbour/astro-properties` GitHub Actions workflow.
