import { describe, expect, it } from "vitest";
import { describeSource, resolvePeople, type PersonLike } from "./feed";

describe("describeSource", () => {
  it("returns undefined for no source", () => {
    expect(describeSource(undefined)).toBeUndefined();
  });

  it("describes a url source with siteName and author", () => {
    const d = describeSource({
      kind: "url",
      url: "https://example.com/post",
      siteName: "Example Blog",
      author: "A. Writer",
    });
    expect(d).toEqual({ label: "Example Blog · A. Writer", href: "https://example.com/post" });
  });

  it("falls back to hostname when siteName is missing on a url source", () => {
    const d = describeSource({
      kind: "url",
      url: "https://example.com/post",
    });
    expect(d).toEqual({ label: "example.com", href: "https://example.com/post" });
  });

  it("describes a tweet source", () => {
    const d = describeSource({
      kind: "tweet",
      url: "https://x.com/example/status/1",
      authorHandle: "@example",
    });
    expect(d?.label).toContain("@example");
    expect(d?.href).toBe("https://x.com/example/status/1");
  });

  it("describes a tweet source without a handle", () => {
    const d = describeSource({
      kind: "tweet",
      url: "https://x.com/anon/status/2",
    });
    expect(d?.href).toBe("https://x.com/anon/status/2");
    expect(d?.label.length).toBeGreaterThan(0);
  });

  it("describes a youtube source with channel", () => {
    const d = describeSource({
      kind: "youtube",
      url: "https://www.youtube.com/watch?v=x",
      channel: "InfoQ",
    });
    expect(d?.label).toContain("InfoQ");
    expect(d?.href).toBe("https://www.youtube.com/watch?v=x");
  });

  it("describes a paper source with authors and arxivId", () => {
    const d = describeSource({
      kind: "paper",
      url: "https://arxiv.org/abs/2401.12345",
      authors: ["A. Author", "B. Coauthor"],
      arxivId: "2401.12345",
    });
    expect(d?.label).toContain("A. Author");
    expect(d?.label).toContain("2401.12345");
    expect(d?.href).toBe("https://arxiv.org/abs/2401.12345");
  });

  it("describes a book source with author — no href when url missing", () => {
    const d = describeSource({
      kind: "book",
      author: "Someone",
      isbn: "978-0-1234",
    });
    expect(d?.label).toContain("Someone");
    expect(d?.href).toBeUndefined();
  });

  it("describes a book source with url", () => {
    const d = describeSource({
      kind: "book",
      author: "Someone",
      url: "https://publisher.example/book",
    });
    expect(d?.href).toBe("https://publisher.example/book");
  });
});

describe("resolvePeople", () => {
  const pool: PersonLike[] = [
    { id: "rich-hickey", name: "Rich Hickey" },
    { id: "linus-lee", name: "Linus Lee" },
    { id: "maggie-appleton", name: "Maggie Appleton" },
  ];

  it("returns empty for undefined or empty input", () => {
    expect(resolvePeople(undefined, pool)).toEqual([]);
    expect(resolvePeople([], pool)).toEqual([]);
  });

  it("resolves known ids in the given order", () => {
    const out = resolvePeople(["linus-lee", "rich-hickey"], pool);
    expect(out.map((p) => p.name)).toEqual(["Linus Lee", "Rich Hickey"]);
  });

  it("silently drops unknown ids", () => {
    const out = resolvePeople(["rich-hickey", "unknown", "linus-lee"], pool);
    expect(out.map((p) => p.id)).toEqual(["rich-hickey", "linus-lee"]);
  });
});
