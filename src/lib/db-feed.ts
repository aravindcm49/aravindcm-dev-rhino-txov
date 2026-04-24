/**
 * Feed merge logic — combines MDX content collection items with database
 * feed items into one unified list sorted by publishedAt descending.
 */

import type { FeedItem, FeedItemType } from "../schemas/feed";
import type { Source } from "../schemas/feed";
import type { FeedItemRow } from "./db/schema";

// --- Normalization ---

/**
 * Maps DB source_kind + source_meta to the Source discriminated union shape.
 */
function normalizeSource(row: FeedItemRow): Source | undefined {
  if (!row.sourceKind || !row.sourceUrl) return undefined;
  const meta = (row.sourceMeta ?? {}) as Record<string, unknown>;

  switch (row.sourceKind) {
    case "url":
      return {
        kind: "url",
        url: row.sourceUrl,
        siteName: typeof meta.siteName === "string" ? meta.siteName : undefined,
        author: typeof meta.author === "string" ? meta.author : undefined,
      };
    case "tweet":
      return {
        kind: "tweet",
        url: row.sourceUrl,
        authorHandle: typeof meta.authorHandle === "string" ? meta.authorHandle : undefined,
      };
    case "youtube":
      return {
        kind: "youtube",
        url: row.sourceUrl,
        videoId: typeof meta.videoId === "string" ? meta.videoId : undefined,
        channel: typeof meta.channel === "string" ? meta.channel : undefined,
      };
    case "paper":
      return {
        kind: "paper",
        url: row.sourceUrl,
        doi: typeof meta.doi === "string" ? meta.doi : undefined,
        arxivId: typeof meta.arxivId === "string" ? meta.arxivId : undefined,
        authors: Array.isArray(meta.authors) ? (meta.authors as string[]) : undefined,
      };
    case "book":
      return {
        kind: "book",
        url: row.sourceUrl,
        isbn: typeof meta.isbn === "string" ? meta.isbn : undefined,
        author: typeof meta.author === "string" ? meta.author : undefined,
      };
  }
}

/**
 * Maps DB feed_item_type enum to the FeedItemType string.
 */
function normalizeType(dbType: FeedItemRow["type"]): FeedItemType {
  // DB enum values match the schema exactly
  return dbType as FeedItemType;
}

/**
 * Normalizes a DB row to the FeedItem shape used by the content layer.
 */
export function normalizeDbItem(row: FeedItemRow): FeedItem & { slug: string } {
  return {
    title: row.title,
    type: normalizeType(row.type),
    summary: row.summary,
    commentary: row.commentary ?? undefined,
    publishedAt: new Date(row.publishedAt),
    updatedAt: row.updatedAt ? new Date(row.updatedAt) : undefined,
    topics: row.topics ?? [],
    people: row.people ?? [],
    source: normalizeSource(row),
    hasPage: row.hasPage,
    draft: row.draft,
    featured: row.featured,
    slug: row.slug,
  };
}

// --- Merge ---

/**
 * Normalized feed item ready for listing (dates as ISO strings for JSON serialization).
 */
export interface NormalizedFeedItem {
  id: string;
  title: string;
  summary: string;
  commentary?: string;
  type: FeedItemType;
  topics: string[];
  people?: string[];
  source?: Source;
  publishedAt: string;
  activityAt?: string;
  hasPage: boolean;
  draft: boolean;
  featured: boolean;
  slug: string;
  /** "mdx" or "db" — indicates the source */
  origin: "mdx" | "db";
}

/**
 * Interface for MDX content collection entries (narrow shape for testability).
 */
export interface MdxFeedEntry {
  id: string;
  data: FeedItem;
}

/**
 * Merges MDX and DB feed items into one unified list.
 *
 * Rules:
 * - MDX items take precedence when slugs collide
 * - Sorted by publishedAt descending (newest first)
 * - Draft items from DB are excluded
 */
export function mergeFeedItems(
  mdxEntries: MdxFeedEntry[],
  dbRows: FeedItemRow[],
): NormalizedFeedItem[] {
  const mdxItems: NormalizedFeedItem[] = mdxEntries
    .filter((e) => !e.data.draft)
    .map((e) => ({
      id: e.data.slug ?? e.id,
      title: e.data.title,
      summary: e.data.summary,
      commentary: e.data.commentary,
      type: e.data.type,
      topics: e.data.topics ?? [],
      people: e.data.people,
      source: e.data.source,
      publishedAt: e.data.publishedAt.toISOString(),
      activityAt: e.data.activityAt?.toISOString(),
      hasPage: e.data.hasPage,
      draft: e.data.draft ?? false,
      featured: e.data.featured ?? false,
      slug: e.data.slug ?? e.id,
      origin: "mdx" as const,
    }));

  const dbItems: NormalizedFeedItem[] = dbRows
    .filter((r) => !r.draft)
    .map((r) => {
      const normalized = normalizeDbItem(r);
      return {
        id: r.slug,
        title: normalized.title,
        summary: normalized.summary,
        commentary: normalized.commentary,
        type: normalized.type,
        topics: normalized.topics,
        people: normalized.people,
        source: normalized.source,
    publishedAt: new Date(normalized.publishedAt).toISOString(),
        hasPage: normalized.hasPage,
        draft: normalized.draft,
        featured: normalized.featured,
        slug: r.slug,
        origin: "db" as const,
      };
    });

  // Deduplicate: MDX wins when slugs collide
  const seenSlugs = new Set(mdxItems.map((i) => i.slug));
  const uniqueDbItems = dbItems.filter((i) => !seenSlugs.has(i.slug));

  // Merge and sort by publishedAt descending
  return [...mdxItems, ...uniqueDbItems].sort(
    (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
  );
}
