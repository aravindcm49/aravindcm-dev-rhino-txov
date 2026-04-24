// --- URL classification ---

export type UrlKind = "tweet" | "youtube" | "link";

export function classifyUrl(url: string): UrlKind {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    if (hostname === "x.com" || hostname === "twitter.com") return "tweet";
    if (hostname === "youtube.com" || hostname === "youtu.be") return "youtube";
    return "link";
  } catch {
    return "link";
  }
}

// --- Result types ---

export interface TweetMeta {
  kind: "tweet";
  html: string;
  authorName: string;
  authorUrl: string;
}

export interface YoutubeMeta {
  kind: "youtube";
  title: string;
  description: string;
  videoId: string;
  channel: string;
}

export interface LinkMeta {
  kind: "url";
  title: string;
  description: string;
  siteName: string;
  image: string;
}

export type OgResult = TweetMeta | YoutubeMeta | LinkMeta;

// --- Twitter oEmbed ---

export async function fetchTweetMeta(url: string): Promise<TweetMeta> {
  const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}`;
  const res = await fetch(oembedUrl);
  if (!res.ok) throw new Error(`Twitter oEmbed failed: ${res.status}`);
  const data = await res.json();
  return {
    kind: "tweet",
    html: data.html ?? "",
    authorName: data.author_name ?? "",
    authorUrl: data.author_url ?? "",
  };
}

// --- YouTube ---

export function extractYoutubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace(/^www\./, "");
    if (hostname === "youtu.be") {
      return parsed.pathname.slice(1) || null;
    }
    return parsed.searchParams.get("v");
  } catch {
    return null;
  }
}

export async function fetchYoutubeMeta(url: string): Promise<YoutubeMeta> {
  const videoId = extractYoutubeVideoId(url);
  if (!videoId) throw new Error("Could not extract YouTube video ID");
  // Use oEmbed for YouTube — no API key needed
  const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
  const res = await fetch(oembedUrl);
  if (!res.ok) throw new Error(`YouTube oEmbed failed: ${res.status}`);
  const data = await res.json();
  return {
    kind: "youtube",
    title: data.title ?? "",
    description: "",
    videoId,
    channel: data.author_name ?? "",
  };
}

// --- HTML meta tag extraction ---

export function extractMetaFromHtml(html: string): LinkMeta {
  const get = (pattern: RegExp): string => {
    const match = html.match(pattern);
    return match?.[1]?.trim() ?? "";
  };

  const title =
    get(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
    get(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i) ||
    get(/<title[^>]*>([^<]+)<\/title>/i);

  const description =
    get(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i) ||
    get(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i) ||
    get(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ||
    get(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);

  const image =
    get(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
    get(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);

  const siteName =
    get(/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i) ||
    get(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:site_name["']/i);

  return { kind: "url", title, description, siteName, image };
}

export async function fetchLinkMeta(url: string): Promise<LinkMeta> {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; OGFetcher/1.0)" },
  });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  const html = await res.text();
  return extractMetaFromHtml(html);
}

// --- Main entry point ---

export async function fetchOgMetadata(url: string): Promise<OgResult> {
  const kind = classifyUrl(url);
  switch (kind) {
    case "tweet":
      return fetchTweetMeta(url);
    case "youtube":
      return fetchYoutubeMeta(url);
    case "link":
      return fetchLinkMeta(url);
  }
}
