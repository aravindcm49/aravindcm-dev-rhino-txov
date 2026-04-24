import type { FeedItem } from "../schemas/feed";
import type { PersonLike } from "./feed";
import { describeSource, resolvePeople } from "./feed";

/**
 * Shape returned by `prepareFeedPage` — everything the detail page template needs.
 */
export interface FeedPageData {
  title: string;
  summary: string;
  commentary?: string;
  publishedAt: Date;
  updatedAt?: Date;
  type: FeedItem["type"];
  topics: string[];
  source: ReturnType<typeof describeSource>;
  people: PersonLike[];
  slug: string;
}

/**
 * Narrow shape the helper needs from a content-layer entry.
 * Keeping this narrow makes testing easy — no need for full CollectionEntry.
 */
export interface FeedEntryLike {
  id: string;
  data: FeedItem;
}

/**
 * Returns `true` when a feed entry should generate a detail page:
 * - `hasPage` is true
 * - `draft` is false (or absent, since the schema defaults it to false)
 */
export function isPageable(entry: FeedEntryLike): boolean {
  return entry.data.hasPage === true && entry.data.draft !== true;
}

/**
 * Prepares all data the detail page template needs from a feed entry
 * and the people collection.
 */
export function prepareFeedPage(
  entry: FeedEntryLike,
  peoplePool: PersonLike[]
): FeedPageData {
  const { data } = entry;
  return {
    title: data.title,
    summary: data.summary,
    commentary: data.commentary,
    publishedAt: data.publishedAt,
    updatedAt: data.updatedAt,
    type: data.type,
    topics: data.topics ?? [],
    source: describeSource(data.source),
    people: resolvePeople(data.people, peoplePool),
    slug: data.slug ?? entry.id,
  };
}
