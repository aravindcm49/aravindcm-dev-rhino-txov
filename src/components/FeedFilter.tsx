import { useEffect, useMemo, useState } from "react";
import {
  filterFeed,
  type FeedFilterParams,
  type FeedItemLike,
} from "../lib/feedFilter";
import { feedItemTypes } from "../schemas/feed";

// The island mirrors the server-side FeedCard markup closely so that the
// filtered list reads identically to the initial SSR'd list. Keeping the
// card inline (vs. a shared component) avoids pulling Astro-specific logic
// into React land.

interface SerializedPerson {
  id: string;
  name: string;
}

export interface FeedFilterProps {
  items: FeedItemLike[];
  people: SerializedPerson[];
}

const SOURCE_KINDS = ["url", "tweet", "youtube", "paper", "book"] as const;
type SourceKind = (typeof SOURCE_KINDS)[number];

function readParams(search: string): FeedFilterParams {
  const sp = new URLSearchParams(search);
  const sortRaw = sp.get("sort");
  return {
    q: sp.get("q") ?? "",
    type: sp.getAll("type"),
    topic: sp.getAll("topic"),
    person: sp.getAll("person"),
    source: sp.getAll("source"),
    sort: sortRaw === "activityAt" ? "activityAt" : "publishedAt",
  };
}

function writeParams(params: FeedFilterParams): string {
  const sp = new URLSearchParams();
  if (params.q && params.q.trim().length > 0) sp.set("q", params.q);
  params.type?.forEach((v) => sp.append("type", v));
  params.topic?.forEach((v) => sp.append("topic", v));
  params.person?.forEach((v) => sp.append("person", v));
  params.source?.forEach((v) => sp.append("source", v));
  if (params.sort === "activityAt") sp.set("sort", "activityAt");
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

function toggle(values: string[] | undefined, value: string): string[] {
  const list = values ?? [];
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function sourceLabel(item: FeedItemLike): string | undefined {
  const s = item.source;
  if (!s) return undefined;
  switch (s.kind) {
    case "url":
      return [s.siteName ?? hostname(s.url), s.author].filter(Boolean).join(" · ");
    case "tweet":
      return s.authorHandle ? `${s.authorHandle} on ${hostname(s.url)}` : hostname(s.url);
    case "youtube":
      return s.channel ? `${s.channel} on ${hostname(s.url)}` : hostname(s.url);
    case "paper": {
      const authors = s.authors && s.authors.length > 0
        ? s.authors.length > 1
          ? `${s.authors[0]} et al.`
          : s.authors[0]
        : undefined;
      const idPart = s.arxivId ? `arXiv:${s.arxivId}` : s.doi ? `doi:${s.doi}` : undefined;
      return [authors, idPart].filter(Boolean).join(" · ") || hostname(s.url);
    }
    case "book":
      return ["Book", s.author ? `by ${s.author}` : ""].filter(Boolean).join(" ");
  }
}

function sourceHref(item: FeedItemLike): string | undefined {
  const s = item.source;
  if (!s) return undefined;
  return "url" in s ? s.url : undefined;
}

export default function FeedFilter({ items, people }: FeedFilterProps) {
  const [params, setParams] = useState<FeedFilterParams>({ sort: "publishedAt" });
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Initial hydration from URL; subscribe to back/forward.
  useEffect(() => {
    setParams(readParams(window.location.search));
    const onPop = () => setParams(readParams(window.location.search));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Push params into the URL whenever they change (replaceState: no history spam).
  useEffect(() => {
    const qs = writeParams(params);
    const next = `${window.location.pathname}${qs}${window.location.hash}`;
    if (next !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
      window.history.replaceState(null, "", next);
    }
  }, [params]);

  const filtered = useMemo(() => filterFeed(items, params), [items, params]);

  const peopleById = useMemo(
    () => new Map(people.map((p) => [p.id, p.name])),
    [people]
  );

  // Derive option sets from the items themselves so the panel only offers
  // filters that can actually match something.
  const { topicOptions, personOptions, sourceOptions } = useMemo(() => {
    const topics = new Set<string>();
    const persons = new Set<string>();
    const sources = new Set<SourceKind>();
    for (const it of items) {
      it.topics.forEach((t) => topics.add(t));
      (it.people ?? []).forEach((p) => persons.add(p));
      if (it.source) sources.add(it.source.kind);
    }
    return {
      topicOptions: [...topics].sort(),
      personOptions: [...persons].sort((a, b) =>
        (peopleById.get(a) ?? a).localeCompare(peopleById.get(b) ?? b)
      ),
      sourceOptions: SOURCE_KINDS.filter((k) => sources.has(k)),
    };
  }, [items, peopleById]);

  const activeCount =
    (params.type?.length ?? 0) +
    (params.topic?.length ?? 0) +
    (params.person?.length ?? 0) +
    (params.source?.length ?? 0) +
    (params.q?.trim() ? 1 : 0) +
    (params.sort === "activityAt" ? 1 : 0);

  function clearAll() {
    setParams({ sort: "publishedAt" });
  }

  const panel = (
    <div className="flex flex-col gap-6 text-sm">
      <div>
        <label
          htmlFor="feed-q"
          className="mb-1 block font-mono text-xs uppercase tracking-wider text-muted"
        >
          Search
        </label>
        <input
          id="feed-q"
          type="search"
          value={params.q ?? ""}
          onChange={(e) => setParams({ ...params, q: e.target.value })}
          placeholder="Title, summary, commentary"
          className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm text-text placeholder:text-muted focus:border-accent focus:outline-none"
        />
      </div>

      <FilterGroup label="Type">
        {feedItemTypes.map((t) => (
          <CheckboxRow
            key={t}
            label={t}
            checked={params.type?.includes(t) ?? false}
            onChange={() => setParams({ ...params, type: toggle(params.type, t) })}
          />
        ))}
      </FilterGroup>

      {topicOptions.length > 0 && (
        <FilterGroup label="Topic">
          {topicOptions.map((t) => (
            <CheckboxRow
              key={t}
              label={`#${t}`}
              checked={params.topic?.includes(t) ?? false}
              onChange={() => setParams({ ...params, topic: toggle(params.topic, t) })}
            />
          ))}
        </FilterGroup>
      )}

      {personOptions.length > 0 && (
        <FilterGroup label="Person">
          {personOptions.map((id) => (
            <CheckboxRow
              key={id}
              label={peopleById.get(id) ?? id}
              checked={params.person?.includes(id) ?? false}
              onChange={() => setParams({ ...params, person: toggle(params.person, id) })}
            />
          ))}
        </FilterGroup>
      )}

      {sourceOptions.length > 0 && (
        <FilterGroup label="Source">
          {sourceOptions.map((k) => (
            <CheckboxRow
              key={k}
              label={k}
              checked={params.source?.includes(k) ?? false}
              onChange={() => setParams({ ...params, source: toggle(params.source, k) })}
            />
          ))}
        </FilterGroup>
      )}

      <FilterGroup label="Sort">
        <RadioRow
          label="Published"
          checked={(params.sort ?? "publishedAt") === "publishedAt"}
          onChange={() => setParams({ ...params, sort: "publishedAt" })}
        />
        <RadioRow
          label="Activity"
          checked={params.sort === "activityAt"}
          onChange={() => setParams({ ...params, sort: "activityAt" })}
        />
      </FilterGroup>

      {activeCount > 0 && (
        <button
          type="button"
          onClick={clearAll}
          className="self-start text-xs text-muted underline decoration-border underline-offset-2 hover:text-text hover:decoration-accent"
        >
          Clear filters ({activeCount})
        </button>
      )}
    </div>
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_14rem]">
      <div className="max-w-[720px]">
        <header className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Feed</h1>
            <p className="mt-2 text-muted">
              A mixed stream of writing, references, and things worth saving.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDrawerOpen((v) => !v)}
            aria-expanded={drawerOpen}
            className="lg:hidden rounded-md border border-border px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-muted hover:text-text hover:border-accent"
          >
            Filter{activeCount > 0 ? ` (${activeCount})` : ""}
          </button>
        </header>

        {drawerOpen && (
          <div className="mb-8 rounded-md border border-border bg-surface p-4 lg:hidden">
            {panel}
          </div>
        )}

        {filtered.length === 0 ? (
          <p className="py-8 text-muted">No items match the current filters.</p>
        ) : (
          <ul className="border-t border-border">
            {filtered.map((entry) => (
              <FilteredCard
                key={entry.id}
                entry={entry}
                people={entry.people
                  ?.map((id) => ({ id, name: peopleById.get(id) ?? id }))
                  ?? []}
              />
            ))}
          </ul>
        )}
      </div>

      <aside
        aria-label="Filters"
        className="hidden lg:block sticky top-6 self-start"
      >
        {panel}
      </aside>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="mb-1 font-mono text-xs uppercase tracking-wider text-muted">
        {label}
      </legend>
      {children}
    </fieldset>
  );
}

function CheckboxRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-muted hover:text-text">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-3.5 w-3.5 accent-accent"
      />
      <span>{label}</span>
    </label>
  );
}

function RadioRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-muted hover:text-text">
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        className="h-3.5 w-3.5 accent-accent"
      />
      <span>{label}</span>
    </label>
  );
}

function FilteredCard({
  entry,
  people,
}: {
  entry: FeedItemLike;
  people: SerializedPerson[];
}) {
  const href = entry.hasPage ? `/feed/${entry.id}` : undefined;
  const srcLabel = sourceLabel(entry);
  const srcHref = sourceHref(entry);
  const Wrapper = href ? "a" : "div";
  const wrapperProps = href
    ? {
        href,
        className:
          "group block border-b border-border py-5 hover:border-accent transition-colors",
      }
    : { className: "block border-b border-border py-5" };

  return (
    <li>
      <Wrapper {...wrapperProps}>
        <div className="flex items-baseline justify-between gap-4">
          <h3
            className={
              "font-medium text-text" +
              (href ? " group-hover:text-accent transition-colors" : "")
            }
          >
            {entry.title}
          </h3>
          <span className="shrink-0 font-mono text-xs uppercase tracking-wide text-muted">
            {entry.type}
          </span>
        </div>

        {entry.summary && <p className="mt-2 text-sm text-muted">{entry.summary}</p>}
        {entry.commentary && <p className="mt-3 text-text">{entry.commentary}</p>}

        {srcLabel && (
          <p className="mt-3 font-mono text-xs text-muted">
            Source:{" "}
            {srcHref ? (
              <a
                href={srcHref}
                className="underline decoration-border underline-offset-2 hover:text-text hover:decoration-accent"
                rel="noopener"
                target="_blank"
              >
                {srcLabel}
              </a>
            ) : (
              <span>{srcLabel}</span>
            )}
          </p>
        )}

        {(people.length > 0 || entry.topics.length > 0) && (
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {people.map((p) => (
              <a
                key={p.id}
                href={`/feed?person=${p.id}`}
                className="rounded-full border border-border px-2 py-0.5 text-muted hover:text-text hover:border-accent transition-colors"
              >
                {p.name}
              </a>
            ))}
            {entry.topics.map((topic) => (
              <a
                key={topic}
                href={`/feed?topic=${topic}`}
                className="rounded-full bg-surface px-2 py-0.5 text-muted hover:text-text transition-colors"
              >
                #{topic}
              </a>
            ))}
          </div>
        )}
      </Wrapper>
    </li>
  );
}
