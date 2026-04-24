import { describe, expect, it } from "vitest";
import { isRssEligible, buildRssXml, type RssEntryLike } from "./rss";

function makeEntry(
  overrides: Partial<RssEntryLike["data"]> & { id?: string } = {}
): RssEntryLike {
  return {
    id: overrides.id ?? "test-entry",
    data: {
      title: "Test Title",
      type: "essay",
      summary: "A summary.",
      publishedAt: new Date("2026-01-15T12:00:00Z"),
      hasPage: true,
      draft: false,
      featured: false,
      topics: [],
      ...overrides,
    },
  };
}

describe("isRssEligible", () => {
  it("returns true for hasPage: true, draft: false", () => {
    expect(isRssEligible(makeEntry())).toBe(true);
  });

  it("returns false when hasPage is false", () => {
    expect(isRssEligible(makeEntry({ hasPage: false }))).toBe(false);
  });

  it("returns false when draft is true", () => {
    expect(isRssEligible(makeEntry({ draft: true }))).toBe(false);
  });

  it("returns false when both hasPage is false and draft is true", () => {
    expect(isRssEligible(makeEntry({ hasPage: false, draft: true }))).toBe(false);
  });
});

describe("buildRssXml", () => {
  const siteUrl = "https://aravindcm.dev";

  it("produces valid RSS 2.0 structure", () => {
    const xml = buildRssXml(
      [makeEntry()],
      siteUrl,
      "Test Feed",
      "A test feed"
    );
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<rss version="2.0"');
    expect(xml).toContain("<channel>");
    expect(xml).toContain("<title>Test Feed</title>");
    expect(xml).toContain("<description>A test feed</description>");
    expect(xml).toContain("</channel>");
    expect(xml).toContain("</rss>");
  });

  it("includes atom:link for self-reference", () => {
    const xml = buildRssXml([], siteUrl, "Feed", "Desc");
    expect(xml).toContain(
      '<atom:link href="https://aravindcm.dev/feed.xml" rel="self" type="application/rss+xml" />'
    );
  });

  it("includes only eligible entries", () => {
    const entries = [
      makeEntry({ id: "eligible", hasPage: true, draft: false }),
      makeEntry({ id: "no-page", hasPage: false, draft: false }),
      makeEntry({ id: "draft", hasPage: true, draft: true }),
    ];
    const xml = buildRssXml(entries, siteUrl, "Feed", "Desc");
    expect(xml).toContain("/feed/eligible");
    expect(xml).not.toContain("/feed/no-page");
    expect(xml).not.toContain("/feed/draft");
  });

  it("sorts items by publishedAt descending", () => {
    const entries = [
      makeEntry({ id: "old", publishedAt: new Date("2026-01-01") }),
      makeEntry({ id: "new", publishedAt: new Date("2026-06-01") }),
      makeEntry({ id: "mid", publishedAt: new Date("2026-03-01") }),
    ];
    const xml = buildRssXml(entries, siteUrl, "Feed", "Desc");
    const newIndex = xml.indexOf("/feed/new");
    const midIndex = xml.indexOf("/feed/mid");
    const oldIndex = xml.indexOf("/feed/old");
    expect(newIndex).toBeLessThan(midIndex);
    expect(midIndex).toBeLessThan(oldIndex);
  });

  it("uses data.slug when present, falls back to entry.id", () => {
    const withSlug = makeEntry({ id: "entry-id", slug: "custom-slug" });
    const withoutSlug = makeEntry({ id: "entry-id" });
    const xml = buildRssXml([withSlug, withoutSlug], siteUrl, "Feed", "Desc");
    expect(xml).toContain("/feed/custom-slug");
    expect(xml).toContain("/feed/entry-id");
  });

  it("combines summary and commentary in description", () => {
    const entry = makeEntry({
      summary: "The summary.",
      commentary: "The commentary.",
    });
    const xml = buildRssXml([entry], siteUrl, "Feed", "Desc");
    expect(xml).toContain("The summary. — The commentary.");
  });

  it("truncates long commentary to ~200 chars", () => {
    const longCommentary = "A".repeat(300);
    const entry = makeEntry({
      summary: "Summary",
      commentary: longCommentary,
    });
    const xml = buildRssXml([entry], siteUrl, "Feed", "Desc");
    // Should contain truncated version
    expect(xml).toContain("...");
    // Should not contain the full 300-char commentary
    expect(xml).not.toContain("A".repeat(300));
  });

  it("escapes XML special characters in content", () => {
    const entry = makeEntry({
      title: 'Title with <special> & "chars"',
      summary: "Summary with <html> & entities",
    });
    const xml = buildRssXml([entry], siteUrl, "Feed", "Desc");
    expect(xml).toContain("&lt;special&gt;");
    expect(xml).toContain("&amp;");
    expect(xml).toContain("&quot;chars&quot;");
  });

  it("includes pubDate in UTC format", () => {
    const entry = makeEntry({
      publishedAt: new Date("2026-01-15T12:00:00Z"),
    });
    const xml = buildRssXml([entry], siteUrl, "Feed", "Desc");
    expect(xml).toContain("<pubDate>");
    // UTC dates end with GMT
    expect(xml).toContain("GMT");
  });

  it("links point to local /feed/[slug] pages", () => {
    const entry = makeEntry({ slug: "my-post" });
    const xml = buildRssXml([entry], siteUrl, "Feed", "Desc");
    expect(xml).toContain("<link>https://aravindcm.dev/feed/my-post</link>");
    expect(xml).toContain(
      '<guid isPermaLink="true">https://aravindcm.dev/feed/my-post</guid>'
    );
  });
});
