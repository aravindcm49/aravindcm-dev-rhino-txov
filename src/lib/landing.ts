export interface RecentCandidate {
  kind: "feed" | "project";
  id: string;
  activityAt?: Date;
  draft: boolean;
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

// Items without activityAt are excluded — missing the field is the author's
// signal that the content isn't current. The 30-day window is inclusive on
// the older boundary; an item whose activityAt is exactly 30 days ago is
// still considered recent.
export function selectRecent<T extends RecentCandidate>(
  items: T[],
  now: Date,
  limit: number
): T[] {
  const cutoff = now.getTime() - THIRTY_DAYS_MS;
  return items
    .filter((item) => !item.draft && item.activityAt && item.activityAt.getTime() >= cutoff)
    .sort((a, b) => (b.activityAt!.getTime() - a.activityAt!.getTime()))
    .slice(0, limit);
}
