import { describe, expect, it } from "vitest";
import { resolveInitialTheme } from "./theme";

describe("resolveInitialTheme", () => {
  it("uses stored preference 'dark' when present", () => {
    expect(resolveInitialTheme("dark", false)).toBe("dark");
    expect(resolveInitialTheme("dark", true)).toBe("dark");
  });

  it("uses stored preference 'light' when present", () => {
    expect(resolveInitialTheme("light", true)).toBe("light");
    expect(resolveInitialTheme("light", false)).toBe("light");
  });

  it("falls back to system preference when nothing stored", () => {
    expect(resolveInitialTheme(null, true)).toBe("dark");
    expect(resolveInitialTheme(null, false)).toBe("light");
  });

  it("falls back to light when stored value is junk", () => {
    expect(resolveInitialTheme("purple", false)).toBe("light");
    expect(resolveInitialTheme("", true)).toBe("dark");
  });
});
