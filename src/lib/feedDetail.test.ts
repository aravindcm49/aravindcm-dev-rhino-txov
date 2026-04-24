import { describe, expect, it } from "vitest";
import { isPageable, prepareFeedPage, type FeedEntryLike } from "./feedDetail";
import type { PersonLike } from "./feed";

const people: PersonLike[] = [
  { id: "rich-hickey", name: "Rich Hickey" },
  { id: "linus-lee", name: "Linus Lee" },
];

function makeEntry(overrides: Partial<FeedEntryLike["data"]> & { id?: string } = {}): FeedEntryLike {
  return {
    id: overrides.id ?? "test-entry",
    data: {
      title: "Test Title",
      type: "essay",
      summary: "A summary.",
      publishedAt: new Date("2026-01-01"),
      hasPage: true,
      draft: false,
      featured: false,
      topics: ["software"],
      ...overrides,
    },
  };
}

describe("isPageable", () => {
  it("returns true for hasPage: true, draft: false", () => {
    expect(isPageable(makeEntry())).toBe(true);
  });

  it("returns false when hasPage is false", () => {
    expect(isPageable(makeEntry({ hasPage: false }))).toBe(false);
  });

  it("returns false when draft is true", () => {
    expect(isPageable(makeEntry({ draft: true }))).toBe(false);
  });

  it("returns false when both hasPage is false and draft is true", () => {
    expect(isPageable(makeEntry({ hasPage: false, draft: true }))).toBe(false);
  });
});

describe("prepareFeedPage", () => {
  it("returns correct slug from data.slug when present", () => {
    const entry = makeEntry({ slug: "custom-slug" });
    const page = prepareFeedPage(entry, people);
    expect(page.slug).toBe("custom-slug");
  });

  it("falls back to entry.id when data.slug is undefined", () => {
    const entry = makeEntry({ slug: undefined });
    const page = prepareFeedPage(entry, people);
    expect(page.slug).toBe("test-entry");
  });

  it("passes title, summary, and commentary through", () => {
    const entry = makeEntry({
      title: "My Title",
      summary: "My Summary",
      commentary: "My Commentary",
    });
    const page = prepareFeedPage(entry, people);
    expect(page.title).toBe("My Title");
    expect(page.summary).toBe("My Summary");
    expect(page.commentary).toBe("My Commentary");
  });

  it("defaults topics to empty array when absent", () => {
    const entry = makeEntry({ topics: undefined as unknown as string[] });
    const page = prepareFeedPage(entry, people);
    expect(page.topics).toEqual([]);
  });

  it("resolves people from the pool", () => {
    const entry = makeEntry({ people: ["rich-hickey"] });
    const page = prepareFeedPage(entry, people);
    expect(page.people).toHaveLength(1);
    expect(page.people[0].name).toBe("Rich Hickey");
  });

  it("drops unknown people ids silently", () => {
    const entry = makeEntry({ people: ["rich-hickey", "unknown"] });
    const page = prepareFeedPage(entry, people);
    expect(page.people).toHaveLength(1);
  });

  it("returns empty people when people field is absent", () => {
    const entry = makeEntry({ people: undefined });
    const page = prepareFeedPage(entry, people);
    expect(page.people).toEqual([]);
  });

  it("describes source when present", () => {
    const entry = makeEntry({
      type: "link",
      source: {
        kind: "url",
        url: "https://example.com/article",
        siteName: "Example",
        author: "A. Writer",
      },
    });
    const page = prepareFeedPage(entry, people);
    expect(page.source).toBeDefined();
    expect(page.source?.label).toContain("Example");
    expect(page.source?.href).toBe("https://example.com/article");
  });

  it("returns undefined source when source is absent", () => {
    const entry = makeEntry({ source: undefined });
    const page = prepareFeedPage(entry, people);
    expect(page.source).toBeUndefined();
  });
});
