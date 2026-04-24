/**
 * Seed script — inserts the 3 example people from MDX into the database.
 * Run with: npx tsx src/lib/db/seed.ts
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { people } from "./schema";

const databaseUrl = process.env.POSTGRES_URL ?? process.env.DATABASE_URL ?? "";

const seedPeople = [
  {
    id: "linus-lee",
    name: "Linus Lee",
    handle: "@thesephist",
    summary: "Builder and writer focused on tools for thought and personal software.",
    whyIFollow:
      "Ships a lot, writes thoughtfully about it, and maintains a distinct visual identity across his tools.",
    topics: ["tools-for-thought", "personal-software"],
    links: { website: "https://thesephist.com" },
    featured: false,
  },
  {
    id: "rich-hickey",
    name: "Rich Hickey",
    handle: null,
    summary: "Creator of Clojure; talks and essays on simplicity, state, and systems design.",
    whyIFollow:
      "The clearest thinker I have found on the difference between 'simple' and 'easy'. His talks keep paying back on rewatches.",
    topics: ["clojure", "systems", "talks"],
    links: null,
    featured: true,
  },
  {
    id: "maggie-appleton",
    name: "Maggie Appleton",
    handle: "@mappletons",
    summary:
      "Designer and essayist; originator of the 'digital garden' framing for personal sites.",
    whyIFollow:
      "The person most responsible for the way I think about publishing cadence on a personal site.",
    topics: ["digital-gardens", "design", "essays"],
    links: { website: "https://maggieappleton.com" },
    featured: true,
  },
];

async function seed() {
  if (!databaseUrl) {
    console.error("Set POSTGRES_URL or DATABASE_URL environment variable");
    process.exit(1);
  }

  const db = drizzle(neon(databaseUrl));

  for (const person of seedPeople) {
    await db
      .insert(people)
      .values(person)
      .onConflictDoUpdate({
        target: people.id,
        set: {
          name: person.name,
          handle: person.handle,
          summary: person.summary,
          whyIFollow: person.whyIFollow,
          topics: person.topics,
          links: person.links,
          featured: person.featured,
        },
      });
    console.log(`Seeded: ${person.name}`);
  }

  console.log("Done.");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
