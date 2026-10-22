// Uso: npm run db:migrate && npm run db:seed  (lê DATABASE_URL de .env.local)
import { sql } from "drizzle-orm";
import { db } from "../db/index.ts";
import { aniimo } from "../db/schema.ts";
import { mockAniimo } from "../lib/aniimo.ts";

await db
  .insert(aniimo)
  .values(mockAniimo().map((a) => ({ ...a, image: a.image ?? null })))
  .onConflictDoUpdate({
    target: aniimo.id,
    set: { name: sql`excluded.name`, element: sql`excluded.element`, hue: sql`excluded.hue`, image: sql`excluded.image` },
  });
console.log("Seed ok");
