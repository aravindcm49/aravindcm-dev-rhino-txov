import { describe, expect, it } from "vitest";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const pagesDir = join(process.cwd(), "src", "pages");

describe("scaffold", () => {
  it("has all four top-level route files", () => {
    const entries = readdirSync(pagesDir).filter((f) => statSync(join(pagesDir, f)).isFile());
    expect(entries).toEqual(
      expect.arrayContaining(["index.astro", "feed.astro", "projects.astro", "about.astro"])
    );
  });
});
