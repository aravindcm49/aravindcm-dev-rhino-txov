import { describe, expect, it, vi } from "vitest";
import {
  getAllPeople,
  getPersonById,
  createPerson,
  updatePerson,
  deletePerson,
  type Db,
} from "./people";

// --- Mock helpers ---

function makeRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "linus-lee",
    name: "Linus Lee",
    handle: "@thesephist",
    summary: "A creative technologist",
    whyIFollow: "Brilliant thinker",
    avatarUrl: null,
    topics: ["creativity", "tools"],
    links: { twitter: "https://x.com/thesephist" },
    featured: true,
    createdAt: new Date("2025-01-01"),
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

describe("people CRUD", () => {
  describe("getAllPeople", () => {
    it("returns all people ordered by createdAt desc", async () => {
      const rows = [makeRow({ id: "a" }), makeRow({ id: "b" })];
      const db = makeDb(rows);
      const result = await getAllPeople(db);
      expect(result).toEqual(rows);
      expect(db.select).toHaveBeenCalled();
    });
  });

  describe("getPersonById", () => {
    it("returns the person when found", async () => {
      const row = makeRow({ id: "linus-lee" });
      const db = makeDb([row]);
      const result = await getPersonById(db, "linus-lee");
      expect(result).toEqual(row);
    });

    it("returns undefined when not found", async () => {
      const db = makeDb([]);
      const result = await getPersonById(db, "missing");
      expect(result).toBeUndefined();
    });
  });

  describe("createPerson", () => {
    it("inserts and returns the new person", async () => {
      const row = makeRow({ id: "new-person", name: "New Person" });
      const db = makeDb([row]);
      const result = await createPerson(db, {
        id: "new-person",
        name: "New Person",
        summary: "A mysterious human",
        whyIFollow: "They said something smart once",
      });
      expect(result).toEqual(row);
      expect(db.insert).toHaveBeenCalled();
    });
  });

  describe("updatePerson", () => {
    it("updates and returns the modified person", async () => {
      const row = makeRow({ id: "linus-lee", name: "Updated Name" });
      const db = makeDb([row]);
      const result = await updatePerson(db, "linus-lee", {
        name: "Updated Name",
      });
      expect(result).toEqual(row);
      expect(db.update).toHaveBeenCalled();
    });
  });

  describe("deletePerson", () => {
    it("returns true when a row is deleted", async () => {
      const db = makeDb([makeRow()]);
      const result = await deletePerson(db, "linus-lee");
      expect(result).toBe(true);
      expect(db.delete).toHaveBeenCalled();
    });

    it("returns false when no row matches", async () => {
      const db = makeDb([]);
      const result = await deletePerson(db, "missing");
      expect(result).toBe(false);
    });
  });
});
