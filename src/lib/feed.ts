import type { Source } from "../schemas/feed";

export interface SourceDescriptor {
  label: string;
  href?: string;
}

// Shape the helper needs; a full astro `CollectionEntry<"people">` satisfies it,
// but keeping it narrow lets us test without booting the content layer.
export interface PersonLike {
  id: string;
  name: string;
}

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function describeSource(source: Source | undefined): SourceDescriptor | undefined {
  if (!source) return undefined;
  switch (source.kind) {
    case "url": {
      const parts = [source.siteName ?? hostname(source.url), source.author].filter(
        (p): p is string => typeof p === "string" && p.length > 0
      );
      return { label: parts.join(" · "), href: source.url };
    }
    case "tweet": {
      const label = source.authorHandle
        ? `${source.authorHandle} on ${hostname(source.url)}`
        : hostname(source.url);
      return { label, href: source.url };
    }
    case "youtube": {
      const label = source.channel
        ? `${source.channel} on ${hostname(source.url)}`
        : hostname(source.url);
      return { label, href: source.url };
    }
    case "paper": {
      const authorLabel =
        source.authors && source.authors.length > 0
          ? source.authors.length > 1
            ? `${source.authors[0]} et al.`
            : source.authors[0]
          : undefined;
      const idLabel = source.arxivId
        ? `arXiv:${source.arxivId}`
        : source.doi
          ? `doi:${source.doi}`
          : undefined;
      const parts = [authorLabel, idLabel].filter(
        (p): p is string => typeof p === "string"
      );
      return { label: parts.length ? parts.join(" · ") : hostname(source.url), href: source.url };
    }
    case "book": {
      const parts = ["Book", source.author ? `by ${source.author}` : undefined].filter(
        (p): p is string => typeof p === "string"
      );
      return { label: parts.join(" "), href: source.url };
    }
  }
}

export function resolvePeople<P extends PersonLike>(
  ids: string[] | undefined,
  pool: P[]
): P[] {
  if (!ids || ids.length === 0) return [];
  const byId = new Map(pool.map((p) => [p.id, p]));
  return ids
    .map((id) => byId.get(id))
    .filter((p): p is P => p !== undefined);
}
