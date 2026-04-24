import { useCallback, useEffect, useRef, useState } from "react";
// Lazy twitter widgets loader (shared across instances)
let widgetsPromise: Promise<void> | null = null;
function loadWidgets(): Promise<void> {
  if (widgetsPromise) return widgetsPromise;
  widgetsPromise = new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://platform.twitter.com/widgets.js";
    script.async = true;
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
  return widgetsPromise;
}

interface OgResult {
  kind: "tweet" | "youtube" | "url";
  html?: string;
  authorName?: string;
  authorUrl?: string;
  title?: string;
  description?: string;
  siteName?: string;
  image?: string;
  videoId?: string;
  channel?: string;
}

const ITEM_TYPES = ["tweet", "link", "video", "paper", "book", "note"] as const;

function typeFromOgKind(kind: string): string {
  switch (kind) {
    case "tweet":
      return "tweet";
    case "youtube":
      return "video";
    default:
      return "link";
  }
}

function sourceKindFromType(type: string): string {
  switch (type) {
    case "tweet":
      return "tweet";
    case "video":
      return "youtube";
    case "paper":
      return "paper";
    case "book":
      return "book";
    default:
      return "url";
  }
}

export default function PublishPage() {
  // URL input
  const [url, setUrl] = useState("");
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [type, setType] = useState("link");
  const [summary, setSummary] = useState("");
  const [commentary, setCommentary] = useState("");
  const [content, setContent] = useState("");
  const [topics, setTopics] = useState("");
  const [people, setPeople] = useState("");
  const [hasPage, setHasPage] = useState(false);
  const [draft, setDraft] = useState(false);
  const [featured, setFeatured] = useState(false);

  // Preview
  const [ogResult, setOgResult] = useState<OgResult | null>(null);
  const tweetEmbedRef = useRef<HTMLDivElement>(null);

  // Topic autocomplete
  const [topicSuggestions, setTopicSuggestions] = useState<string[]>([]);
  const [showTopicDropdown, setShowTopicDropdown] = useState(false);

  // People promotion
  const [suggestedPerson, setSuggestedPerson] = useState<string | null>(null);
  const [promotingPerson, setPromotingPerson] = useState(false);

  // Markdown preview
  const [showMarkdownPreview, setShowMarkdownPreview] = useState(false);
  const [markdownHtml, setMarkdownHtml] = useState("");

  // Publishing state
  const [publishing, setPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  // Hydrate tweet embed when ogResult changes
  useEffect(() => {
    if (ogResult?.kind === "tweet" && ogResult.html && tweetEmbedRef.current) {
      loadWidgets().then(() => {
        if (window.twttr?.widgets?.load && tweetEmbedRef.current) {
          // Clear and re-insert the embed HTML
          tweetEmbedRef.current.innerHTML = ogResult.html ?? "";
          window.twttr.widgets.load(tweetEmbedRef.current);
        }
      });
    }
  }, [ogResult]);

  // Fetch metadata
  const fetchMeta = useCallback(async () => {
    if (!url.trim()) return;
    setFetching(true);
    setFetchError(null);
    setOgResult(null);

    try {
      const res = await fetch("/api/og", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Fetch failed" }));
        throw new Error(err.error ?? "Fetch failed");
      }

      const data: OgResult = await res.json();
      setOgResult(data);

      // Pre-fill form
      const detectedType = typeFromOgKind(data.kind);
      setType(detectedType);

      if (data.kind === "tweet") {
        setTitle(data.authorName ? `Tweet by ${data.authorName}` : "Tweet");
        setSummary("");
        // Auto-extract tweet author handle
        const handle = data.authorUrl?.split("/").pop() ?? "";
        if (handle) {
          setPeople(handle);
          // Auto-create person if they don't exist
          try {
            const personRes = await fetch(`/api/people?id=${encodeURIComponent(handle)}`);
            if (personRes.ok) {
              const existing = await personRes.json();
              if (!existing || existing.length === 0) {
                await fetch("/api/people", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    id: handle,
                    name: data.authorName ?? handle,
                    handle: `@${handle}`,
                    summary: "A mysterious human who tweets things worth saving.",
                    whyIFollow: "They said something smart once. Probably.",
                    topics: [],
                    links: { twitter: data.authorUrl },
                    featured: false,
                  }),
                });
              }
            }
          } catch { /* ignore */ }
        }
      } else if (data.kind === "youtube") {
        setTitle(data.title ?? "");
        setSummary(data.description ?? "");
      } else {
        setTitle(data.title ?? "");
        setSummary(data.description ?? "");
      }
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setFetching(false);
    }
  }, [url]);

  // Topic autocomplete
  const fetchTopics = useCallback(async (query: string) => {
    if (!query.trim()) {
      setTopicSuggestions([]);
      return;
    }
    try {
      const res = await fetch(`/api/topics?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setTopicSuggestions(data);
        setShowTopicDropdown(data.length > 0);
      }
    } catch {
      // ignore
    }
  }, []);

  // Check if person exists
  const checkPerson = useCallback(async (handle: string) => {
    const clean = handle.replace(/^@/, "").trim();
    if (!clean) {
      setSuggestedPerson(null);
      return;
    }
    try {
      const res = await fetch(`/api/people?id=${encodeURIComponent(clean)}`);
      if (res.ok) {
        const data = await res.json();
        if (!data || data.length === 0) {
          setSuggestedPerson(clean);
        } else {
          setSuggestedPerson(null);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Promote person
  const promotePerson = useCallback(async (handle: string) => {
    setPromotingPerson(true);
    try {
      const res = await fetch("/api/people", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: handle,
          name: handle,
          handle: `@${handle}`,
          summary: "A mysterious human who tweets things worth saving.",
          whyIFollow: "They said something smart once. Probably.",
          topics: [],
          links: {},
          featured: false,
        }),
      });
      if (res.ok) {
        setSuggestedPerson(null);
      }
    } catch {
      // ignore
    } finally {
      setPromotingPerson(false);
    }
  }, []);

  // Preview markdown
  const previewMarkdown = useCallback(async () => {
    if (!content.trim()) return;
    try {
      const { marked } = await import("marked");
      const html = marked.parse(content, { async: false }) as string;
      setMarkdownHtml(html);
      setShowMarkdownPreview(true);
    } catch {
      // ignore
    }
  }, [content]);

  // Publish
  const publish = useCallback(async () => {
    setPublishing(true);
    try {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      const topicsArray = topics
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const peopleArray = people
        .split(",")
        .map((p) => p.trim().replace(/^@/, ""))
        .filter(Boolean);

      const sourceMeta: Record<string, unknown> = {};
      if (ogResult) {
        if (ogResult.kind === "tweet" && ogResult.authorName) {
          sourceMeta.authorHandle = ogResult.authorUrl?.split("/").pop() ?? "";
        } else if (ogResult.kind === "youtube") {
          sourceMeta.videoId = ogResult.videoId;
          sourceMeta.channel = ogResult.channel;
        } else {
          sourceMeta.siteName = ogResult.siteName;
          sourceMeta.author = ogResult.authorName;
        }
      }

      const payload = {
        slug,
        title,
        type,
        summary,
        commentary: commentary || null,
        content: hasPage ? content : null,
        sourceKind: sourceKindFromType(type),
        sourceUrl: url || null,
        sourceMeta: Object.keys(sourceMeta).length > 0 ? sourceMeta : null,
        topics: topicsArray,
        people: peopleArray,
        hasPage,
        draft,
        featured,
        publishedAt: new Date().toISOString(),
      };

      const res = await fetch("/api/feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setPublishSuccess(true);
        // Clear form after short delay
        setTimeout(() => {
          setUrl("");
          setTitle("");
          setType("link");
          setSummary("");
          setCommentary("");
          setContent("");
          setTopics("");
          setPeople("");
          setHasPage(false);
          setDraft(false);
          setFeatured(false);
          setOgResult(null);
          setPublishSuccess(false);
        }, 2000);
      }
    } finally {
      setPublishing(false);
    }
  }, [url, title, type, summary, commentary, content, topics, people, hasPage, draft, featured, ogResult]);

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-2xl font-semibold">Publish</h1>

      {/* URL input */}
      <section className="space-y-3">
        <label className="block text-sm">
          <span className="text-neutral-500 mb-1 block">URL</span>
          <div className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchMeta()}
              placeholder="https://x.com/user/status/123"
              className="flex-1 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={fetchMeta}
              disabled={fetching || !url.trim()}
              className="rounded-md bg-neutral-900 dark:bg-neutral-100 px-4 py-2 text-sm font-medium text-white dark:text-neutral-900 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {fetching ? "Fetching..." : "Fetch"}
            </button>
          </div>
        </label>
        {fetchError && <p className="text-sm text-red-500">{fetchError}</p>}
      </section>

      {/* Preview */}
      {ogResult && (
        <section className="rounded-md border border-neutral-200 dark:border-neutral-800 p-4">
          <h3 className="text-sm font-medium text-neutral-500 mb-3">Preview</h3>
          {ogResult.kind === "tweet" && (
            <div ref={tweetEmbedRef} className="twitter-embed-container" />
          )}
          {ogResult.kind === "youtube" && (
            <div>
              <p className="font-medium">{ogResult.title}</p>
              <p className="text-sm text-neutral-500">{ogResult.channel}</p>
              {ogResult.videoId && (
                <img
                  src={`https://img.youtube.com/vi/${ogResult.videoId}/mqdefault.jpg`}
                  alt={ogResult.title ?? "YouTube video"}
                  className="mt-2 rounded-md max-w-xs"
                />
              )}
            </div>
          )}
          {ogResult.kind === "url" && (
            <div>
              {ogResult.image && (
                <img
                  src={ogResult.image}
                  alt={ogResult.title ?? ""}
                  className="rounded-md max-w-xs mb-2"
                />
              )}
              <p className="font-medium">{ogResult.title}</p>
              <p className="text-sm text-neutral-500">{ogResult.description}</p>
              {ogResult.siteName && (
                <p className="text-xs text-neutral-400 mt-1">{ogResult.siteName}</p>
              )}
            </div>
          )}
        </section>
      )}

      {/* Form */}
      <section className="space-y-4">
        <Field label="Title" value={title} onChange={setTitle} />
        <Select label="Type" value={type} options={[...ITEM_TYPES]} onChange={setType} />
        <TextArea label="Summary" value={summary} onChange={setSummary} />
        <TextArea label="Commentary" value={commentary} onChange={setCommentary} />

        {/* Topics with autocomplete */}
        <div className="relative">
          <Field
            label="Topics (comma-separated)"
            value={topics}
            onChange={(v) => {
              setTopics(v);
              const last = v.split(",").pop()?.trim() ?? "";
              fetchTopics(last);
            }}
            onBlur={() => setTimeout(() => setShowTopicDropdown(false), 200)}
          />
          {showTopicDropdown && topicSuggestions.length > 0 && (
            <div className="absolute z-10 mt-1 w-full rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg max-h-40 overflow-auto">
              {topicSuggestions.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    const parts = topics.split(",");
                    parts[parts.length - 1] = ` ${t}`;
                    setTopics(parts.join(",").trim());
                    setShowTopicDropdown(false);
                  }}
                  className="block w-full text-left px-3 py-1.5 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* People with inline promotion */}
        <div>
          <Field
            label="People (comma-separated handles)"
            value={people}
            onChange={(v) => {
              setPeople(v);
              const last = v.split(",").pop()?.trim() ?? "";
              checkPerson(last);
            }}
          />
          {suggestedPerson && (
            <div className="mt-2 flex items-center gap-2 text-sm">
              <span className="text-neutral-500">
                Add @{suggestedPerson} to your collection?
              </span>
              <button
                type="button"
                onClick={() => promotePerson(suggestedPerson)}
                disabled={promotingPerson}
                className="text-xs underline text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 disabled:opacity-50"
              >
                {promotingPerson ? "Adding..." : "Promote"}
              </button>
            </div>
          )}
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap gap-4">
          <Toggle label="Has page" checked={hasPage} onChange={setHasPage} />
          <Toggle label="Draft" checked={draft} onChange={setDraft} />
          <Toggle label="Featured" checked={featured} onChange={setFeatured} />
        </div>

        {/* Markdown editor */}
        {hasPage && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-500">Content (markdown)</span>
              <button
                type="button"
                onClick={() => {
                  if (showMarkdownPreview) {
                    setShowMarkdownPreview(false);
                  } else {
                    previewMarkdown();
                  }
                }}
                className="text-xs underline text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              >
                {showMarkdownPreview ? "Edit" : "Preview"}
              </button>
            </div>
            {showMarkdownPreview ? (
              <div
                className="prose prose-sm prose-neutral max-w-none dark:prose-invert rounded-md border border-neutral-200 dark:border-neutral-800 p-4"
                dangerouslySetInnerHTML={{ __html: markdownHtml }}
              />
            ) : (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm font-mono focus:border-neutral-500 focus:outline-none"
                placeholder="# Your markdown here..."
              />
            )}
          </div>
        )}

        {/* Publish button */}
        <div className="flex items-center gap-4 pt-2">
          <button
            type="button"
            onClick={publish}
            disabled={publishing || !title.trim()}
            className="rounded-md bg-neutral-900 dark:bg-neutral-100 px-6 py-2.5 text-sm font-medium text-white dark:text-neutral-900 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {publishing ? "Publishing..." : "Publish"}
          </button>
          {publishSuccess && (
            <span className="text-sm text-green-600 dark:text-green-400">
              Published successfully!
            </span>
          )}
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  placeholder?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="text-neutral-500 mb-1 block">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="text-neutral-500 mb-1 block">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
      />
    </label>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="text-neutral-500 mb-1 block">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-neutral-900 dark:accent-neutral-100"
      />
      {label}
    </label>
  );
}
