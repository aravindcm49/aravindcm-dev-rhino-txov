import { describe, expect, it } from "vitest";
import { feedItemSchema } from "./feed";

const validBase = {
  title: "Test item",
  type: "essay" as const,
  summary: "A summary",
  publishedAt: new Date("2026-04-01"),
  topics: ["writing"],
  hasPage: true,
  draft: false,
  featured: false,
};

describe("feedItemSchema", () => {
  it("parses a minimally-valid essay", () => {
    const result = feedItemSchema.safeParse(validBase);
    expect(result.success).toBe(true);
  });

  it("defaults topics/draft/featured when omitted", () => {
    const { topics, draft, featured, ...rest } = validBase;
    const result = feedItemSchema.safeParse({ ...rest, topics: [] });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.draft).toBe(false);
      expect(result.data.featured).toBe(false);
      expect(result.data.topics).toEqual([]);
    }
  });

  it("rejects when title is missing", () => {
    const { title, ...rest } = validBase;
    const result = feedItemSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects when publishedAt is missing", () => {
    const { publishedAt, ...rest } = validBase;
    const result = feedItemSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects an unknown type", () => {
    const result = feedItemSchema.safeParse({ ...validBase, type: "podcast" });
    expect(result.success).toBe(false);
  });

  it("requires source for type=link", () => {
    const result = feedItemSchema.safeParse({ ...validBase, type: "link" });
    expect(result.success).toBe(false);
  });

  it("accepts a link with source.kind=url", () => {
    const result = feedItemSchema.safeParse({
      ...validBase,
      type: "link",
      source: { kind: "url", url: "https://example.com/post" },
    });
    expect(result.success).toBe(true);
  });

  it("rejects a link with source.kind=tweet", () => {
    const result = feedItemSchema.safeParse({
      ...validBase,
      type: "link",
      source: { kind: "tweet", url: "https://x.com/u/status/1" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects a video with source.kind=url", () => {
    const result = feedItemSchema.safeParse({
      ...validBase,
      type: "video",
      source: { kind: "url", url: "https://example.com/v" },
    });
    expect(result.success).toBe(false);
  });

  it("accepts a video with source.kind=youtube", () => {
    const result = feedItemSchema.safeParse({
      ...validBase,
      type: "video",
      source: { kind: "youtube", url: "https://youtube.com/watch?v=x" },
    });
    expect(result.success).toBe(true);
  });

  it("accepts an essay with no source", () => {
    const result = feedItemSchema.safeParse({ ...validBase, type: "essay" });
    expect(result.success).toBe(true);
  });

  it("accepts an essay with an optional source of any kind", () => {
    const result = feedItemSchema.safeParse({
      ...validBase,
      type: "essay",
      source: { kind: "url", url: "https://example.com" },
    });
    expect(result.success).toBe(true);
  });

  it("coerces ISO date strings to Date", () => {
    const result = feedItemSchema.safeParse({
      ...validBase,
      publishedAt: "2026-04-01",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.publishedAt).toBeInstanceOf(Date);
    }
  });

  it("round-trips draft=true", () => {
    const result = feedItemSchema.safeParse({ ...validBase, draft: true });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.draft).toBe(true);
    }
  });
});
