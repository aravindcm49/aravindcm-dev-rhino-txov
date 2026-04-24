import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { feedItems, people } from "./schema";

export type Db = NeonHttpDatabase<Record<string, unknown>>;

/**
 * Extracts handles from feed items that don't have a matching promoted person.
 * Handles are extracted from:
 * - source_meta.authorHandle (for tweets)
 * - people array (person IDs that don't exist in people table)
 */
export async function getSuggestedHandles(db: Db): Promise<string[]> {
  // Get all existing person IDs
  const existingPeople = await db.select({ id: people.id }).from(people);
  const existingIds = new Set(existingPeople.map((p: { id: string }) => p.id));

  // Get all feed items
  const items = await db
    .select({
      sourceMeta: feedItems.sourceMeta,
      people: feedItems.people,
    })
    .from(feedItems);

  const handles = new Set<string>();

  for (const item of items) {
    // Extract authorHandle from source_meta
    const meta = (item.sourceMeta ?? {}) as Record<string, unknown>;
    if (typeof meta.authorHandle === "string" && meta.authorHandle) {
      const handle = meta.authorHandle.replace(/^@/, "");
      if (!existingIds.has(handle)) {
        handles.add(handle);
      }
    }

    // Extract unresolved person IDs from people array
    if (item.people) {
      for (const personId of item.people) {
        if (!existingIds.has(personId)) {
          handles.add(personId);
        }
      }
    }
  }

  return [...handles].sort();
}
