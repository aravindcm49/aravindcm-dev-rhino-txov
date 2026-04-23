import { z } from "astro/zod";

export const projectStatuses = ["done", "active", "paused", "archived"] as const;
export type ProjectStatus = (typeof projectStatuses)[number];

const projectLinks = z.object({
  demo: z.url().optional(),
  github: z.url().optional(),
  article: z.url().optional(),
  docs: z.url().optional(),
});

const projectImage = z.object({
  src: z.string(),
  alt: z.string(),
  kind: z.enum(["cover", "screenshot", "diagram"]).optional(),
});

const projectReadme = z.object({
  source: z.enum(["local", "github"]),
  githubRepo: z.string().optional(),
  localPath: z.string().optional(),
  syncedAt: z.coerce.date().optional(),
});

export const projectSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  commentary: z.string().optional(),
  startedAt: z.coerce.date().optional(),
  completedAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  activityAt: z.coerce.date().optional(),
  topics: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  draft: z.boolean().default(false),
  status: z.enum(projectStatuses),
  links: projectLinks.default({}),
  images: z.array(projectImage).optional(),
  readme: projectReadme.optional(),
  slug: z.string().optional(),
});

export type Project = z.infer<typeof projectSchema>;
