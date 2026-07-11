# TODO

Scratchpad only. Anything actionable lives in GitHub Issues (see `ROADMAP.md` for the index). This file holds notes that aren't clear/ready enough to be an issue yet.

- **Deploy target for the demo site**: Cloudflare Pages vs Netlify. The Netlify MCP connector isn't authorized in this environment yet, so it couldn't be used to set anything up. Decide before issue #17 (deploy demo preview) is worked, or authorize Netlify and we'll use that.
- **Original research doc** (`astro-properties-roadmap.md`): now superseded by this file, `ROADMAP.md`, `ASSUMPTIONS.md`, and the 36 GitHub issues. Consider moving it to `docs/research.md` or deleting it once the team is confident nothing further needs mining from it — kept as-is for now since it has useful background research (Houzez/EPL/Property Hive/WP-Property feature comparisons) not fully duplicated elsewhere.
- **shadcn style variant** ("New York" vs "Default") and exact color palette for the demo theme — cosmetic, not decided. Pick during issue #3 (Astro/Tailwind/MDX/React setup).
- **Real-world target market for seed content** (currency, area unit, region) — seed data currently defaults to generic USD/sqm/mixed countries per the research doc. If there's an actual target market (e.g. Thailand, UK, US) for the demo, seed data in issue #8 should reflect it instead of being generic.
