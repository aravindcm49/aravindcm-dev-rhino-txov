export const prerender = false;

import type { APIRoute } from "astro";
import { fetchOgMetadata } from "~/lib/og";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const url = body?.url;

    if (!url || typeof url !== "string") {
      return new Response(JSON.stringify({ error: "Missing or invalid 'url' field" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return new Response(JSON.stringify({ error: "Invalid URL format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const metadata = await fetchOgMetadata(url);
    return new Response(JSON.stringify(metadata), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
