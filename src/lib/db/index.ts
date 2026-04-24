import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

let _db: NeonHttpDatabase<typeof schema> | null = null;

/**
 * Lazy database client — only connects when first accessed.
 * Avoids build-time errors when POSTGRES_URL is not set.
 */
export function getDb(): NeonHttpDatabase<typeof schema> {
  if (_db) return _db;
  const databaseUrl = process.env.POSTGRES_URL ?? process.env.DATABASE_URL ?? "";
  if (!databaseUrl) {
    throw new Error("POSTGRES_URL or DATABASE_URL environment variable is required");
  }
  _db = drizzle(neon(databaseUrl), { schema });
  return _db;
}

/** Backwards-compatible getter that acts like a property via Proxy */
export const db = new Proxy({} as NeonHttpDatabase<typeof schema>, {
  get(_target, prop, receiver) {
    const instance = getDb();
    const value = Reflect.get(instance, prop, receiver);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
