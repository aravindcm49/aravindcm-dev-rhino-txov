import { useState } from "react";

interface FeedItem {
  id: string;
  slug: string;
  title: string;
  type: string;
  summary: string;
  commentary: string | null;
  content: string | null;
  sourceKind: string | null;
  sourceUrl: string | null;
  sourceMeta: Record<string, unknown> | null;
  topics: string[];
  people: string[];
  hasPage: boolean;
  draft: boolean;
  featured: boolean;
  publishedAt: string;
}

interface FeedItemsAdminProps {
  initialItems: FeedItem[];
}

const ITEM_TYPES = ["tweet", "link", "video", "paper", "book", "note"] as const;
const SOURCE_KINDS = ["url", "tweet", "youtube", "paper", "book"] as const;

export default function FeedItemsAdmin({ initialItems }: FeedItemsAdminProps) {
  const [items, setItems] = useState(initialItems);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<FeedItem>>({});

  function startEdit(item: FeedItem) {
    setEditingSlug(item.slug);
    setForm({ ...item });
  }

  function cancel() {
    setEditingSlug(null);
    setForm({});
  }

  async function save() {
    if (!editingSlug) return;
    const res = await fetch("/api/feed", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: editingSlug, ...form }),
    });
    if (res.ok) {
      const updated = await res.json();
      setItems(items.map((i) => (i.slug === editingSlug ? { ...i, ...updated } : i)));
      cancel();
    }
  }

  async function remove(slug: string) {
    if (!confirm("Delete this feed item?")) return;
    const res = await fetch("/api/feed", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });
    if (res.ok) {
      setItems(items.filter((i) => i.slug !== slug));
    }
  }

  function formatDate(iso: string): string {
    return new Date(iso).toISOString().split("T")[0];
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium">Feed Items ({items.length})</h2>

      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.slug}
            className="rounded-md border border-neutral-200 dark:border-neutral-800 p-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium">{item.title}</span>
                <span className="text-xs font-mono uppercase text-neutral-500">{item.type}</span>
                {item.draft && (
                  <span className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-1.5 py-0.5 rounded">
                    Draft
                  </span>
                )}
                {item.featured && (
                  <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-1.5 py-0.5 rounded">
                    Featured
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-neutral-500">{formatDate(item.publishedAt)}</span>
                <button
                  type="button"
                  onClick={() => startEdit(item)}
                  className="text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 underline"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => remove(item.slug)}
                  className="text-xs text-red-500 hover:text-red-700 underline"
                >
                  Delete
                </button>
              </div>
            </div>
            <p className="mt-1 text-sm text-neutral-500">{item.summary}</p>
          </div>
        ))}
      </div>

      {/* Edit form */}
      {editingSlug && (
        <section className="rounded-md border border-neutral-200 dark:border-neutral-800 p-4">
          <h3 className="text-lg font-medium mb-4">Edit: {form.title}</h3>

          <div className="grid gap-4 max-w-lg">
            <Field label="Slug" value={form.slug ?? ""} disabled />
            <Field label="Title" value={form.title ?? ""} onChange={(v) => setForm({ ...form, title: v })} />
            <Select
              label="Type"
              value={form.type ?? ""}
              options={[...ITEM_TYPES]}
              onChange={(v) => setForm({ ...form, type: v })}
            />
            <TextArea label="Summary" value={form.summary ?? ""} onChange={(v) => setForm({ ...form, summary: v })} />
            <TextArea label="Commentary" value={form.commentary ?? ""} onChange={(v) => setForm({ ...form, commentary: v || null })} />
            <TextArea label="Content (markdown)" value={form.content ?? ""} onChange={(v) => setForm({ ...form, content: v || null })} />
            <Select
              label="Source Kind"
              value={form.sourceKind ?? ""}
              options={["", ...SOURCE_KINDS]}
              onChange={(v) => setForm({ ...form, sourceKind: v || null })}
            />
            <Field label="Source URL" value={form.sourceUrl ?? ""} onChange={(v) => setForm({ ...form, sourceUrl: v || null })} />
            <Field
              label="Topics (comma-separated)"
              value={(form.topics ?? []).join(", ")}
              onChange={(v) => setForm({ ...form, topics: v.split(",").map((t) => t.trim()).filter(Boolean) })}
            />
            <Field
              label="People (comma-separated IDs)"
              value={(form.people ?? []).join(", ")}
              onChange={(v) => setForm({ ...form, people: v.split(",").map((t) => t.trim()).filter(Boolean) })}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.hasPage ?? false}
                onChange={(e) => setForm({ ...form, hasPage: e.target.checked })}
                className="accent-neutral-900 dark:accent-neutral-100"
              />
              Has page
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.draft ?? false}
                onChange={(e) => setForm({ ...form, draft: e.target.checked })}
                className="accent-neutral-900 dark:accent-neutral-100"
              />
              Draft
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.featured ?? false}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                className="accent-neutral-900 dark:accent-neutral-100"
              />
              Featured
            </label>

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={save}
                className="rounded-md bg-neutral-900 dark:bg-neutral-100 px-4 py-2 text-sm font-medium text-white dark:text-neutral-900 hover:opacity-90 transition-opacity"
              >
                Save
              </button>
              <button
                type="button"
                onClick={cancel}
                className="rounded-md border border-neutral-300 dark:border-neutral-700 px-4 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  disabled,
  placeholder,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="text-neutral-500 mb-1 block">{label}</span>
      <input
        type="text"
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-1.5 text-sm focus:border-neutral-500 focus:outline-none disabled:opacity-50"
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
        className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-1.5 text-sm focus:border-neutral-500 focus:outline-none"
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
        className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-1.5 text-sm focus:border-neutral-500 focus:outline-none"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt || "(none)"}
          </option>
        ))}
      </select>
    </label>
  );
}
