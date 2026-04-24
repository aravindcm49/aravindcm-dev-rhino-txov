import { marked } from "marked";

/**
 * Renders markdown content to HTML using `marked`.
 * Used for rendering DB-sourced feed items that store content as markdown.
 */
export function renderMarkdown(content: string): string {
  return marked.parse(content, { async: false }) as string;
}
