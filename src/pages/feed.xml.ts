import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { buildRssXml } from "../lib/rss";
import { site } from "../data/site";

export const GET: APIRoute = async () => {
  const feed = await getCollection("feed");
  const rssXml = buildRssXml(
    feed,
    site.url,
    `${site.title} — Feed`,
    site.description
  );

  return new Response(rssXml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
};
