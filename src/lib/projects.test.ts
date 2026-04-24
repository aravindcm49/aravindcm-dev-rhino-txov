import { describe, expect, it } from "vitest";
import {
  isPublished,
  statusBadgeClass,
  getProjectLinks,
  getCoverImage,
  type ProjectEntryLike,
} from "./projects";

function makeEntry(
  overrides: Partial<ProjectEntryLike["data"]> & { id?: string } = {}
): ProjectEntryLike {
  return {
    id: overrides.id ?? "test-project",
    data: {
      title: "Test Project",
      summary: "A test project.",
      status: "active",
      draft: false,
      featured: false,
      topics: [],
      links: {},
      ...overrides,
    },
  };
}

describe("isPublished", () => {
  it("returns true when draft is false", () => {
    expect(isPublished(makeEntry())).toBe(true);
  });

  it("returns true when draft is absent (defaults to false)", () => {
    expect(isPublished(makeEntry({ draft: undefined as unknown as boolean }))).toBe(true);
  });

  it("returns false when draft is true", () => {
    expect(isPublished(makeEntry({ draft: true }))).toBe(false);
  });
});

describe("statusBadgeClass", () => {
  it("returns a class string for each status", () => {
    const statuses = ["done", "active", "paused", "archived"] as const;
    for (const status of statuses) {
      const cls = statusBadgeClass(status);
      expect(cls).toContain("inline-block");
      expect(cls).toContain("rounded-full");
    }
  });

  it("includes green for done", () => {
    expect(statusBadgeClass("done")).toContain("green");
  });

  it("includes blue for active", () => {
    expect(statusBadgeClass("active")).toContain("blue");
  });

  it("includes yellow for paused", () => {
    expect(statusBadgeClass("paused")).toContain("yellow");
  });

  it("includes gray for archived", () => {
    expect(statusBadgeClass("archived")).toContain("gray");
  });
});

describe("getProjectLinks", () => {
  it("returns empty array when no links are present", () => {
    expect(getProjectLinks({})).toEqual([]);
  });

  it("returns demo link", () => {
    const links = getProjectLinks({ demo: "https://demo.example.com" });
    expect(links).toEqual([{ label: "Demo", href: "https://demo.example.com" }]);
  });

  it("returns github link", () => {
    const links = getProjectLinks({ github: "https://github.com/test" });
    expect(links).toEqual([{ label: "GitHub", href: "https://github.com/test" }]);
  });

  it("returns all present links in correct order", () => {
    const links = getProjectLinks({
      demo: "https://demo.example.com",
      github: "https://github.com/test",
      article: "https://blog.example.com/post",
      docs: "https://docs.example.com",
    });
    expect(links).toHaveLength(4);
    expect(links.map((l) => l.label)).toEqual(["Demo", "GitHub", "Article", "Docs"]);
  });

  it("skips undefined links", () => {
    const links = getProjectLinks({
      github: "https://github.com/test",
      article: undefined,
    });
    expect(links).toHaveLength(1);
    expect(links[0].label).toBe("GitHub");
  });
});

describe("getCoverImage", () => {
  it("returns undefined when images is undefined", () => {
    expect(getCoverImage(undefined)).toBeUndefined();
  });

  it("returns undefined when images is empty", () => {
    expect(getCoverImage([])).toBeUndefined();
  });

  it("returns undefined when no cover image exists", () => {
    const images = [{ src: "/img.png", alt: "Screenshot", kind: "screenshot" as const }];
    expect(getCoverImage(images)).toBeUndefined();
  });

  it("returns the cover image when one exists", () => {
    const images = [
      { src: "/shot.png", alt: "Screenshot", kind: "screenshot" as const },
      { src: "/cover.png", alt: "Cover", kind: "cover" as const },
    ];
    expect(getCoverImage(images)).toEqual({ src: "/cover.png", alt: "Cover" });
  });

  it("returns the first cover image when multiple exist", () => {
    const images = [
      { src: "/cover1.png", alt: "Cover 1", kind: "cover" as const },
      { src: "/cover2.png", alt: "Cover 2", kind: "cover" as const },
    ];
    expect(getCoverImage(images)).toEqual({ src: "/cover1.png", alt: "Cover 1" });
  });
});
