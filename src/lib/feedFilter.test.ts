import { describe, expect, it } from "vitest";
import { filterFeed, type FeedItemLike, type FeedFilterParams } from "./feedFilter";

const items: FeedItemLike[] = [
  {
    id: "simple-made-easy",
    title: "Simple Made Easy",
    summary: "Rich Hickey's talk separating simplicity from easiness.",
    commentary: "The single most useful framing I keep returning to.",
    type: "video",
    topics: ["software", "philosophy"],
    people: ["rich-hickey"],
    source: { kind: "youtube", url: "https://youtube.com/watch?v=x" },
    publishedAt: "2026-01-10T00:00:00.000Z",
    activityAt: "2026-02-01T00:00:00.000Z",
    hasPage: true,
  },
  {
    id: "api-design-thread",
    title: "API design thread",
    summary: "A short tweet thread on boring API design.",
    commentary: "Saving this as a reference — the examples are terrific.",
    type: "tweet",
    topics: ["engineering"],
    people: ["linus-lee"],
    source: { kind: "tweet", url: "https://x.com/a/status/1" },
    publishedAt: "2026-03-20T00:00:00.000Z",
    activityAt: "2026-03-20T00:00:00.000Z",
    hasPage: false,
  },
  {
    id: "publishing-less-better",
    title: "Publishing less, better",
    summary: "A short essay on curation over volume.",
    commentary: "",
    type: "essay",
    topics: ["writing", "craft"],
    people: [],
    source: undefined,
    publishedAt: "2026-04-01T00:00:00.000Z",
    activityAt: "2026-04-05T00:00:00.000Z",
    hasPage: true,
  },
  {
    id: "on-software-longevity",
    title: "On software longevity",
    summary: "Quality compounds with the age of the people writing it.",
    commentary: "Particularly good on why rewrites tend to fail.",
    type: "link",
    topics: ["engineering", "craft"],
    people: ["linus-lee"],
    source: { kind: "url", url: "https://example.com/post" },
    publishedAt: "2026-03-28T00:00:00.000Z",
    activityAt: "2026-03-30T00:00:00.000Z",
    hasPage: true,
  },
];

function filter(params: FeedFilterParams) {
  return filterFeed(items, params).map((i) => i.id);
}

describe("filterFeed", () => {
  it("returns all items sorted by publishedAt desc when params are empty", () => {
    expect(filter({})).toEqual([
      "publishing-less-better",
      "on-software-longevity",
      "api-design-thread",
      "simple-made-easy",
    ]);
  });

  it("matches text against title", () => {
    expect(filter({ q: "longevity" })).toEqual(["on-software-longevity"]);
  });

  it("matches text against summary", () => {
    expect(filter({ q: "curation" })).toEqual(["publishing-less-better"]);
  });

  it("matches text against commentary", () => {
    expect(filter({ q: "rewrites" })).toEqual(["on-software-longevity"]);
  });

  it("is case-insensitive in text match", () => {
    expect(filter({ q: "RICH HICKEY" })).toEqual(["simple-made-easy"]);
  });

  it("filters by single type", () => {
    expect(filter({ type: ["essay"] })).toEqual(["publishing-less-better"]);
  });

  it("treats multiple values for the same filter as OR", () => {
    expect(filter({ type: ["essay", "link"] })).toEqual([
      "publishing-less-better",
      "on-software-longevity",
    ]);
  });

  it("filters by topic", () => {
    expect(filter({ topic: ["craft"] })).toEqual([
      "publishing-less-better",
      "on-software-longevity",
    ]);
  });

  it("filters by person", () => {
    expect(filter({ person: ["linus-lee"] })).toEqual([
      "on-software-longevity",
      "api-design-thread",
    ]);
  });

  it("filters by source kind", () => {
    expect(filter({ source: ["tweet"] })).toEqual(["api-design-thread"]);
  });

  it("combines different filters as AND", () => {
    expect(filter({ type: ["link"], topic: ["craft"] })).toEqual([
      "on-software-longevity",
    ]);
  });

  it("combines q and type filters", () => {
    expect(filter({ q: "design", type: ["tweet"] })).toEqual(["api-design-thread"]);
  });

  it("returns empty list when no items match", () => {
    expect(filter({ q: "nothing-matches-this-string" })).toEqual([]);
  });

  it("sorts by activityAt desc when sort=activityAt", () => {
    expect(filter({ sort: "activityAt" })).toEqual([
      "publishing-less-better",
      "on-software-longevity",
      "api-design-thread",
      "simple-made-easy",
    ]);
  });

  it("ignores unknown filter values (empty arrays match nothing, never everything)", () => {
    // Empty arrays should be treated as "no filter applied" — not "match none".
    expect(filter({ type: [] })).toEqual([
      "publishing-less-better",
      "on-software-longevity",
      "api-design-thread",
      "simple-made-easy",
    ]);
  });

  it("trims and ignores whitespace-only q", () => {
    expect(filter({ q: "   " })).toEqual([
      "publishing-less-better",
      "on-software-longevity",
      "api-design-thread",
      "simple-made-easy",
    ]);
  });
});
