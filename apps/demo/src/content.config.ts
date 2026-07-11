import { defineCollection } from "astro:content";
import { definePropertySchema } from "@davidsneighbour/astro-properties/content-schema";
import { tomlLoader } from "@davidsneighbour/astro-properties/lib/toml-loader.js";
import {
  agencySchema,
  agentSchema,
  officeSchema,
} from "@davidsneighbour/astro-properties/schema";
import { glob } from "astro/loaders";

const properties = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/properties" }),
  schema: definePropertySchema,
});

const agents = defineCollection({
  loader: tomlLoader({ pattern: "**/*.toml", base: "./src/content/agents" }),
  schema: agentSchema,
});

const agencies = defineCollection({
  loader: tomlLoader({ pattern: "**/*.toml", base: "./src/content/agencies" }),
  schema: agencySchema,
});

const offices = defineCollection({
  loader: tomlLoader({ pattern: "**/*.toml", base: "./src/content/offices" }),
  schema: officeSchema,
});

export const collections = { properties, agents, agencies, offices };
