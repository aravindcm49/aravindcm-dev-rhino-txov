import { describe, expect, it } from "vitest";
import { selectRecent, type RecentCandidate } from "./landing";

const NOW = new Date("2026-04-23T12:00:00Z");

function daysAgo(n: number): Date {
  return new Date(NOW.getTime() - n * 24 * 60 * 60 * 1000);
}

function entry(id: string, days: number | null, opts: Partial<{ draft: boolean; kind: "feed" | "project" }> = {}): RecentCandidate {
  return {
    kind: opts.kind ?? "feed",
    id,
    activityAt: days === null ? undefined : daysAgo(days),
    draft: opts.draft ?? false,
  };
}

describe("selectRecent", () => {
  it("keeps items within 30 days and sorts newest first", () => {
    const items = [
      entry("a", 20),
      entry("b", 2),
      entry("c", 10),
    ];
    const result = selectRecent(items, NOW, 6);
    expect(result.map((e) => e.id)).toEqual(["b", "c", "a"]);
  });

  it("filters out items older than 30 days", () => {
    const items = [entry("new", 5), entry("old", 45)];
    const result = selectRecent(items, NOW, 6);
    expect(result.map((e) => e.id)).toEqual(["new"]);
  });

  it("filters out items with no activityAt", () => {
    const items = [entry("has", 3), entry("none", null)];
    const result = selectRecent(items, NOW, 6);
    expect(result.map((e) => e.id)).toEqual(["has"]);
  });

  it("excludes drafts", () => {
    const items = [entry("pub", 5), entry("draft", 1, { draft: true })];
    const result = selectRecent(items, NOW, 6);
    expect(result.map((e) => e.id)).toEqual(["pub"]);
  });

  it("caps at the given limit", () => {
    const items = Array.from({ length: 10 }, (_, i) => entry(`e${i}`, i + 1));
    const result = selectRecent(items, NOW, 6);
    expect(result).toHaveLength(6);
    expect(result.map((e) => e.id)).toEqual(["e0", "e1", "e2", "e3", "e4", "e5"]);
  });

  it("mixes feed and project entries preserving both kinds", () => {
    const items = [
      entry("f1", 5, { kind: "feed" }),
      entry("p1", 3, { kind: "project" }),
      entry("f2", 10, { kind: "feed" }),
    ];
    const result = selectRecent(items, NOW, 6);
    expect(result.map((e) => `${e.kind}:${e.id}`)).toEqual([
      "project:p1",
      "feed:f1",
      "feed:f2",
    ]);
  });

  it("includes items at the 30-day boundary (inclusive)", () => {
    const items = [entry("edge", 30), entry("past", 31)];
    const result = selectRecent(items, NOW, 6);
    expect(result.map((e) => e.id)).toEqual(["edge"]);
  });
});
