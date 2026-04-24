import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  isDraftMode,
  setDraftCookie,
  isValidDraftSecret,
  requireDraftMode,
} from "./draft-auth";

// --- isDraftMode ---

describe("isDraftMode", () => {
  it("returns true when draft_mode cookie is 'true'", () => {
    const cookies = { get: vi.fn().mockReturnValue({ value: "true" }) };
    expect(isDraftMode(cookies)).toBe(true);
  });

  it("returns false when draft_mode cookie is missing", () => {
    const cookies = { get: vi.fn().mockReturnValue(undefined) };
    expect(isDraftMode(cookies)).toBe(false);
  });

  it("returns false when draft_mode cookie is not 'true'", () => {
    const cookies = { get: vi.fn().mockReturnValue({ value: "false" }) };
    expect(isDraftMode(cookies)).toBe(false);
  });
});

// --- setDraftCookie ---

describe("setDraftCookie", () => {
  it("calls setCookie with correct params", () => {
    const setCookie = vi.fn();
    setDraftCookie(setCookie);
    expect(setCookie).toHaveBeenCalledWith("draft_mode", "true", expect.objectContaining({
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    }));
  });
});

// --- isValidDraftSecret ---

describe("isValidDraftSecret", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns true when secret matches DRAFT_MODE_SECRET", () => {
    process.env.DRAFT_MODE_SECRET = "my-secret";
    expect(isValidDraftSecret("my-secret")).toBe(true);
  });

  it("returns false when secret does not match", () => {
    process.env.DRAFT_MODE_SECRET = "my-secret";
    expect(isValidDraftSecret("wrong")).toBe(false);
  });

  it("returns false when secret is null", () => {
    process.env.DRAFT_MODE_SECRET = "my-secret";
    expect(isValidDraftSecret(null)).toBe(false);
  });

  it("returns false when DRAFT_MODE_SECRET is not set", () => {
    delete process.env.DRAFT_MODE_SECRET;
    expect(isValidDraftSecret("anything")).toBe(false);
  });
});

// --- requireDraftMode ---

describe("requireDraftMode", () => {
  it("returns null when draft mode is active (authorized)", () => {
    const cookies = { get: vi.fn().mockReturnValue({ value: "true" }) };
    expect(requireDraftMode(cookies)).toBeNull();
  });

  it("returns 401 Response when draft mode is not active", () => {
    const cookies = { get: vi.fn().mockReturnValue(undefined) };
    const response = requireDraftMode(cookies);
    expect(response).toBeInstanceOf(Response);
    expect(response!.status).toBe(401);
  });
});
