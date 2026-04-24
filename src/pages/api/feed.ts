export const prerender = false;

import type { APIRoute } from "astro";
import { requireDraftMode } from "~/lib/draft-auth";
import { createFeedItem, updateFeedItem, deleteFeedItem } from "~/lib/db/feed-items";
import { db } from "~/lib/db/index";

export const POST: APIRoute = async ({ request, cookies }) => {
  const guard = requireDraftMode(cookies);
  if (guard) return guard;

  try {
    const body = await request.json();
    const item = await createFeedItem(db, body);
    return new Response(JSON.stringify(item), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const PATCH: APIRoute = async ({ request, cookies }) => {
  const guard = requireDraftMode(cookies);
  if (guard) return guard;

  try {
    const body = await request.json();
    const { slug, ...updates } = body;
    if (!slug) {
      return new Response(JSON.stringify({ error: "Missing 'slug'" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const item = await updateFeedItem(db, slug, updates);
    if (!item) {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify(item), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const DELETE: APIRoute = async ({ request, cookies }) => {
  const guard = requireDraftMode(cookies);
  if (guard) return guard;

  try {
    const body = await request.json();
    const { slug } = body;
    if (!slug) {
      return new Response(JSON.stringify({ error: "Missing 'slug'" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const deleted = await deleteFeedItem(db, slug);
    if (!deleted) {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
};
