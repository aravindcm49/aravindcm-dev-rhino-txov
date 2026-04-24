import { describe, expect, it, vi, afterEach } from "vitest";
import {
  classifyUrl,
  extractYoutubeVideoId,
  extractMetaFromHtml,
  fetchTweetMeta,
  fetchYoutubeMeta,
  fetchLinkMeta,
  fetchOgMetadata,
} from "./og";

// --- classifyUrl ---

describe("classifyUrl", () => {
  it("classifies x.com as tweet", () => {
    expect(classifyUrl("https://x.com/user/status/123")).toBe("tweet");
  });

  it("classifies twitter.com as tweet", () => {
    expect(classifyUrl("https://twitter.com/user/status/123")).toBe("tweet");
  });

  it("classifies www.x.com as tweet", () => {
    expect(classifyUrl("https://www.x.com/user/status/123")).toBe("tweet");
  });

  it("classifies youtube.com as youtube", () => {
    expect(classifyUrl("https://youtube.com/watch?v=abc")).toBe("youtube");
  });

  it("classifies www.youtube.com as youtube", () => {
    expect(classifyUrl("https://www.youtube.com/watch?v=abc")).toBe("youtube");
  });

  it("classifies youtu.be as youtube", () => {
    expect(classifyUrl("https://youtu.be/abc")).toBe("youtube");
  });

  it("classifies arbitrary URLs as link", () => {
    expect(classifyUrl("https://example.com/post")).toBe("link");
  });

  it("classifies invalid URLs as link (fallback)", () => {
    expect(classifyUrl("not-a-url")).toBe("link");
  });
});

// --- extractYoutubeVideoId ---

describe("extractYoutubeVideoId", () => {
  it("extracts from youtube.com/watch?v=...", () => {
    expect(extractYoutubeVideoId("https://youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("extracts from youtu.be/...", () => {
    expect(extractYoutubeVideoId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("returns null for non-youtube URLs", () => {
    expect(extractYoutubeVideoId("https://example.com")).toBeNull();
  });

  it("returns null for youtu.be with no path", () => {
    expect(extractYoutubeVideoId("https://youtu.be/")).toBeNull();
  });
});

// --- extractMetaFromHtml ---

describe("extractMetaFromHtml", () => {
  it("extracts og:title, og:description, og:image, og:site_name", () => {
    const html = `
      <html>
        <head>
          <meta property="og:title" content="My Great Post">
          <meta property="og:description" content="A post about things">
          <meta property="og:image" content="https://example.com/image.jpg">
          <meta property="og:site_name" content="Example Blog">
        </head>
      </html>
    `;
    const result = extractMetaFromHtml(html);
    expect(result).toEqual({
      kind: "url",
      title: "My Great Post",
      description: "A post about things",
      image: "https://example.com/image.jpg",
      siteName: "Example Blog",
    });
  });

  it("falls back to <title> tag when og:title is missing", () => {
    const html = `<html><head><title>Page Title</title></head></html>`;
    const result = extractMetaFromHtml(html);
    expect(result.title).toBe("Page Title");
  });

  it("falls back to meta description when og:description is missing", () => {
    const html = `
      <html><head>
        <meta name="description" content="Fallback description">
      </head></html>
    `;
    const result = extractMetaFromHtml(html);
    expect(result.description).toBe("Fallback description");
  });

  it("returns empty strings when no metadata is found", () => {
    const html = `<html><head></head><body></body></html>`;
    const result = extractMetaFromHtml(html);
    expect(result).toEqual({
      kind: "url",
      title: "",
      description: "",
      siteName: "",
      image: "",
    });
  });

  it("handles reversed attribute order (content before property)", () => {
    const html = `<meta content="Reversed Title" property="og:title">`;
    const result = extractMetaFromHtml(html);
    expect(result.title).toBe("Reversed Title");
  });
});

// --- fetchTweetMeta (mocked) ---

describe("fetchTweetMeta", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("returns tweet metadata from oEmbed response", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          html: '<blockquote class="twitter-tweet">...</blockquote>',
          author_name: "Test User",
          author_url: "https://x.com/testuser",
        }),
    });

    const result = await fetchTweetMeta("https://x.com/testuser/status/1");
    expect(result.kind).toBe("tweet");
    expect(result.authorName).toBe("Test User");
    expect(result.authorUrl).toBe("https://x.com/testuser");
    expect(result.html).toContain("twitter-tweet");
  });

  it("throws on non-ok response", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 });
    await expect(fetchTweetMeta("https://x.com/bad/status/1")).rejects.toThrow(
      "Twitter oEmbed failed: 404",
    );
  });
});

// --- fetchYoutubeMeta (mocked) ---

describe("fetchYoutubeMeta", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("returns youtube metadata from oEmbed response", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          title: "Cool Video",
          author_name: "Cool Channel",
        }),
    });

    const result = await fetchYoutubeMeta("https://youtube.com/watch?v=abc123");
    expect(result.kind).toBe("youtube");
    expect(result.title).toBe("Cool Video");
    expect(result.videoId).toBe("abc123");
    expect(result.channel).toBe("Cool Channel");
  });

  it("throws when video ID cannot be extracted", async () => {
    await expect(fetchYoutubeMeta("https://example.com")).rejects.toThrow(
      "Could not extract YouTube video ID",
    );
  });
});

// --- fetchLinkMeta (mocked) ---

describe("fetchLinkMeta", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("extracts metadata from fetched HTML", async () => {
    const html = `
      <html><head>
        <meta property="og:title" content="Article Title">
        <meta property="og:description" content="Article desc">
        <meta property="og:site_name" content="Blog">
        <meta property="og:image" content="https://example.com/img.png">
      </head></html>
    `;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(html),
    });

    const result = await fetchLinkMeta("https://example.com/post");
    expect(result.kind).toBe("url");
    expect(result.title).toBe("Article Title");
    expect(result.description).toBe("Article desc");
    expect(result.siteName).toBe("Blog");
    expect(result.image).toBe("https://example.com/img.png");
  });

  it("throws on non-ok response", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 });
    await expect(fetchLinkMeta("https://example.com")).rejects.toThrow(
      "Fetch failed: 500",
    );
  });
});

// --- fetchOgMetadata (integration of classification + fetch) ---

describe("fetchOgMetadata", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("routes tweet URLs to fetchTweetMeta", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          html: "<blockquote>t</blockquote>",
          author_name: "A",
          author_url: "https://x.com/a",
        }),
    });
    const result = await fetchOgMetadata("https://x.com/a/status/1");
    expect(result.kind).toBe("tweet");
  });

  it("routes youtube URLs to fetchYoutubeMeta", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ title: "V", author_name: "C" }),
    });
    const result = await fetchOgMetadata("https://youtube.com/watch?v=z");
    expect(result.kind).toBe("youtube");
  });

  it("routes other URLs to fetchLinkMeta", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () =>
        Promise.resolve(
          '<html><head><meta property="og:title" content="T"></head></html>',
        ),
    });
    const result = await fetchOgMetadata("https://example.com/page");
    expect(result.kind).toBe("url");
  });
});
