# Roadmap

*Generated cache of the GitHub issue tracker. GitHub Issues are the source of truth — this file is a quick index, not where task detail lives. Regenerate with `/dnb-project-task-triage` (or ask Claude to run it) whenever issues change.*

## Project state

Phase 0 (Foundations) is complete and Phase 1 (Prototype/MVP) is underway. The monorepo builds, lints, typechecks, and tests green end to end (see health indicators below). 8 of 36 issues are closed; several Phase 1 issues have partial progress noted in comments.

**Locked stack** (see `ASSUMPTIONS.md` for full rationale): Astro 7, Tailwind 4, `@astrojs/mdx`, `@astrojs/react` + shadcn/ui (React islands), Leaflet for maps, Pagefind for search (Phase 2), Zod schemas, MDX+YAML frontmatter for `properties`/`developments`, TOML for `agents`/`agencies`/`offices`/site config, npm workspaces monorepo (`packages/astro-properties` = publishable package, `apps/demo` = example site, both in this repo), `@dnbhq/{biome,tsconfig,markdownlint,renovate,release}-config`, TypeScript pinned to 6.0.3 (not 7.x — Astro tooling isn't there yet), Vitest with enforced coverage thresholds.

**Health indicators** (as of this update, run locally — no CI run yet since nothing is committed):

* Lint (`npm run lint`): passing
* Markdown lint (`npm run lint:markdown`): passing
* Typecheck (`npm run typecheck`): passing (`tsc --noEmit` for the package, `astro check` for the demo)
* Tests (`npm run test:coverage`): 49/49 passing in `packages/astro-properties` (100% statements/lines, 93% branches, 80% threshold), 2/2 passing in `apps/demo` (100% statements/lines, 80% branches)
* Build (`npm run build`): passing — demo builds 5 static pages including one React/shadcn island

## Suggested order of work

### Phase 0 — foundations — all closed

[#1](https://github.com/davidsneighbour/astro-properties/issues/1) monorepo scaffold, [#2](https://github.com/davidsneighbour/astro-properties/issues/2) @dnbhq tooling, [#3](https://github.com/davidsneighbour/astro-properties/issues/3) Astro/Tailwind/MDX/React, [#4](https://github.com/davidsneighbour/astro-properties/issues/4) testing infra + CI, [#5](https://github.com/davidsneighbour/astro-properties/issues/5) release-config + publish workflow.

### Phase 1 — prototype / MVP

| # | Issue | Status |
| --- | --- | --- |
| [6](https://github.com/davidsneighbour/astro-properties/issues/6) | Zod schemas | Closed |
| [7](https://github.com/davidsneighbour/astro-properties/issues/7) | Content collections (MDX + TOML loaders) | Closed |
| [8](https://github.com/davidsneighbour/astro-properties/issues/8) | Seed content (~12 listings) | Partial — 4/~12 listings + agents/agency/office done, see issue comment |
| [9](https://github.com/davidsneighbour/astro-properties/issues/9) | PriceBadge, SpecsBar, AmenitiesList | Closed |
| [10](https://github.com/davidsneighbour/astro-properties/issues/10) | Gallery + Lightbox | Not started |
| [11](https://github.com/davidsneighbour/astro-properties/issues/11) | PropertyMap + map-providers.ts | Partial — map-providers.ts done, PropertyMap.astro not started |
| [12](https://github.com/davidsneighbour/astro-properties/issues/12) | AgentCard + PropertyCard | Partial — PropertyCard done, AgentCard not started |
| [13](https://github.com/davidsneighbour/astro-properties/issues/13) | StructuredData (JSON-LD) | Not started |
| [14](https://github.com/davidsneighbour/astro-properties/issues/14) | ListingLayout + archive page | Partial — homepage listing exists, no dedicated layout/archive route yet |
| [15](https://github.com/davidsneighbour/astro-properties/issues/15) | PropertyLayout + detail page | Partial — minimal detail page exists, no PropertyLayout/Gallery/Map/AgentCard yet |
| [16](https://github.com/davidsneighbour/astro-properties/issues/16) | Demo homepage + pre-Pagefind filter | Partial — featured section done, filter not started |
| [17](https://github.com/davidsneighbour/astro-properties/issues/17) | Validation/DX pass + README + deploy | Partial — README done, deploy blocked on TODO.md decision |

### Phase 2 — search & discovery

[18](https://github.com/davidsneighbour/astro-properties/issues/18) Pagefind full-text + facets → [19](https://github.com/davidsneighbour/astro-properties/issues/19) JSON index for numeric ranges → [20](https://github.com/davidsneighbour/astro-properties/issues/20) Pagination → [21](https://github.com/davidsneighbour/astro-properties/issues/21) SuperMap (clustering/draw-search/radius/autocomplete)

### Phase 3 — rich detail

[22](https://github.com/davidsneighbour/astro-properties/issues/22) FloorPlans + EnergyGraph, [23](https://github.com/davidsneighbour/astro-properties/issues/23) Calculators, [24](https://github.com/davidsneighbour/astro-properties/issues/24) EnquiryForm + similar listings + video/tour embeds, [25](https://github.com/davidsneighbour/astro-properties/issues/25) CompareTray (favorites)

### Phase 4 — people & structure

[26](https://github.com/davidsneighbour/astro-properties/issues/26) Agent/agency/office pages, [27](https://github.com/davidsneighbour/astro-properties/issues/27) Developments + price-range inheritance, [28](https://github.com/davidsneighbour/astro-properties/issues/28) Location taxonomy + comparison view, [29](https://github.com/davidsneighbour/astro-properties/issues/29) Testimonials + FeaturedSlider

### Phase 5 — polish

[30](https://github.com/davidsneighbour/astro-properties/issues/30) Structured data + sitemap + i18n groundwork, [31](https://github.com/davidsneighbour/astro-properties/issues/31) Accessibility + performance pass (run after Phase 1–4 UI exists), [32](https://github.com/davidsneighbour/astro-properties/issues/32) Dark mode + local-area data

### Phase 6 — data ingestion

[33](https://github.com/davidsneighbour/astro-properties/issues/33) Portal/MLS feed loaders + CMS adapter, [34](https://github.com/davidsneighbour/astro-properties/issues/34) SSR submission + saved-search alerts

### Phase 7 — packaging & release

[35](https://github.com/davidsneighbour/astro-properties/issues/35) Integration polish (injectRoute + theming docs), [36](https://github.com/davidsneighbour/astro-properties/issues/36) Final npm publish readiness

## Open clarification questions

* **Deploy target for the demo site** (Cloudflare Pages vs Netlify) — unresolved, see `TODO.md`. Relevant to issues #17 and #36.
* **Default currency/area-unit** for site-wide config — currently assumed `USD`/`sqm` per the original research doc; confirm or override before real (non-seed) content is authored. See `ASSUMPTIONS.md`.

## Recommended next step

Pick up any of the partially-done Phase 1 issues (#8, #11, #12, #14, #15, #16, #17) — each has a progress comment describing exactly what's left. #10 (Gallery/Lightbox) and #13 (StructuredData) haven't been started at all. `/dnb-work-on-next-issue` or `/dnb-work-through-issues` can pick these up one at a time.
