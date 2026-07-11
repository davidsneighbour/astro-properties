# Astro property sales theme — project roadmap

A reusable package that brings a full modern real-estate website (listings, search,
maps, galleries, agent pages) to any Astro site. This document is the working plan:
it captures the research, the locked stack decisions, the architecture, and a phased
task list starting with a prototype you can extend from.

---

## 1. Goal & distribution decision

**Goal:** ship a package that "various users" can drop into an Astro project to get
property-sales features — schema + validation rules for properties, automatic
galleries, single-page and listing templates, and site search.

**Distribution shape (hybrid):** one npm package (working name `@acme/astro-properties`)
that exports (a) the Zod schemas + a `defineProperties()` collection helper, (b) a
component library, and (c) an optional integration that `injectRoute`s the listing,
detail, and search pages — plus a separate **demo/starter repo** wired up with seed
data. Power users wire pages themselves; casual users get one-line setup. This is the
right shape because our varied users mostly want to *add* this to an existing site,
not clone a whole theme.

A recurring lesson from the plugins below (EPL, Property Hive's Honeycomb, WP-Property)
is **stay theme-agnostic with minimal CSS** so the package adapts to any host site.
We follow that: ship unstyled markup + CSS-variable tokens, not an opinionated skin.

> Target Astro 6.x (current stable, 2026). Content-collections config lives in
> `src/content.config.ts`; the loader API is mandatory in v6. Avoid the Astro 7 alpha.

---

## 2. Research sources

Themes and plugins studied for feature transport:

* **Themes:** Houzez, RealHomes, WP Residence, Real Estate 7, HomePress (StyleMix), plus the broader ThemeForest real-estate category.
* **Plugins:** Easy Property Listings (EPL), Property Hive, Essential Real Estate, WP-Property (Usability Dynamics).

Houzez remains the feature benchmark (most complete field set). The plugins matter
because each models the domain differently from the US-centric themes — especially
Property Hive (UK estate-agency model) and WP-Property (generic attribute engine).

---

## 3. Feature research — what to transport

### Consolidated "must-have" listing fields

Bedrooms, bathrooms, rooms, garage/parking, year built, property type, status,
deposit, area size + unit, land area, amenities/features, additional rooms, equipment,
full address (street/city/state/zip/area/country), map pin, photo gallery, floor plans
(each with title/size/price/beds/baths/image), price with before/after labels
("Start From", "Per Month"), second price (per sqft), and a unique property ID.

### Distinctive ideas contributed by each source

| Source | What it adds to our model |
|---|---|
| **Houzez** | Richest detail page: 360° virtual tours, floor plans as objects, multi-unit sub-listings, marketing labels, location taxonomy (Country→State→City→Area), EU energy class, saved searches, map draw-to-search |
| **EPL** | **Listing *categories* as first-class**: property, rental, land, rural, business, commercial, commercial-land. Landlord/seller attached to listing. "Feature search" to avoid empty results. Contacts/leads + testimonials linked to properties. REAXML/CSV import |
| **Property Hive** | **UK estate-agency model**: Sales / Lettings / Commercial / **Student** deal types; **tenure** (freehold/leasehold); **EPC** graph (current/potential ratings); rent frequencies incl. **PPPW**; Notes & History (price/status audit trail); calculators (mortgage, **stamp duty, rental yield, affordability**); CRM (applicants + requirements, viewings, matching, enquiries); **offices/branches**; portal feeds in/out (Rightmove BLM, Zoopla, OnTheMarket, Kyero, Jupix, Reapit); radial/proximity + draw search; local-area data (schools, transport, sold prices) |
| **WP-Property** | **Generic attribute engine**: unlimited custom attributes with typed inputs (text, number, currency, dropdown, checkbox, date, file/image, URL, color). **Hierarchical parent-child** property types with inheritance (a building auto-derives its price range from child floor-plans). "Supermap": one map of all listings with live sidebar filtering |
| **HomePress** | Switchable map providers (Google/OSM/Mapbox); proximity search km/miles; geolocation autocomplete scoped to a country; "similar properties"; "what's nearby" (Yelp); demo switcher |
| **Essential Real Estate** | Free-tier baseline: detailed listings, advanced search + filters, favorites/shortlist, **side-by-side comparison**, new-listing alerts, agent profiles, Google Maps |

### Cross-cutting features we will support (phased)

Advanced faceted search; map-based search (clustered markers, draw-a-search,
radius/proximity, location autocomplete, one all-listings "supermap"); favorites &
comparison; calculators; agent/agency/office pages; labels/badges (incl.
auto-"Price Reduced" derived from git/price history); featured slider; multi-unit &
parent-child developments; SEO structured data; i18n; EU energy/EPC; local-area data.

### Treated as "needs a backend" (later, sSR/external)

Front-end submission, live MLS/portal sync, saved-search email alerts, full CRM
(applicants/viewings), ratings. The static-first core covers everything else; the
*enquiry* and *book-a-viewing* forms still work by POSTing to a configurable endpoint.

---

## 4. Locked stack decisions

| Concern | Decision | Why |
|---|---|---|
| **Search** | **Pagefind** | Static, zero-infra; indexes built HTML, ~10KB runtime. Crucially it does **both** full-text search **and faceted filtering** via `data-pagefind-filter` attributes (type, status, beds, location) and `data-pagefind-sort`. For precise **numeric range** (price/area) + custom sort, supplement with a small generated JSON index filtered client-side. Move to an SSR endpoint only beyond a few thousand listings |
| **Validation** | **Zod** | Native to Astro content collections — one schema gives runtime validation **and** TypeScript types. Our `propertySchema` and the rules in §6 are Zod |
| **Authoring format** | **Markdown + YAML frontmatter** | One `.md` file per property: frontmatter = structured fields, body = the long description. Loaded with the `glob` loader on `**/*.md`. Friendly to git, CMSs (Keystatic/Decap), and human editing |
| **Maps** | **Leaflet** (provider-agnostic) | Best fit for "switch providers easily": the base map is just a **tile-layer URL**, so swapping OSM ↔ MapTiler ↔ Stadia ↔ Mapbox-tiles ↔ Google is a one-line config change. Ecosystem covers our needs: `Leaflet.markercluster` (clustering), `Leaflet.draw` + `leaflet-geosearch` (draw-a-search, geocoding/autocomplete). Wrapped in a thin `map-providers.ts` adapter so the provider is configurable |

**Why Leaflet over MapLibre GL** (the obvious alternative): MapLibre is excellent for
vector/3D, but its styling is tied to its own GL style spec, which makes provider
switching *harder*, not easier. Leaflet's raster tile-layer abstraction is exactly the
switchability the brief asks for. Keep MapLibre as a documented upgrade path if vector
tiles/3D are needed later; the `map-providers.ts` seam makes that swap localized.

---

## 5. Package architecture

```
@acme/astro-properties/
├─ package.json            # keywords: astro-component, astro-integration, withastro
├─ src/
│  ├─ schema.ts            # Zod schemas + enums + defineProperties() helper
│  ├─ integration.ts       # optional: injectRoute, config, virtual modules
│  ├─ components/
│  │  ├─ PropertyCard.astro
│  │  ├─ PropertyGrid.astro
│  │  ├─ Gallery.astro            # auto-gallery from frontmatter images
│  │  ├─ Lightbox.astro           # island (client:visible)
│  │  ├─ PropertyMap.astro        # Leaflet island, single marker
│  │  ├─ SuperMap.astro           # Leaflet island, all listings + live filter
│  │  ├─ AmenitiesList.astro
│  │  ├─ PriceBadge.astro         # sale/rent/POA/"starting at"/PPPW
│  │  ├─ SpecsBar.astro           # beds / baths / area icons
│  │  ├─ EnergyGraph.astro        # EPC current/potential
│  │  ├─ AgentCard.astro
│  │  ├─ EnquiryForm.astro        # island; POSTs to configurable endpoint
│  │  ├─ FloorPlans.astro
│  │  ├─ Calculators.astro        # mortgage, stamp duty, yield, affordability (islands)
│  │  ├─ SearchFilters.astro      # island; Pagefind filters + range sliders
│  │  ├─ CompareTray.astro        # favorites/compare (localStorage island)
│  │  ├─ FeaturedSlider.astro
│  │  └─ StructuredData.astro     # JSON-LD (schema.org)
│  ├─ layouts/
│  │  ├─ PropertyLayout.astro     # single-property template
│  │  └─ ListingLayout.astro      # archive/search results
│  ├─ lib/
│  │  ├─ format.ts                # price/area/currency/unit formatting
│  │  ├─ filter.ts                # client-side numeric-range filtering + sort
│  │  ├─ map-providers.ts         # tile-layer adapter: osm | maptiler | mapbox | google
│  │  └─ price-history.ts         # derive "Price Reduced" from prior values
│  └─ styles/                     # CSS variables / theme tokens (minimal)
├─ pages/                         # routes the integration injects
│  ├─ properties/[...slug].astro
│  ├─ properties/index.astro
│  └─ search.astro
└─ README.md
```

Content lives in the **consumer's** project (Markdown w/ frontmatter):

```
src/content/
├─ properties/    *.md          (frontmatter + description body)
├─ agents/        *.md
├─ agencies/      *.md
├─ offices/       *.md          (optional branches)
└─ developments/  *.md          (optional parent for multi-unit/child listings)
```

---

## 6. Data model & validation rules (zod over frontmatter)

```ts
import { z, reference } from 'astro:content';

export const ListingType = z.enum(['sale', 'rent']);              // the deal
export const Category = z.enum([                                  // EPL/PHive top level
  'residential', 'commercial', 'land', 'rural', 'student', 'short-term',
]);
export const PropertyStatus = z.enum([
  'for-sale', 'for-rent', 'sold', 'rented',
  'under-offer', 'coming-soon', 'off-market',
]);
export const PropertyType = z.enum([
  'apartment', 'condominium', 'house', 'villa', 'townhouse', 'studio',
  'land', 'office', 'retail', 'warehouse', 'industrial', 'new-development', 'other',
]);
export const Tenure = z.enum([                                    // Property Hive
  'freehold', 'leasehold', 'share-of-freehold', 'commonhold', 'other',
]);

const Price = z.object({
  amount: z.number().nonnegative().optional(),
  currency: z.string().default('USD'),
  onRequest: z.boolean().default(false),         // POA
  prefixLabel: z.string().optional(),            // "Starting at", "Asking", "From"
  suffixLabel: z.string().optional(),            // "/month", "per night"
  period: z.enum(['month', 'week', 'night', 'year', 'pppw']).optional(), // pppw = student
  deposit: z.number().optional(),
  secondAmount: z.number().optional(),           // e.g. price per sqm
}).refine(p => p.onRequest || p.amount != null, {
  message: 'price.amount is required unless onRequest is true',
});

const Location = z.object({
  address: z.string().optional(),
  city: z.string(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string(),
  area: z.string().optional(),                   // neighborhood
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  zoom: z.number().int().min(1).max(20).default(14),
  hideExact: z.boolean().default(false),         // approximate marker only
});

const Energy = z.object({                         // EPC graph (Property Hive)
  class: z.string().optional(),                   // A–G
  epcCurrent: z.number().min(0).max(100).optional(),
  epcPotential: z.number().min(0).max(100).optional(),
});

const FloorPlan = z.object({
  title: z.string(),
  image: z.string(),
  size: z.number().optional(),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  price: z.number().optional(),
  description: z.string().optional(),
});

export const propertySchema = ({ image }) => z.object({
  // identity / classification
  title: z.string(),
  propertyId: z.string().optional(),
  listingType: ListingType,
  category: Category.default('residential'),
  status: PropertyStatus,
  type: PropertyType,
  tenure: Tenure.optional(),
  labels: z.array(z.string()).default([]),       // New, Luxury, Waterfront, Price Reduced
  featured: z.boolean().default(false),
  // pricing
  price: Price,
  // specs / size
  bedrooms: z.number().int().nonnegative().optional(),
  bathrooms: z.number().nonnegative().optional(),
  rooms: z.number().int().optional(),
  areaSize: z.number().optional(),
  areaUnit: z.enum(['sqft', 'sqm']).default('sqm'),
  landArea: z.number().optional(),
  landUnit: z.enum(['sqft', 'sqm', 'acre', 'rai']).optional(),
  parking: z.array(z.string()).default([]),      // multiple options (Property Hive)
  yearBuilt: z.number().int().optional(),
  floorLevel: z.number().int().optional(),
  // amenities + extensible attributes (WP-Property idea)
  amenities: z.array(z.string()).default([]),
  additionalRooms: z.array(z.string()).default([]),
  custom: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
  // location + energy
  location: Location,
  energy: Energy.optional(),
  // media (auto-gallery)
  coverImage: image(),
  gallery: z.array(image()).default([]),
  floorPlans: z.array(FloorPlan).default([]),
  videoUrl: z.string().url().optional(),
  virtualTourUrl: z.string().url().optional(),
  brochure: z.string().optional(),               // PDF / EPC
  // seller / agent / org
  agent: reference('agents').optional(),
  agency: reference('agencies').optional(),
  office: reference('offices').optional(),       // branch
  // structure
  development: reference('developments').optional(),  // parent (price-range inheritance)
  units: z.array(z.object({                       // inline multi-unit
    title: z.string(), price: z.number().optional(),
    bedrooms: z.number().optional(), bathrooms: z.number().optional(),
    size: z.number().optional(), available: z.date().optional(),
  })).default([]),
  // meta
  publishedAt: z.date().optional(),
  expiresAt: z.date().optional(),
});
// NB: the long description is the Markdown body, not a frontmatter field.
```

Companion schemas: **agents** (name, photo, title, phone, email, whatsapp, socials,
bio, license, `agency`/`office` refs), **agencies** (name, logo, address, contact),
**offices** (branch name, address, phone, `agency` ref), and optional **developments**
(name, hero, location; price range derived from child listings at build time).

**Validation rules enforced:** price required unless `onRequest`; rent listings should
carry a `period`; lat/lng in range; `expiresAt` hides expired listings at build;
referenced agent/agency/office/development must exist (Astro validates refs); `custom`
allows arbitrary extra attributes without schema changes (WP-Property's flexibility).

---

## 7. Feature → astro implementation map

| Feature | Implementation |
|---|---|
| Schema & rules | Zod content-collection schemas over Markdown frontmatter |
| Auto galleries | `<Image>` responsive srcsets + `Lightbox` island (`client:visible`) |
| Location + map | `PropertyMap` (Leaflet island, single marker, respects `hideExact`) |
| All-listings map | `SuperMap` (Leaflet + `markercluster`) with live filter sidebar |
| Map search | `Leaflet.draw` (draw-a-search) + `leaflet-geosearch` (geocode/autocomplete) + radius |
| Single-property page | `PropertyLayout` + injected `properties/[...slug].astro` |
| Listing / archive | `ListingLayout`, generated from the collection; grid/list views |
| Site search | **Pagefind** full-text + facet filters (`data-pagefind-filter`), `data-pagefind-sort`; JSON index for numeric range (price/area) |
| Pricing schemes | `PriceBadge` reads the `Price` object (sale/rent/POA/"starting at"/PPPW) |
| Amenities | `AmenitiesList` maps strings → icon set |
| Energy/EPC | `EnergyGraph` from `energy.epcCurrent/Potential` |
| Calculators | `Calculators` islands: mortgage, stamp duty, rental yield, affordability |
| Favorites/compare | `CompareTray` island, localStorage (no backend) |
| Agent/agency/office | collections + `AgentCard` + `EnquiryForm` (POST to endpoint) |
| Labels incl. auto "Price Reduced" | `price-history.ts` compares prior value (git) → derived label |
| SEO | `StructuredData` emits `schema.org` `RealEstateListing`; sitemap via `@astrojs/sitemap` |
| Portal/MLS import (later) | custom content **loader** mapping XML feeds (Kyero, Rightmove BLM, REAXML) |
| Front-end submission / CRM (later) | SSR endpoints or external service; out of static core |

---

## 8. Phased roadmap

* **Phase 0 — Foundations:** monorepo (package + demo), TS strict, Astro 6, CSS tokens, seed data generator.
* **Phase 1 — Prototype (MVP):** schemas over frontmatter, collections, `PropertyCard`, listing page, single-property page, `Gallery`, `PropertyMap` (Leaflet), `PriceBadge`, `AmenitiesList`, `AgentCard`, ~12 seed listings. *(detailed in §9)*
* **Phase 2 — Search & discovery:** Pagefind full-text + facet filters, range sliders (JSON index), sort, pagination, `SuperMap` with clustering + draw-a-search + radius + location autocomplete.
* **Phase 3 — Rich detail:** floor plans, `EnergyGraph`, calculators (mortgage/stamp-duty/yield/affordability), similar listings, `EnquiryForm`, favorites/compare (localStorage), video & virtual tours.
* **Phase 4 — People & structure:** agent/agency/office pages, developments + parent-child price-range inheritance, location taxonomy + archives, comparison view, testimonials, featured slider.
* **Phase 5 — Polish:** structured data, sitemap, i18n, a11y, Lighthouse/perf budget, dark mode, local-area data (schools/transport/nearby).
* **Phase 6 — Data ingestion:** portal/MLS feed loaders (Kyero/Rightmove BLM/REAXML first), CMS adapter (Keystatic/Decap/Sanity), SSR front-end submission, saved-search alerts.
* **Phase 7 — Packaging & release:** integration route injection, theming docs, demo deploy, semver + npm publish with `astro-component`/`astro-integration` keywords.

---

## 9. Prototype task list (phase 0 + 1)

Outcome: a running demo where you browse listings, open one, and see gallery + map +
price + specs + amenities + agent, all validated by the schema.

**Setup**

* [ ] Init monorepo (pnpm workspaces): `packages/astro-properties` + `apps/demo`
* [ ] Scaffold demo `npm create astro@latest` (Astro 6, TypeScript strict)
* [ ] CSS-variable token sheet (no heavy framework); set package `keywords`

**Schema & data (frontmatter)**

* [ ] Implement `schema.ts` (property + agent + agency, enums, `Price`/`Energy` rules)
* [ ] Export `defineProperties()` with `glob` loaders on `**/*.md`
* [ ] Write ~12 seed listings as Markdown (mix of sale/rent/land/POA/PPPW) + 3 agents
* [ ] Add sample images; confirm `image()` validation + frontmatter parsing

**Core components**

* [ ] `PriceBadge` — sale, rent (+period incl. PPPW), POA, prefix/suffix labels
* [ ] `SpecsBar` — beds / baths / area with icons + unit formatting
* [ ] `AmenitiesList` — string→icon map with fallback
* [ ] `Gallery` — responsive `<Image>` grid; `Lightbox` island
* [ ] `PropertyMap` — Leaflet island via `map-providers.ts` (default OSM); `hideExact`
* [ ] `AgentCard` — resolve `reference`, contact links
* [ ] `PropertyCard` — cover, price, specs, label badges, link
* [ ] `StructuredData` — minimal `RealEstateListing` JSON-LD

**Pages / templates**

* [ ] `ListingLayout` + `properties/index.astro` — grid of all listings
* [ ] `PropertyLayout` + `properties/[...slug].astro` — full detail page
* [ ] Demo homepage featuring `featured: true` listings
* [ ] Add `data-pagefind-filter`/`data-pagefind-body` attributes now, so Phase 2 search is drop-in
* [ ] No-frills type/price/beds filter (pre-Pagefind) to prove the data model

**Validation & DX**

* [ ] Confirm Zod errors surface clearly for bad frontmatter (e.g. missing price)
* [ ] Verify types flow through `getCollection('properties')`
* [ ] README quickstart: install → register collections → add a route
* [ ] Deploy demo (Cloudflare Pages / Netlify) for a shareable preview

**Prototype done when:** browse → filter → open a listing → see gallery, map, price,
specs, amenities, and agent, with all data schema-validated.

---

## 10. Remaining open decisions

1. **Token vs Tailwind styling** — leaning unstyled + CSS tokens (most portable; matches the theme-agnostic lesson). Confirm.
2. **Units & currency** — global config default + per-listing override (recommended).
3. **Numeric range search** — Pagefind bucketed filters (coarse) vs. JSON index client-side (precise). Recommend JSON index for price/area, Pagefind for the rest.
4. **i18n timing** — keep field structure i18n-ready now; translation lands Phase 5.
5. **Where developments live** — separate `developments` collection (chosen) vs. inline `units[]` only. Keep both: inline for simple multi-unit, collection for real developments.

---

## 11. Suggested next step

Confirm styling (token vs Tailwind) and that Leaflet + Pagefind + frontmatter is the
agreed core, then I can generate working code for `schema.ts`, the `defineProperties()`
helper, `map-providers.ts`, and the first components (`PropertyCard`, `PriceBadge`,
`Gallery`, `PropertyMap`) to stand up the prototype.
