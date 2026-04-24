export const prerender = false;

import type { APIRoute } from "astro";
import { isValidDraftSecret, setDraftCookie } from "~/lib/draft-auth";

export const GET: APIRoute = ({ cookies, redirect, url }) => {
  const secret = url.searchParams.get("secret");

  if (!isValidDraftSecret(secret)) {
    return new Response(JSON.stringify({ error: "Invalid or missing secret" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  setDraftCookie((name, value, opts) => cookies.set(name, value, opts as Parameters<typeof cookies.set>[2]));

  return redirect("/admin", 302);
};
