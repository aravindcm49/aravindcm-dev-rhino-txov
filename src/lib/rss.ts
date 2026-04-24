import type { FeedItem } from "../schemas/feed";

/**
 * Shape the RSS builder needs from a content-layer entry.
 */
export interface RssEntryLike {
  id: string;
  data: FeedItem;
}

/**
 * Returns true when a feed entry should appear in the RSS feed:
 * - hasPage is true (links to a local detail page)
 * - draft is false
 */
export function isRssEligible(entry: RssEntryLike): boolean {
  return entry.data.hasPage === true && entry.data.draft !== true;
}

/**
 * Builds the RSS 2.0 XML string for a collection of feed entries.
 */
export function buildRssXml(
  entries: RssEntryLike[],
  siteUrl: string,
  feedTitle: string,
  feedDescription: string
): string {
  const eligible = entries.filter(isRssEligible);

  // Sort by publishedAt descending (newest first)
  eligible.sort(
    (a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime()
  );

  const items = eligible
    .map((entry) => {
      const { data } = entry;
      const slug = data.slug ?? entry.id;
      const link = `${siteUrl}/feed/${slug}`;
      const pubDate = data.publishedAt.toUTCString();

      // Combine summary and commentary excerpt for the description
      const parts = [data.summary];
      if (data.commentary) {
        // Truncate commentary to ~200 chars for RSS description
        const excerpt =
          data.commentary.length > 200
            ? data.commentary.slice(0, 197) + "..."
            : data.commentary;
        parts.push(excerpt);
      }
      const description = escapeXml(parts.join(" — "));

      return `    <item>
      <title>${escapeXml(data.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${description}</description>
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(feedTitle)}</title>
    <link>${siteUrl}</link>
    <description>${escapeXml(feedDescription)}</description>
    <language>en</language>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
