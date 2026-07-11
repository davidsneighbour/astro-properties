import { readFile } from "node:fs/promises";
import { relative } from "node:path";
import { fileURLToPath } from "node:url";
import type { Loader, LoaderContext } from "astro/loaders";
import fg from "fast-glob";
import { parse } from "smol-toml";

export interface TomlLoaderOptions {
  /** Glob pattern(s) matching `.toml` files, relative to `base`. */
  pattern: string | string[];
  /** Base directory to resolve `pattern` from. Relative to the project root, or an absolute file URL. Defaults to `.`. */
  base?: string;
  /** Derives the entry id from its file path. Defaults to the path without the `.toml` extension. */
  generateId?: (filePath: string) => string;
}

async function loadEntries(
  { pattern, base = ".", generateId }: TomlLoaderOptions,
  { store, parseData, generateDigest, config }: LoaderContext,
): Promise<void> {
  const baseDir = new URL(base.endsWith("/") ? base : `${base}/`, config.root);
  const baseDirPath = fileURLToPath(baseDir);
  const entries = await fg(pattern, { cwd: baseDirPath });

  store.clear();

  const rootPath = fileURLToPath(config.root);

  for (const entry of entries) {
    const filePath = new URL(entry, baseDir);
    const raw = await readFile(filePath, "utf-8");
    const data = parse(raw) as Record<string, unknown>;
    const id = generateId ? generateId(entry) : entry.replace(/\.toml$/, "");
    const relativeFilePath = relative(rootPath, fileURLToPath(filePath));
    const parsed = await parseData({ id, data, filePath: relativeFilePath });
    const digest = generateDigest(parsed);
    store.set({ id, data: parsed, digest, filePath: relativeFilePath });
  }
}

/**
 * A content-collection loader for TOML data files (agents/agencies/offices/site
 * config), since Astro's built-in `glob()` loader only parses YAML/JSON/Markdown/MDX
 * frontmatter out of the box.
 */
export function tomlLoader(options: TomlLoaderOptions): Loader {
  return {
    name: "toml-loader",
    load: async (context) => {
      await loadEntries(options, context);

      if (context.watcher) {
        const base = options.base ?? ".";
        const baseDir = new URL(
          base.endsWith("/") ? base : `${base}/`,
          context.config.root,
        );
        const baseDirPath = fileURLToPath(baseDir);
        const handleChange = (changedPath: string) => {
          if (
            changedPath.startsWith(baseDirPath) &&
            changedPath.endsWith(".toml")
          ) {
            void loadEntries(options, context);
          }
        };
        context.watcher.add(`${baseDirPath}**/*.toml`);
        context.watcher.on("change", handleChange);
        context.watcher.on("add", handleChange);
        context.watcher.on("unlink", handleChange);
      }
    },
  };
}
