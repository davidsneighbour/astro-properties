# Roadmap

_Generated cache of the GitHub issue tracker. GitHub Issues are the source of truth — this file is a quick index, not where task detail lives. Regenerate with `/dnb-project-task-triage` (or ask Claude to run it) whenever issues change._

## Project state

Pre-code. The repo currently has only `LICENSE`, `README.md`, this file, `TODO.md`, and the original research doc `astro-properties-roadmap.md`. All planning has been converted into **36 open GitHub issues** across **8 milestones**, derived from the research doc's §8 phased roadmap and §9 prototype task list, adjusted for the locked stack below.

**Locked stack** (see `ASSUMPTIONS.md` for full rationale): Astro 7, Tailwind 4, `@astrojs/mdx`, `@astrojs/react` + shadcn/ui (React islands), Leaflet for maps, Pagefind for search, Zod schemas, MDX+YAML frontmatter for `properties`/`developments`, TOML for `agents`/`agencies`/`offices`/site config, npm workspaces monorepo (`packages/astro-properties` = publishable package, `apps/demo` = example site, both in this repo), `@dnbhq/{biome,tsconfig,markdownlint,renovate,release}-config`, Vitest with enforced coverage thresholds.

**Health indicators:** not yet available — no code, no CI, no test suite exists yet. First health indicators will land with issue #4 (CI workflow) and #2 (lint/typecheck wiring).

## Suggested order of work

Milestones are meant to be worked roughly in order; within Phase 0 and Phase 1, follow the issue numbers — later issues depend on earlier ones.

### Phase 0 — Foundations (blocks everything)

| # | Issue | Notes |
|---|---|---|
| [1](https://github.com/davidsneighbour/astro-properties/issues/1) | Scaffold npm workspaces monorepo structure | Do first. Nothing else can start until `packages/astro-properties` + `apps/demo` exist. |
| [2](https://github.com/davidsneighbour/astro-properties/issues/2) | Wire up @dnbhq shared tooling | Depends on #1. |
| [3](https://github.com/davidsneighbour/astro-properties/issues/3) | Configure Astro 7 + Tailwind 4 + MDX + React | Depends on #1, #2. Unlocks all UI work. |
| [4](https://github.com/davidsneighbour/astro-properties/issues/4) | Testing infrastructure (Vitest, coverage, Container API, CI) | Depends on #1, #3. Every later issue's acceptance criteria assumes this exists. |
| [5](https://github.com/davidsneighbour/astro-properties/issues/5) | @dnbhq/release-config + publish workflow | Depends on #1, #2. Not urgent — can trail Phase 1 if needed. |

### Phase 1 — Prototype / MVP

| # | Issue | Notes |
|---|---|---|
| [6](https://github.com/davidsneighbour/astro-properties/issues/6) | Zod schemas (property/agent/agency/office) | Foundation for everything content-related. |
| [7](https://github.com/davidsneighbour/astro-properties/issues/7) | Content collections config (MDX + TOML loaders) | Depends on #6. |
| [8](https://github.com/davidsneighbour/astro-properties/issues/8) | Seed content (~12 listings + agents/agencies + images) | Depends on #7. Needed by nearly every component/page issue below. |
| [9](https://github.com/davidsneighbour/astro-properties/issues/9) | PriceBadge, SpecsBar, AmenitiesList | Depends on #6. |
| [10](https://github.com/davidsneighbour/astro-properties/issues/10) | Gallery + Lightbox | Depends on #6, #8. |
| [11](https://github.com/davidsneighbour/astro-properties/issues/11) | PropertyMap + map-providers.ts | Depends on #6. |
| [12](https://github.com/davidsneighbour/astro-properties/issues/12) | AgentCard + PropertyCard | Depends on #6, #9. |
| [13](https://github.com/davidsneighbour/astro-properties/issues/13) | StructuredData (JSON-LD) | Depends on #6, #8. |
| [14](https://github.com/davidsneighbour/astro-properties/issues/14) | ListingLayout + archive page | Depends on #8, #9, #12. |
| [15](https://github.com/davidsneighbour/astro-properties/issues/15) | PropertyLayout + detail page | Depends on #8–#13. |
| [16](https://github.com/davidsneighbour/astro-properties/issues/16) | Demo homepage + pre-Pagefind filter | Depends on #8, #14. |
| [17](https://github.com/davidsneighbour/astro-properties/issues/17) | Validation/DX pass + README + deploy demo | Depends on all of #6–#16. **Prototype-done marker.** |

### Phase 2 — Search & discovery

[18](https://github.com/davidsneighbour/astro-properties/issues/18) Pagefind full-text + facets → [19](https://github.com/davidsneighbour/astro-properties/issues/19) JSON index for numeric ranges → [20](https://github.com/davidsneighbour/astro-properties/issues/20) Pagination → [21](https://github.com/davidsneighbour/astro-properties/issues/21) SuperMap (clustering/draw-search/radius/autocomplete)

### Phase 3 — Rich detail

[22](https://github.com/davidsneighbour/astro-properties/issues/22) FloorPlans + EnergyGraph, [23](https://github.com/davidsneighbour/astro-properties/issues/23) Calculators, [24](https://github.com/davidsneighbour/astro-properties/issues/24) EnquiryForm + similar listings + video/tour embeds, [25](https://github.com/davidsneighbour/astro-properties/issues/25) CompareTray (favorites)

### Phase 4 — People & structure

[26](https://github.com/davidsneighbour/astro-properties/issues/26) Agent/agency/office pages, [27](https://github.com/davidsneighbour/astro-properties/issues/27) Developments + price-range inheritance, [28](https://github.com/davidsneighbour/astro-properties/issues/28) Location taxonomy + comparison view, [29](https://github.com/davidsneighbour/astro-properties/issues/29) Testimonials + FeaturedSlider

### Phase 5 — Polish

[30](https://github.com/davidsneighbour/astro-properties/issues/30) Structured data + sitemap + i18n groundwork, [31](https://github.com/davidsneighbour/astro-properties/issues/31) Accessibility + performance pass (run after Phase 1–4 UI exists), [32](https://github.com/davidsneighbour/astro-properties/issues/32) Dark mode + local-area data

### Phase 6 — Data ingestion

[33](https://github.com/davidsneighbour/astro-properties/issues/33) Portal/MLS feed loaders + CMS adapter, [34](https://github.com/davidsneighbour/astro-properties/issues/34) SSR submission + saved-search alerts

### Phase 7 — Packaging & release

[35](https://github.com/davidsneighbour/astro-properties/issues/35) Integration polish (injectRoute + theming docs), [36](https://github.com/davidsneighbour/astro-properties/issues/36) Final npm publish readiness

## Open clarification questions

- **Deploy target for the demo site** (Cloudflare Pages vs Netlify) — unresolved, see `TODO.md`. Relevant to issues #17 and #36.
- **Default currency/area-unit** for site-wide config — currently assumed `USD`/`sqm` per the original research doc; confirm or override before real (non-seed) content is authored. See `ASSUMPTIONS.md`.

## Recommended next step

Start issue [#1](https://github.com/davidsneighbour/astro-properties/issues/1) (monorepo scaffold), then work Phase 0 in order (#1 → #2 → #3 → #4, with #5 any time after #2). Phase 0 unlocks all of Phase 1, which ends at the "prototype done" milestone in #17.
