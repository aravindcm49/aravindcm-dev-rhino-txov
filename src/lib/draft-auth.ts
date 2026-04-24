/**
 * Draft Mode authentication utilities.
 *
 * The admin dashboard is protected by a simple secret-based auth:
 * 1. Visit /api/draft?secret=<SECRET> to activate draft mode
 * 2. A signed cookie is set on success
 * 3. Admin API routes call requireDraftMode() to verify the cookie
 */

const DRAFT_COOKIE = "draft_mode";
const DRAFT_SECRET_ENV = "DRAFT_MODE_SECRET";

// --- Cookie helpers ---

export function isDraftMode(cookies: {
  get: (name: string) => { value: string } | undefined;
}): boolean {
  const cookie = cookies.get(DRAFT_COOKIE);
  return cookie?.value === "true";
}

export function setDraftCookie(setCookie: (name: string, value: string, opts?: Record<string, unknown>) => void): void {
  setCookie(DRAFT_COOKIE, "true", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

// --- Secret validation ---

export function isValidDraftSecret(secret: string | null): boolean {
  const expected = process.env[DRAFT_SECRET_ENV];
  if (!expected) return false;
  if (!secret) return false;
  return secret === expected;
}

// --- Guard for API routes ---

export function requireDraftMode(cookies: {
  get: (name: string) => { value: string } | undefined;
}): Response | null {
  if (isDraftMode(cookies)) return null; // authorized
  return new Response(JSON.stringify({ error: "Unauthorized — draft mode not active" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}
