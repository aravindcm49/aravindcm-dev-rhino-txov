import { describe, expect, it, vi } from "vitest";
import {
  getAllFeedItems,
  getFeedItemBySlug,
  getPublishedFeedItems,
  createFeedItem,
  updateFeedItem,
  deleteFeedItem,
  type Db,
} from "./feed-items";

// --- Mock helpers ---

function makeRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "00000000-0000-0000-0000-000000000001",
    slug: "test-item",
    title: "Test Item",
    type: "link",
    summary: "A test item",
    commentary: null,
    content: null,
    sourceKind: "url",
    sourceUrl: "https://example.com",
    sourceMeta: null,
    topics: [],
    people: [],
    hasPage: false,
    draft: false,
    featured: false,
    publishedAt: new Date("2025-01-01"),
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
    ...overrides,
  };
}

function makeDb(resultRows: unknown[]) {
  const returningResult = Promise.resolve(resultRows);
  const limitResult = Promise.resolve(resultRows);

  const chainable = {
    where: vi.fn().mockReturnValue({
      limit: vi.fn().mockReturnValue(limitResult),
      orderBy: vi.fn().mockReturnValue(limitResult),
      returning: vi.fn().mockReturnValue(returningResult),
    }),
    orderBy: vi.fn().mockReturnValue(Promise.resolve(resultRows)),
    returning: vi.fn().mockReturnValue(returningResult),
    limit: vi.fn().mockReturnValue(limitResult),
    then: (resolve: (v: unknown) => void) =>
      resolve(resultRows),
  };

  return {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue(chainable),
    }),
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockReturnValue(returningResult),
      }),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockReturnValue(returningResult),
        }),
      }),
    }),
    delete: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        returning: vi.fn().mockReturnValue(returningResult),
      }),
    }),
  } as unknown as Db;
}

describe("feed-items CRUD", () => {
  describe("getAllFeedItems", () => {
    it("returns all feed items ordered by publishedAt desc", async () => {
      const rows = [makeRow({ slug: "a" }), makeRow({ slug: "b" })];
      const db = makeDb(rows);
      const result = await getAllFeedItems(db);
      expect(result).toEqual(rows);
      expect(db.select).toHaveBeenCalled();
    });
  });

  describe("getFeedItemBySlug", () => {
    it("returns the item when found", async () => {
      const row = makeRow({ slug: "my-post" });
      const db = makeDb([row]);
      const result = await getFeedItemBySlug(db, "my-post");
      expect(result).toEqual(row);
    });

    it("returns undefined when not found", async () => {
      const db = makeDb([]);
      const result = await getFeedItemBySlug(db, "missing");
      expect(result).toBeUndefined();
    });
  });

  describe("getPublishedFeedItems", () => {
    it("returns only non-draft items", async () => {
      const rows = [makeRow({ draft: false })];
      const db = makeDb(rows);
      const result = await getPublishedFeedItems(db);
      expect(result).toEqual(rows);
    });
  });

  describe("createFeedItem", () => {
    it("inserts and returns the new item", async () => {
      const row = makeRow({ slug: "new-post", title: "New Post" });
      const db = makeDb([row]);
      const result = await createFeedItem(db, {
        slug: "new-post",
        title: "New Post",
        type: "link",
        summary: "A new post",
      });
      expect(result).toEqual(row);
      expect(db.insert).toHaveBeenCalled();
    });
  });

  describe("updateFeedItem", () => {
    it("updates and returns the modified item", async () => {
      const row = makeRow({ slug: "post", title: "Updated Title" });
      const db = makeDb([row]);
      const result = await updateFeedItem(db, "post", {
        title: "Updated Title",
      });
      expect(result).toEqual(row);
      expect(db.update).toHaveBeenCalled();
    });
  });

  describe("deleteFeedItem", () => {
    it("returns true when a row is deleted", async () => {
      const db = makeDb([makeRow()]);
      const result = await deleteFeedItem(db, "test-item");
      expect(result).toBe(true);
      expect(db.delete).toHaveBeenCalled();
    });

    it("returns false when no row matches", async () => {
      const db = makeDb([]);
      const result = await deleteFeedItem(db, "missing");
      expect(result).toBe(false);
    });
  });
});
