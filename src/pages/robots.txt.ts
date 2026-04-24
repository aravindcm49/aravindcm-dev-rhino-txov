import type { APIRoute } from "astro";
import { site } from "../data/site";

export const GET: APIRoute = () => {
  const content = `User-agent: *
Allow: /

Sitemap: ${site.url}/sitemap.xml`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};
