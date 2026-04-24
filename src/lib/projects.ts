import type { Project, ProjectStatus } from "../schemas/project";

/**
 * Shape the helper needs from a content-layer entry.
 */
export interface ProjectEntryLike {
  id: string;
  data: Project;
}

/**
 * Returns true when a project should be displayed:
 * - draft is false (or absent, since the schema defaults it to false)
 */
export function isPublished(entry: ProjectEntryLike): boolean {
  return entry.data.draft !== true;
}

/**
 * Returns the CSS classes for a project status badge.
 */
export function statusBadgeClass(status: ProjectStatus): string {
  const base = "inline-block rounded-full px-2 py-0.5 font-mono text-xs uppercase tracking-wide";
  switch (status) {
    case "done":
      return `${base} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
    case "active":
      return `${base} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`;
    case "paused":
      return `${base} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`;
    case "archived":
      return `${base} bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200`;
  }
}

/**
 * Returns the project links that are present, as an array of { label, href }.
 */
export function getProjectLinks(
  links: Project["links"]
): { label: string; href: string }[] {
  const result: { label: string; href: string }[] = [];
  if (links.demo) result.push({ label: "Demo", href: links.demo });
  if (links.github) result.push({ label: "GitHub", href: links.github });
  if (links.article) result.push({ label: "Article", href: links.article });
  if (links.docs) result.push({ label: "Docs", href: links.docs });
  return result;
}

/**
 * Returns the cover image for a project, if one exists.
 */
export function getCoverImage(
  images: Project["images"]
): { src: string; alt: string } | undefined {
  if (!images) return undefined;
  const cover = images.find((img) => img.kind === "cover");
  return cover ? { src: cover.src, alt: cover.alt } : undefined;
}
