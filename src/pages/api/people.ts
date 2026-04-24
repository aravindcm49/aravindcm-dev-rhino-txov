export const prerender = false;

import type { APIRoute } from "astro";
import { requireDraftMode } from "~/lib/draft-auth";
import { createPerson, updatePerson, deletePerson, getPersonById } from "~/lib/db/people";
import { db } from "~/lib/db/index";

export const GET: APIRoute = async ({ url, cookies }) => {
  const guard = requireDraftMode(cookies);
  if (guard) return guard;

  const id = url.searchParams.get("id");
  if (!id) {
    return new Response(JSON.stringify({ error: "Missing 'id'" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const person = await getPersonById(db, id);
  return new Response(JSON.stringify(person ?? null), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const POST: APIRoute = async ({ request, cookies }) => {
  const guard = requireDraftMode(cookies);
  if (guard) return guard;

  try {
    const body = await request.json();
    const person = await createPerson(db, body);
    return new Response(JSON.stringify(person), {
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
    const { id, ...updates } = body;
    if (!id) {
      return new Response(JSON.stringify({ error: "Missing 'id'" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const person = await updatePerson(db, id, updates);
    if (!person) {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify(person), {
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
    const { id } = body;
    if (!id) {
      return new Response(JSON.stringify({ error: "Missing 'id'" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const deleted = await deletePerson(db, id);
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
