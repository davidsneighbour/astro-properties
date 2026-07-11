# Astro properties

A reusable Astro theme/integration for property-sales sites — schemas, components,
layouts, and search for listings, galleries, maps, and agent pages — developed
alongside a working example site in the same repository.

* [`packages/astro-properties`](packages/astro-properties) — the publishable npm
  package (`@davidsneighbour/astro-properties`)
* [`apps/demo`](apps/demo) — an example Astro site consuming the package

## Project tracking

* [`ROADMAP.md`](ROADMAP.md) — generated index of open GitHub issues, grouped by phase
* [`TODO.md`](TODO.md) — scratchpad for notes not yet ready to become issues
* [`ASSUMPTIONS.md`](ASSUMPTIONS.md) — decisions and assumptions made while building
  this, split into locked architecture and easily-changed settings
* [`astro-properties-roadmap.md`](astro-properties-roadmap.md) — the original research
  document this project is based on (superseded by the files above as the working plan)

GitHub Issues are the source of truth for tasks; see the repository's
[issue tracker](https://github.com/davidsneighbour/astro-properties/issues).

## Development

This is an npm workspaces monorepo.

```bash
npm install
npm run dev            # starts the demo site
npm run lint            # biome check
npm run lint:markdown    # markdownlint-cli2
npm run typecheck       # tsc (package) + astro check (demo)
npm run test:coverage   # vitest, both workspaces
npm run build           # astro build (demo)
```

## License

MIT
