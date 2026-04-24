import { eq, desc } from "drizzle-orm";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { feedItems, type FeedItemRow, type NewFeedItemRow } from "./schema";

export type Db = NeonHttpDatabase<Record<string, unknown>>;

// --- Read ---

export async function getAllFeedItems(db: Db): Promise<FeedItemRow[]> {
  return db.select().from(feedItems).orderBy(desc(feedItems.publishedAt));
}

export async function getFeedItemBySlug(
  db: Db,
  slug: string,
): Promise<FeedItemRow | undefined> {
  const rows = await db
    .select()
    .from(feedItems)
    .where(eq(feedItems.slug, slug))
    .limit(1);
  return rows[0];
}

export async function getPublishedFeedItems(
  db: Db,
): Promise<FeedItemRow[]> {
  return db
    .select()
    .from(feedItems)
    .where(eq(feedItems.draft, false))
    .orderBy(desc(feedItems.publishedAt));
}

// --- Create ---

export async function createFeedItem(
  db: Db,
  item: NewFeedItemRow,
): Promise<FeedItemRow> {
  const rows = await db.insert(feedItems).values(item).returning();
  return rows[0];
}

// --- Update ---

export async function updateFeedItem(
  db: Db,
  slug: string,
  updates: Partial<NewFeedItemRow>,
): Promise<FeedItemRow | undefined> {
  const rows = await db
    .update(feedItems)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(feedItems.slug, slug))
    .returning();
  return rows[0];
}

// --- Delete ---

export async function deleteFeedItem(
  db: Db,
  slug: string,
): Promise<boolean> {
  const rows = await db
    .delete(feedItems)
    .where(eq(feedItems.slug, slug))
    .returning();
  return rows.length > 0;
}
