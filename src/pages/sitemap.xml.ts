import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { site } from "../data/site";

export const GET: APIRoute = async () => {
  const [feed, projects] = await Promise.all([
    getCollection("feed"),
    getCollection("projects"),
  ]);

  // Static routes
  const staticRoutes = ["/", "/feed", "/projects", "/about"];

  // Feed detail pages (hasPage: true, non-draft)
  const feedRoutes = feed
    .filter((entry) => entry.data.hasPage === true && entry.data.draft !== true)
    .map((entry) => `/feed/${entry.data.slug ?? entry.id}`);

  // Project detail pages (non-draft)
  const projectRoutes = projects
    .filter((entry) => entry.data.draft !== true)
    .map((entry) => `/projects/${entry.data.slug ?? entry.id}`);

  const allRoutes = [...staticRoutes, ...feedRoutes, ...projectRoutes];

  const urls = allRoutes
    .map((path) => `  <url><loc>${site.url}${path}</loc></url>`)
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
};
