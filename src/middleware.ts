import { defineMiddleware } from "astro:middleware";
import { isDraftMode, isValidDraftSecret, setDraftCookie } from "~/lib/draft-auth";

export const onRequest = defineMiddleware((context, next) => {
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  // Guard all /admin routes — require draft mode
  if (pathname.startsWith("/admin")) {
    // Allow secret as query param on any /admin URL (convenience)
    const secret = url.searchParams.get("secret");
    if (!isDraftMode(context.cookies) && isValidDraftSecret(secret)) {
      // Set cookie and continue (don't redirect, just authorize)
      setDraftCookie((name, value, opts) =>
        context.cookies.set(name, value, opts as Parameters<typeof context.cookies.set>[2]),
      );
    }

    if (!isDraftMode(context.cookies)) {
      return new Response(null, {
        status: 302,
        headers: { Location: "/" },
      });
    }
  }

  return next();
});
