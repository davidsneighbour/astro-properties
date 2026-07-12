# @davidsneighbour/astro-properties

Property-sales features (schemas, components, layouts, search) for Astro sites — Zod
schemas over Markdown/MDX + YAML frontmatter and TOML data collections, plus a
Tailwind + shadcn/ui component library for listings, galleries, maps, and agent pages.

> **Status:** early prototype (Phase 1). See the repository root `ROADMAP.md` for what's
> built and what's next.

## Requirements

* Astro `>=7.0.0`
* `@astrojs/mdx`, with the `mdx()` integration registered in `astro.config.mjs` — property
  content is authored as `.mdx`, and the `glob()` loader silently skips `.mdx` files with no
  entry type (empty collection, no build error) if this integration isn't registered
* Tailwind CSS 4 configured in the consuming project
* `@astrojs/react` + `react`/`react-dom` (interactive components use shadcn/ui, which is
  React + Radix UI based — see `ASSUMPTIONS.md` at the repo root for why)

## Install

```bash
npm install @davidsneighbour/astro-properties @astrojs/mdx
```

Register the MDX integration in `astro.config.mjs`:

```js
import mdx from "@astrojs/mdx";
import { defineConfig } from "astro/config";

export default defineConfig({
  integrations: [mdx()],
});
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

See `apps/demo` in this repository for a complete, working example site. Verified by
actually installing this package into a fresh `npm create astro` project and following
these exact steps.

## Validation errors

Bad frontmatter fails the build with a message pointing at the offending field(s),
rather than silently producing broken output. For example, a property missing
`price.amount` (without `onRequest: true`) and an out-of-range `location.lat`:

```text
[InvalidContentEntryDataError] properties → my-listing data does not match collection schema.

  price.amount: price.amount is required unless onRequest is true
  location.lat: Too big: expected number to be <=90

  Location:
    src/content/properties/my-listing/index.mdx:0:0
```

## What's exported

* `.` / `./schema` — framework-agnostic Zod schemas (`propertyBaseSchema`, `agentSchema`,
  `agencySchema`, `officeSchema`, enums, `Price`/`Location`/`Energy` types)
* `./content-schema` — `definePropertySchema()` / `defineDevelopmentSchema()`, wrapping
  the base schema with Astro's `image()`/`reference()` for use in `content.config.ts`
* `./lib/*` — `formatPrice`/`formatCurrency`/`formatArea`/`formatSortableNumber`,
  `getMapProvider` (Leaflet tile-provider adapter), `tomlLoader` (TOML content-collection
  loader), `lightbox.ts` (pure open/close/step state for `Lightbox`), `structured-data.ts`
  (pure JSON-LD mapping for `StructuredData`), `buildRangeIndex` (`filter.ts` — build-time
  min/max/bucket JSON index for numeric price/area range filtering, since Pagefind's own
  filters are categorical and too coarse for that; see `apps/demo`'s `listings-index.json.ts`
  endpoint and `SearchFilters` island)
* `./components/*` — `PriceBadge`, `SpecsBar`, `AmenitiesList`, `PropertyCard`,
  `Gallery`, `Lightbox`, `PropertyMap` (Leaflet), `AgentCard`, `StructuredData` (JSON-LD)
* `./layouts/*` — `ListingLayout` (archive grid of `PropertyCard`s) and `PropertyLayout`
  (single-property detail page, composing all of the above and carrying the
  `data-pagefind-body`/`data-pagefind-filter`/`data-pagefind-meta`/`data-pagefind-sort`
  attributes real full-text search and faceting are indexed from — see `apps/demo`'s
  `postbuild` script and `SearchFilters` island) — more landing as later phases build
  them, see the repo root `ROADMAP.md`

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
