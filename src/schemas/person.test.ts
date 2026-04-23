import { describe, expect, it } from "vitest";
import { personSchema } from "./person";

const validBase = {
  name: "Jane Doe",
  summary: "Writer and researcher",
  whyIFollow: "Sharp essays on systems design",
  topics: ["systems"],
  featured: false,
};

describe("personSchema", () => {
  it("parses a minimally-valid person", () => {
    const result = personSchema.safeParse(validBase);
    expect(result.success).toBe(true);
  });

  it("rejects when name is missing", () => {
    const { name, ...rest } = validBase;
    const result = personSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects when whyIFollow is missing", () => {
    const { whyIFollow, ...rest } = validBase;
    const result = personSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("accepts optional links with known kinds", () => {
    const result = personSchema.safeParse({
      ...validBase,
      links: {
        website: "https://example.com",
        github: "https://github.com/janedoe",
      },
    });
    expect(result.success).toBe(true);
  });
});
