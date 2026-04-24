import { useState } from "react";

interface Person {
  id: string;
  name: string;
  handle: string | null;
  summary: string;
  whyIFollow: string;
  avatarUrl: string | null;
  topics: string[];
  links: Record<string, string> | null;
  featured: boolean;
}

interface PeopleAdminProps {
  initialPeople: Person[];
  suggestedHandles: string[];
}

export default function PeopleAdmin({ initialPeople, suggestedHandles }: PeopleAdminProps) {
  const [people, setPeople] = useState(initialPeople);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [suggested, setSuggested] = useState(suggestedHandles);

  const emptyPerson: Omit<Person, "id"> = {
    name: "",
    handle: "",
    summary: "",
    whyIFollow: "",
    avatarUrl: "",
    topics: [],
    links: {},
    featured: false,
  };

  const [form, setForm] = useState<Partial<Person>>({});

  function startEdit(person: Person) {
    setEditingId(person.id);
    setCreating(false);
    setForm({ ...person });
  }

  function startCreate(handle?: string) {
    setEditingId(null);
    setCreating(true);
    setForm({
      ...emptyPerson,
      id: handle ?? "",
      handle: handle ? `@${handle}` : "",
    });
  }

  function cancel() {
    setEditingId(null);
    setCreating(false);
    setForm({});
  }

  async function save() {
    if (creating) {
      const res = await fetch("/api/people", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const person = await res.json();
        setPeople([...people, person].sort((a, b) => a.name.localeCompare(b.name)));
        setSuggested(suggested.filter((h) => h !== form.id));
        cancel();
      }
    } else if (editingId) {
      const res = await fetch("/api/people", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, ...form }),
      });
      if (res.ok) {
        const updated = await res.json();
        setPeople(people.map((p) => (p.id === editingId ? updated : p)));
        cancel();
      }
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this person?")) return;
    const res = await fetch("/api/people", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setPeople(people.filter((p) => p.id !== id));
    }
  }

  const isEditing = editingId !== null || creating;

  return (
    <div className="space-y-8">
      {/* People list */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">Promoted People ({people.length})</h2>
          <button
            type="button"
            onClick={() => startCreate()}
            className="rounded-md bg-neutral-900 dark:bg-neutral-100 px-3 py-1.5 text-sm font-medium text-white dark:text-neutral-900 hover:opacity-90 transition-opacity"
          >
            Add person
          </button>
        </div>

        <div className="space-y-2">
          {people.map((person) => (
            <div
              key={person.id}
              className="rounded-md border border-neutral-200 dark:border-neutral-800 p-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">{person.name}</span>
                  {person.handle && (
                    <span className="ml-2 text-sm text-neutral-500">{person.handle}</span>
                  )}
                  {person.featured && (
                    <span className="ml-2 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-1.5 py-0.5 rounded">
                      Featured
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(person)}
                    className="text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(person.id)}
                    className="text-xs text-red-500 hover:text-red-700 underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="mt-1 text-sm text-neutral-500">{person.summary}</p>
              {person.topics.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {person.topics.map((t) => (
                    <span
                      key={t}
                      className="text-xs bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Suggested handles */}
      {suggested.length > 0 && (
        <section>
          <h2 className="text-lg font-medium mb-4">Suggested Handles ({suggested.length})</h2>
          <p className="text-sm text-neutral-500 mb-3">
            Handles extracted from feed items that are not yet promoted.
          </p>
          <div className="flex flex-wrap gap-2">
            {suggested.map((handle) => (
              <button
                key={handle}
                type="button"
                onClick={() => startCreate(handle)}
                className="rounded-md border border-neutral-200 dark:border-neutral-800 px-3 py-1.5 text-sm hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors"
              >
                @{handle} — Promote
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Edit/Create form */}
      {isEditing && (
        <section className="rounded-md border border-neutral-200 dark:border-neutral-800 p-4">
          <h2 className="text-lg font-medium mb-4">
            {creating ? "New Person" : `Edit: ${form.name}`}
          </h2>

          <div className="grid gap-4 max-w-lg">
            {creating && (
              <Field label="ID (slug)" value={form.id ?? ""} onChange={(v) => setForm({ ...form, id: v })} />
            )}
            <Field label="Name" value={form.name ?? ""} onChange={(v) => setForm({ ...form, name: v })} />
            <Field label="Handle" value={form.handle ?? ""} onChange={(v) => setForm({ ...form, handle: v })} placeholder="@username" />
            <TextArea label="Summary" value={form.summary ?? ""} onChange={(v) => setForm({ ...form, summary: v })} />
            <TextArea label="Why I Follow" value={form.whyIFollow ?? ""} onChange={(v) => setForm({ ...form, whyIFollow: v })} />
            <Field label="Avatar URL" value={form.avatarUrl ?? ""} onChange={(v) => setForm({ ...form, avatarUrl: v })} />
            <Field
              label="Topics (comma-separated)"
              value={(form.topics ?? []).join(", ")}
              onChange={(v) => setForm({ ...form, topics: v.split(",").map((t) => t.trim()).filter(Boolean) })}
            />
            <Field
              label="Links — website"
              value={form.links?.website ?? ""}
              onChange={(v) => setForm({ ...form, links: { ...(form.links ?? {}), website: v } })}
            />
            <Field
              label="Links — github"
              value={form.links?.github ?? ""}
              onChange={(v) => setForm({ ...form, links: { ...(form.links ?? {}), github: v } })}
            />
            <Field
              label="Links — twitter"
              value={form.links?.twitter ?? ""}
              onChange={(v) => setForm({ ...form, links: { ...(form.links ?? {}), twitter: v } })}
            />
            <Field
              label="Links — youtube"
              value={form.links?.youtube ?? ""}
              onChange={(v) => setForm({ ...form, links: { ...(form.links ?? {}), youtube: v } })}
            />
            <Field
              label="Links — linkedin"
              value={form.links?.linkedin ?? ""}
              onChange={(v) => setForm({ ...form, links: { ...(form.links ?? {}), linkedin: v } })}
            />
            <Field
              label="Links — newsletter"
              value={form.links?.newsletter ?? ""}
              onChange={(v) => setForm({ ...form, links: { ...(form.links ?? {}), newsletter: v } })}
            />
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
                {creating ? "Create" : "Save"}
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
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="text-neutral-500 mb-1 block">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-1.5 text-sm focus:border-neutral-500 focus:outline-none"
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
