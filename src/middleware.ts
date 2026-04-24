import { defineMiddleware } from "astro:middleware";
import { isDraftMode } from "~/lib/draft-auth";

export const onRequest = defineMiddleware((context, next) => {
  const pathname = new URL(context.request.url).pathname;

  // Guard all /admin routes — require draft mode
  if (pathname.startsWith("/admin")) {
    if (!isDraftMode(context.cookies)) {
      return new Response(null, {
        status: 302,
        headers: { Location: "/" },
      });
    }
  }

  return next();
});
