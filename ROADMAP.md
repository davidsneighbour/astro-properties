# Roadmap

*Generated cache of the GitHub issue tracker. GitHub Issues are the source of truth — this file is a quick index, not where task detail lives. Regenerate with `/dnb-project-task-triage` (or ask Claude to run it) whenever issues change.*

## Project state

Phase 0 (Foundations) and Phase 1 (Prototype/MVP) are both complete except for one blocked item. 37 of 38 issues are closed. The monorepo builds, lints, typechecks, and tests green end to end (see health indicators below).

**Locked stack** (see `ASSUMPTIONS.md` for full rationale): Astro 7, Tailwind 4, `@astrojs/mdx`, `@astrojs/react` + shadcn/ui (React islands), Leaflet for maps, Pagefind for search (Phase 2), Zod schemas, MDX+YAML frontmatter for `properties`/`developments`, TOML for `agents`/`agencies`/`offices`/site config, npm workspaces monorepo (`packages/astro-properties` = publishable package, `apps/demo` = example site, both in this repo), `@dnbhq/{biome,tsconfig,markdownlint,renovate,release}-config`, TypeScript pinned to 6.0.3 (not 7.x — Astro tooling isn't there yet), Vitest with enforced coverage thresholds.

**Health indicators** (as of this update, run locally):

* Lint (`npm run lint`): passing
* Markdown lint (`npm run lint:markdown`): passing
* Typecheck (`npm run typecheck`): passing (`tsc --noEmit` for the package, `astro check` for the demo — 0 errors/warnings/hints)
* Tests (`npm run test:coverage`): 60/60 passing across `packages/astro-properties` and `apps/demo`; 100% statements/lines/functions, 96%+ branches (80% threshold)
* Build (`npm run build`): passing — demo builds 16 static pages including PropertyLayout/ListingLayout, Gallery/Lightbox, PropertyMap, StructuredData, and the archive filter

## Suggested order of work

### Phase 0 — foundations — all closed

[#1](https://github.com/davidsneighbour/astro-properties/issues/1) monorepo scaffold, [#2](https://github.com/davidsneighbour/astro-properties/issues/2) @dnbhq tooling, [#3](https://github.com/davidsneighbour/astro-properties/issues/3) Astro/Tailwind/MDX/React, [#4](https://github.com/davidsneighbour/astro-properties/issues/4) testing infra + CI, [#5](https://github.com/davidsneighbour/astro-properties/issues/5) release-config + publish workflow.

### Phase 1 — prototype / MVP — closed except #17

[#6](https://github.com/davidsneighbour/astro-properties/issues/6)–[#16](https://github.com/davidsneighbour/astro-properties/issues/16): Zod schemas, content collections, seed content, PriceBadge/SpecsBar/AmenitiesList, Gallery+Lightbox, PropertyMap, AgentCard+PropertyCard, StructuredData, ListingLayout+archive, PropertyLayout+detail page, demo homepage+filter — all closed.

| # | Issue | Status |
| --- | --- | --- |
| [17](https://github.com/davidsneighbour/astro-properties/issues/17) | Validation/DX pass + README + deploy | **Blocked** — README and Zod-error verification done; deploy step needs a human decision (Cloudflare Pages vs Netlify) and, if Netlify, connector authorization. See `TODO.md`. |

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

* **Deploy target for the demo site** (Cloudflare Pages vs Netlify) — unresolved, see `TODO.md`. Blocks #17 and is relevant to #36.
* **Default currency/area-unit** for site-wide config — currently assumed `USD`/`sqm` per the original research doc; confirm or override before real (non-seed) content is authored. See `ASSUMPTIONS.md`.

## Recommended next step

Issue [#17](https://github.com/davidsneighbour/astro-properties/issues/17)'s deploy step is stuck on a human decision (Cloudflare Pages vs Netlify) — not something to resolve by continuing to code. With all other Phase 1 work closed, the productive path is to start Phase 2: [#18](https://github.com/davidsneighbour/astro-properties/issues/18) (Pagefind full-text + facets) is the natural entry point since #19–21 build on it. `/dnb-work-on-next-issue` or `/dnb-work-through-issues` can pick this up.
