import { z } from "astro/zod";

const personLinks = z.object({
  website: z.url().optional(),
  github: z.url().optional(),
  twitter: z.url().optional(),
  youtube: z.url().optional(),
  linkedin: z.url().optional(),
  newsletter: z.url().optional(),
});

export const personSchema = z.object({
  name: z.string().min(1),
  handle: z.string().optional(),
  summary: z.string().min(1),
  whyIFollow: z.string().min(1),
  url: z.url().optional(),
  avatar: z.string().optional(),
  topics: z.array(z.string()).default([]),
  links: personLinks.optional(),
  featured: z.boolean().default(false),
});

export type Person = z.infer<typeof personSchema>;
