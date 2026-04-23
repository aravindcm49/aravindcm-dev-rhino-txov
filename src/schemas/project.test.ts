import { describe, expect, it } from "vitest";
import { projectSchema } from "./project";

const validBase = {
  title: "Test project",
  summary: "A thing I built",
  commentary: "Why I built it",
  topics: ["tools"],
  status: "done" as const,
  featured: false,
  draft: false,
};

describe("projectSchema", () => {
  it("parses a minimally-valid project", () => {
    const result = projectSchema.safeParse(validBase);
    expect(result.success).toBe(true);
  });

  it("rejects an unknown status", () => {
    const result = projectSchema.safeParse({ ...validBase, status: "retired" });
    expect(result.success).toBe(false);
  });

  it("accepts all status values", () => {
    for (const status of ["done", "active", "paused", "archived"] as const) {
      const result = projectSchema.safeParse({ ...validBase, status });
      expect(result.success).toBe(true);
    }
  });

  it("rejects when title is missing", () => {
    const { title, ...rest } = validBase;
    const result = projectSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("accepts an optional readme.source=github with githubRepo", () => {
    const result = projectSchema.safeParse({
      ...validBase,
      readme: { source: "github", githubRepo: "aravindcm49/foo" },
    });
    expect(result.success).toBe(true);
  });

  it("rejects readme with an unknown source", () => {
    const result = projectSchema.safeParse({
      ...validBase,
      readme: { source: "gitlab" },
    });
    expect(result.success).toBe(false);
  });
});
