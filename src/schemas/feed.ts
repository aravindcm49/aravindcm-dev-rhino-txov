import { z } from "astro/zod";

export const feedItemTypes = [
  "essay",
  "note",
  "link",
  "tweet",
  "video",
  "paper",
  "book",
] as const;

export type FeedItemType = (typeof feedItemTypes)[number];

const sourceUrl = z.object({
  kind: z.literal("url"),
  url: z.url(),
  siteName: z.string().optional(),
  author: z.string().optional(),
});

const sourceTweet = z.object({
  kind: z.literal("tweet"),
  url: z.url(),
  tweetId: z.string().optional(),
  authorHandle: z.string().optional(),
});

const sourceYoutube = z.object({
  kind: z.literal("youtube"),
  url: z.url(),
  videoId: z.string().optional(),
  channel: z.string().optional(),
});

const sourcePaper = z.object({
  kind: z.literal("paper"),
  url: z.url(),
  doi: z.string().optional(),
  arxivId: z.string().optional(),
  authors: z.array(z.string()).optional(),
});

const sourceBook = z.object({
  kind: z.literal("book"),
  isbn: z.string().optional(),
  author: z.string().optional(),
  url: z.url().optional(),
});

export const sourceSchema = z.discriminatedUnion("kind", [
  sourceUrl,
  sourceTweet,
  sourceYoutube,
  sourcePaper,
  sourceBook,
]);

export type Source = z.infer<typeof sourceSchema>;

// Maps each feed item type to the required source.kind (or null = source optional).
// Drives the cross-field validation in the superRefine below: e.g. a `link` item
// without a source, or a `video` item with a tweet source, must fail validation.
const typeToRequiredSourceKind: Record<FeedItemType, Source["kind"] | null> = {
  essay: null,
  note: null,
  link: "url",
  tweet: "tweet",
  video: "youtube",
  paper: "paper",
  book: "book",
};

const baseFeedItem = z.object({
  title: z.string().min(1),
  type: z.enum(feedItemTypes),
  summary: z.string().min(1),
  commentary: z.string().optional(),
  publishedAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
  activityAt: z.coerce.date().optional(),
  topics: z.array(z.string()).default([]),
  people: z.array(z.string()).optional(),
  source: sourceSchema.optional(),
  hasPage: z.boolean(),
  draft: z.boolean().default(false),
  featured: z.boolean().default(false),
  slug: z.string().optional(),
});

export const feedItemSchema = baseFeedItem.superRefine((data, ctx) => {
  const requiredKind = typeToRequiredSourceKind[data.type];
  if (requiredKind === null) return;
  if (!data.source) {
    ctx.addIssue({
      code: "custom",
      message: `Feed item of type "${data.type}" must have a source`,
      path: ["source"],
    });
    return;
  }
  if (data.source.kind !== requiredKind) {
    ctx.addIssue({
      code: "custom",
      message: `Feed item of type "${data.type}" must have source.kind = "${requiredKind}", got "${data.source.kind}"`,
      path: ["source", "kind"],
    });
  }
});

export type FeedItem = z.infer<typeof feedItemSchema>;
