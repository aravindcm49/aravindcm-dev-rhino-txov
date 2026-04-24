import { z } from "astro/zod";

export const pageSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
});

export type Page = z.infer<typeof pageSchema>;
