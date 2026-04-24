import type { APIRoute } from "astro";
import { requireDraftMode } from "~/lib/draft-auth";
import { db } from "~/lib/db/index";
import { feedItems } from "~/lib/db/schema";


export const GET: APIRoute = async ({ url, cookies }) => {
  const guard = requireDraftMode(cookies);
  if (guard) return guard;

  const q = url.searchParams.get("q")?.trim().toLowerCase() ?? "";

  try {
    // Get distinct topics from feed_items
    const result = await db
      .select({ topics: feedItems.topics })
      .from(feedItems);

    const allTopics = new Set<string>();
    for (const row of result) {
      for (const topic of row.topics ?? []) {
        allTopics.add(topic);
      }
    }

    let topics = [...allTopics].sort();
    if (q) {
      topics = topics.filter((t) => t.toLowerCase().includes(q));
    }

    return new Response(JSON.stringify(topics.slice(0, 20)), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
