import {
  pgTable,
  text,
  timestamp,
  boolean,
  jsonb,
  pgEnum,
  uuid,
} from "drizzle-orm/pg-core";

// --- Enums ---

export const feedItemTypeEnum = pgEnum("feed_item_type", [
  "tweet",
  "link",
  "video",
  "paper",
  "book",
  "note",
]);

export const sourceKindEnum = pgEnum("source_kind", [
  "url",
  "tweet",
  "youtube",
  "paper",
  "book",
]);

// --- feed_items table ---

export const feedItems = pgTable("feed_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  type: feedItemTypeEnum("type").notNull(),
  summary: text("summary").notNull(),
  commentary: text("commentary"),
  content: text("content"),
  sourceKind: sourceKindEnum("source_kind"),
  sourceUrl: text("source_url"),
  sourceMeta: jsonb("source_meta"),
  topics: text("topics").array().notNull().default([]),
  people: text("people").array().notNull().default([]),
  hasPage: boolean("has_page").notNull().default(false),
  draft: boolean("draft").notNull().default(false),
  featured: boolean("featured").notNull().default(false),
  publishedAt: timestamp("published_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// --- people table ---

export const people = pgTable("people", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  handle: text("handle"),
  summary: text("summary").notNull(),
  whyIFollow: text("why_i_follow").notNull(),
  avatarUrl: text("avatar_url"),
  topics: text("topics").array().notNull().default([]),
  links: jsonb("links"),
  featured: boolean("featured").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// --- Inferred types ---

export type FeedItemRow = typeof feedItems.$inferSelect;
export type NewFeedItemRow = typeof feedItems.$inferInsert;
export type PersonRow = typeof people.$inferSelect;
export type NewPersonRow = typeof people.$inferInsert;
