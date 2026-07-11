import { getViteConfig } from "astro/config";

export default getViteConfig({
  test: {
    include: ["test/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/**/*.ts"],
      exclude: [
        "src/**/*.astro",
        "src/astro-modules.d.ts",
        "src/env.d.ts",
        // Depends on a live astro:content config from the consuming project;
        // exercised indirectly when the demo app builds, not unit-testable in isolation.
        "src/content-schema.ts",
      ],
      thresholds: {
        lines: 80,
        branches: 80,
        functions: 80,
        statements: 80,
      },
    },
  },
});
