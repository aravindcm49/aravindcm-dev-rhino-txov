import type { FeedItemType, Source } from "../schemas/feed";

// Narrow shape the filter needs, serializable across the Astro → React island
// boundary. Dates arrive as ISO strings because JSON can't carry Date objects.
export interface FeedItemLike {
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
}

export type FeedSort = "publishedAt" | "activityAt";

export interface FeedFilterParams {
  q?: string;
  type?: string[];
  topic?: string[];
  person?: string[];
  source?: string[];
  sort?: FeedSort;
}

export function filterFeed<T extends FeedItemLike>(
  items: T[],
  params: FeedFilterParams
): T[] {
  const q = params.q?.trim().toLowerCase() ?? "";
  const types = params.type ?? [];
  const topics = params.topic ?? [];
  const people = params.person ?? [];
  const sources = params.source ?? [];
  const sort: FeedSort = params.sort ?? "publishedAt";

  const filtered = items.filter((item) => {
    if (types.length > 0 && !types.includes(item.type)) return false;
    if (sources.length > 0 && !sources.includes(item.source?.kind ?? "")) return false;
    if (topics.length > 0 && !topics.some((t) => item.topics.includes(t))) return false;
    if (people.length > 0 && !people.some((p) => (item.people ?? []).includes(p))) return false;
    if (q.length > 0) {
      const hay = `${item.title}\n${item.summary}\n${item.commentary ?? ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const keyOf = (item: T): number => {
    const iso = sort === "activityAt" ? (item.activityAt ?? item.publishedAt) : item.publishedAt;
    return Date.parse(iso);
  };

  return [...filtered].sort((a, b) => keyOf(b) - keyOf(a));
}
