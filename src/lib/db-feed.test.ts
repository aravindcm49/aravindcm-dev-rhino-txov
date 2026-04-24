import { describe, expect, it } from "vitest";
import { normalizeDbItem, mergeFeedItems, type MdxFeedEntry } from "./db-feed";
import type { FeedItemRow } from "./db/schema";

// --- normalizeDbItem ---

function makeDbRow(overrides: Partial<FeedItemRow> = {}): FeedItemRow {
  return {
    id: "00000000-0000-0000-0000-000000000001",
    slug: "test-item",
    title: "Test Item",
    type: "link",
    summary: "A test",
    commentary: null,
    content: null,
    sourceKind: "url",
    sourceUrl: "https://example.com",
    sourceMeta: null,
    topics: [],
    people: [],
    hasPage: false,
    draft: false,
    featured: false,
    publishedAt: new Date("2025-01-01"),
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
    ...overrides,
  } as FeedItemRow;
}

describe("normalizeDbItem", () => {
  it("normalizes a URL source", () => {
    const row = makeDbRow({
      sourceKind: "url",
      sourceUrl: "https://example.com/post",
      sourceMeta: { siteName: "Example", author: "A. Writer" },
    });
    const result = normalizeDbItem(row);
    expect(result.source).toEqual({
      kind: "url",
      url: "https://example.com/post",
      siteName: "Example",
      author: "A. Writer",
    });
  });

  it("normalizes a tweet source", () => {
    const row = makeDbRow({
      type: "tweet",
      sourceKind: "tweet",
      sourceUrl: "https://x.com/user/status/1",
      sourceMeta: { authorHandle: "@user" },
    });
    const result = normalizeDbItem(row);
    expect(result.source).toEqual({
      kind: "tweet",
      url: "https://x.com/user/status/1",
      authorHandle: "@user",
    });
  });

  it("normalizes a youtube source", () => {
    const row = makeDbRow({
      type: "video",
      sourceKind: "youtube",
      sourceUrl: "https://youtube.com/watch?v=abc",
      sourceMeta: { videoId: "abc", channel: "TestChannel" },
    });
    const result = normalizeDbItem(row);
    expect(result.source).toEqual({
      kind: "youtube",
      url: "https://youtube.com/watch?v=abc",
      videoId: "abc",
      channel: "TestChannel",
    });
  });

  it("returns undefined source when sourceKind is null", () => {
    const row = makeDbRow({ sourceKind: null, sourceUrl: null });
    const result = normalizeDbItem(row);
    expect(result.source).toBeUndefined();
  });

  it("normalizes a paper source", () => {
    const row = makeDbRow({
      type: "paper",
      sourceKind: "paper",
      sourceUrl: "https://arxiv.org/abs/2401.12345",
      sourceMeta: { arxivId: "2401.12345", authors: ["A. Author"] },
    });
    const result = normalizeDbItem(row);
    expect(result.source).toEqual({
      kind: "paper",
      url: "https://arxiv.org/abs/2401.12345",
      arxivId: "2401.12345",
      doi: undefined,
      authors: ["A. Author"],
    });
  });

  it("normalizes a book source", () => {
    const row = makeDbRow({
      type: "book",
      sourceKind: "book",
      sourceUrl: "https://publisher.example/book",
      sourceMeta: { author: "Book Author", isbn: "978-0-1234" },
    });
    const result = normalizeDbItem(row);
    expect(result.source).toEqual({
      kind: "book",
      url: "https://publisher.example/book",
      author: "Book Author",
      isbn: "978-0-1234",
    });
  });

  it("converts dates correctly", () => {
    const row = makeDbRow({
      publishedAt: new Date("2025-06-15T10:00:00Z"),
      updatedAt: new Date("2025-06-16T10:00:00Z"),
    });
    const result = normalizeDbItem(row);
    expect(result.publishedAt).toEqual(new Date("2025-06-15T10:00:00Z"));
    expect(result.updatedAt).toEqual(new Date("2025-06-16T10:00:00Z"));
  });
});

// --- mergeFeedItems ---

function makeMdxEntry(overrides: Partial<MdxFeedEntry["data"]> = {}): MdxFeedEntry {
  return {
    id: "mdx-entry",
    data: {
      title: "MDX Post",
      type: "essay",
      summary: "An MDX essay",
      publishedAt: new Date("2025-03-01"),
      topics: ["writing"],
      hasPage: true,
      draft: false,
      featured: false,
      slug: "mdx-post",
      ...overrides,
    },
  };
}

describe("mergeFeedItems", () => {
  it("merges MDX and DB items sorted by publishedAt desc", () => {
    const mdx = [makeMdxEntry({ slug: "mdx-post", publishedAt: new Date("2025-03-01") })];
    const db = [
      makeDbRow({ slug: "db-post", publishedAt: new Date("2025-04-01"), title: "DB Post" }),
    ];
    const result = mergeFeedItems(mdx, db);
    expect(result).toHaveLength(2);
    expect(result[0].slug).toBe("db-post"); // newer first
    expect(result[1].slug).toBe("mdx-post");
  });

  it("excludes draft DB items", () => {
    const db = [makeDbRow({ slug: "draft-post", draft: true })];
    const result = mergeFeedItems([], db);
    expect(result).toHaveLength(0);
  });

  it("excludes draft MDX items", () => {
    const mdx = [makeMdxEntry({ slug: "draft-mdx", draft: true })];
    const result = mergeFeedItems(mdx, []);
    expect(result).toHaveLength(0);
  });

  it("deduplicates by slug — MDX wins", () => {
    const mdx = [makeMdxEntry({ slug: "shared-slug", title: "MDX Version" })];
    const db = [makeDbRow({ slug: "shared-slug", title: "DB Version" })];
    const result = mergeFeedItems(mdx, db);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("MDX Version");
    expect(result[0].origin).toBe("mdx");
  });

  it("handles empty MDX list", () => {
    const db = [makeDbRow({ slug: "only-db" })];
    const result = mergeFeedItems([], db);
    expect(result).toHaveLength(1);
    expect(result[0].origin).toBe("db");
  });

  it("handles empty DB list", () => {
    const mdx = [makeMdxEntry({ slug: "only-mdx" })];
    const result = mergeFeedItems(mdx, []);
    expect(result).toHaveLength(1);
    expect(result[0].origin).toBe("mdx");
  });

  it("handles both empty", () => {
    expect(mergeFeedItems([], [])).toEqual([]);
  });

  it("preserves origin field", () => {
    const mdx = [makeMdxEntry({ slug: "a" })];
    const db = [makeDbRow({ slug: "b" })];
    const result = mergeFeedItems(mdx, db);
    const origins = result.map((i) => i.origin);
    expect(origins).toContain("mdx");
    expect(origins).toContain("db");
  });
});
