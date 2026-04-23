import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { feedItemSchema } from "./schemas/feed";
import { projectSchema } from "./schemas/project";
import { personSchema } from "./schemas/person";

const feed = defineCollection({
  loader: glob({ base: "./src/content/feed", pattern: "**/*.{md,mdx}" }),
  schema: feedItemSchema,
});

const projects = defineCollection({
  loader: glob({ base: "./src/content/projects", pattern: "**/*.{md,mdx}" }),
  schema: projectSchema,
});

const people = defineCollection({
  loader: glob({ base: "./src/content/people", pattern: "**/*.{md,mdx}" }),
  schema: personSchema,
});

export const collections = { feed, projects, people };
