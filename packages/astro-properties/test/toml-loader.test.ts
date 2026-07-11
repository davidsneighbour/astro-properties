import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { tomlLoader } from "../src/lib/toml-loader.js";

let dir: string;

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), "toml-loader-test-"));
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

function fakeContext(overrides: Partial<Record<string, unknown>> = {}) {
  const data = new Map<string, unknown>();
  return {
    store: {
      clear: () => data.clear(),
      set: (entry: { id: string; data: unknown }) => {
        data.set(entry.id, entry.data);
        return true;
      },
      get: (id: string) => data.get(id),
      entries: () => Array.from(data.entries()),
      values: () => Array.from(data.values()),
      keys: () => Array.from(data.keys()),
      delete: (id: string) => data.delete(id),
      has: (id: string) => data.has(id),
      addModuleImport: () => {
        // not used by tomlLoader
      },
    },
    parseData: async ({ data: entryData }: { data: unknown }) => entryData,
    generateDigest: (value: unknown) => JSON.stringify(value),
    config: { root: pathToFileURL(`${dir}/`) },
    watcher: undefined,
    ...overrides,
  } as never;
}

describe("tomlLoader", () => {
  it("parses matching .toml files and stores each as an entry", async () => {
    await writeFile(
      join(dir, "jane.toml"),
      'name = "Jane Doe"\nemail = "jane@example.com"\n',
    );
    await writeFile(join(dir, "john.toml"), 'name = "John Smith"\n');

    const context = fakeContext();
    const loader = tomlLoader({ pattern: "**/*.toml" });
    await loader.load(context);

    const values = (
      context as { store: { values: () => unknown[] } }
    ).store.values();
    expect(values).toHaveLength(2);
    expect(values).toContainEqual({
      name: "Jane Doe",
      email: "jane@example.com",
    });
    expect(values).toContainEqual({ name: "John Smith" });
  });

  it("ignores files that don't match the pattern", async () => {
    await writeFile(join(dir, "jane.toml"), 'name = "Jane Doe"\n');
    await writeFile(join(dir, "notes.md"), "# not toml\n");

    const context = fakeContext();
    const loader = tomlLoader({ pattern: "**/*.toml" });
    await loader.load(context);

    const keys = (context as { store: { keys: () => string[] } }).store.keys();
    expect(keys).toEqual(["jane"]);
  });

  it("derives the entry id from the file path by default (strips .toml)", async () => {
    await writeFile(join(dir, "acme-realty.toml"), 'name = "Acme Realty"\n');

    const context = fakeContext();
    const loader = tomlLoader({ pattern: "**/*.toml" });
    await loader.load(context);

    const keys = (context as { store: { keys: () => string[] } }).store.keys();
    expect(keys).toEqual(["acme-realty"]);
  });

  it("supports a custom generateId function", async () => {
    await writeFile(join(dir, "acme-realty.toml"), 'name = "Acme Realty"\n');

    const context = fakeContext();
    const loader = tomlLoader({
      pattern: "**/*.toml",
      generateId: (filePath) => filePath.toUpperCase(),
    });
    await loader.load(context);

    const keys = (context as { store: { keys: () => string[] } }).store.keys();
    expect(keys).toEqual(["ACME-REALTY.TOML"]);
  });

  it("registers a file watcher and reloads on change/add/unlink events", async () => {
    await writeFile(join(dir, "jane.toml"), 'name = "Jane Doe"\n');

    const handlers: Record<string, (path: string) => void> = {};
    const watcher = {
      add: (_pattern: string) => {
        // no-op: watcher.add() call itself is not under test here
      },
      on: (event: string, handler: (path: string) => void) => {
        handlers[event] = handler;
      },
    };
    const context = fakeContext({ watcher });
    const loader = tomlLoader({ pattern: "**/*.toml" });
    await loader.load(context);

    expect(Object.keys(handlers)).toEqual(["change", "add", "unlink"]);

    await writeFile(join(dir, "john.toml"), 'name = "John Smith"\n');
    handlers["add"]?.(join(dir, "john.toml"));
    await new Promise((resolve) => setTimeout(resolve, 10));

    const keys = (context as { store: { keys: () => string[] } }).store.keys();
    expect(keys.sort()).toEqual(["jane", "john"]);
  });

  it("ignores watcher events for paths outside the base dir or non-.toml files", async () => {
    await writeFile(join(dir, "jane.toml"), 'name = "Jane Doe"\n');

    const handlers: Record<string, (path: string) => void> = {};
    const watcher = {
      add: (_pattern: string) => {
        // no-op: watcher.add() call itself is not under test here
      },
      on: (event: string, handler: (path: string) => void) => {
        handlers[event] = handler;
      },
    };
    const context = fakeContext({ watcher });
    const loader = tomlLoader({ pattern: "**/*.toml" });
    await loader.load(context);

    handlers["change"]?.("/some/unrelated/path.toml");
    handlers["change"]?.(join(dir, "jane.md"));
    await new Promise((resolve) => setTimeout(resolve, 10));

    const keys = (context as { store: { keys: () => string[] } }).store.keys();
    expect(keys).toEqual(["jane"]);
  });

  it("clears previously stored entries on reload", async () => {
    await writeFile(join(dir, "jane.toml"), 'name = "Jane Doe"\n');
    const context = fakeContext();
    const loader = tomlLoader({ pattern: "**/*.toml" });
    await loader.load(context);

    await rm(join(dir, "jane.toml"));
    await writeFile(join(dir, "john.toml"), 'name = "John Smith"\n');
    await loader.load(context);

    const keys = (context as { store: { keys: () => string[] } }).store.keys();
    expect(keys).toEqual(["john"]);
  });
});
