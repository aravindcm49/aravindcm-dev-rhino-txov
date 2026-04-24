import { eq, desc } from "drizzle-orm";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { people, type PersonRow, type NewPersonRow } from "./schema";

export type Db = NeonHttpDatabase<Record<string, never>>;

// --- Read ---

export async function getAllPeople(db: Db): Promise<PersonRow[]> {
  return db.select().from(people).orderBy(desc(people.createdAt));
}

export async function getPersonById(
  db: Db,
  id: string,
): Promise<PersonRow | undefined> {
  const rows = await db
    .select()
    .from(people)
    .where(eq(people.id, id))
    .limit(1);
  return rows[0];
}

// --- Create ---

export async function createPerson(
  db: Db,
  person: NewPersonRow,
): Promise<PersonRow> {
  const rows = await db.insert(people).values(person).returning();
  return rows[0];
}

// --- Update ---

export async function updatePerson(
  db: Db,
  id: string,
  updates: Partial<NewPersonRow>,
): Promise<PersonRow | undefined> {
  const rows = await db
    .update(people)
    .set(updates)
    .where(eq(people.id, id))
    .returning();
  return rows[0];
}

// --- Delete ---

export async function deletePerson(
  db: Db,
  id: string,
): Promise<boolean> {
  const rows = await db
    .delete(people)
    .where(eq(people.id, id))
    .returning();
  return rows.length > 0;
}
