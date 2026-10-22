// Uso: npm run db:migrate && npm run db:seed  (lê DATABASE_URL de .env.local)
// Fonte: data/aniimo.json (gerado por `npm run wiki:fetch`); sem ele, usa o mock.
import { existsSync, readFileSync } from "node:fs";
import { notInArray, sql } from "drizzle-orm";
import { db } from "../db/index.ts";
import { aniimo } from "../db/schema.ts";
import { mockAniimo } from "../lib/aniimo.ts";

const real = existsSync("data/aniimo.json");
const rows = real
  ? (JSON.parse(readFileSync("data/aniimo.json", "utf8")) as {
      id: number; name: string; element: string; stage: number; description: string; image: string;
    }[]).map((a) => ({ ...a, hue: 0 }))
  : mockAniimo().map((a) => ({ ...a, image: a.image ?? null }));

await db
  .insert(aniimo)
  .values(rows)
  .onConflictDoUpdate({
    target: aniimo.id,
    set: {
      name: sql`excluded.name`, element: sql`excluded.element`, hue: sql`excluded.hue`,
      image: sql`excluded.image`, stage: sql`excluded.stage`, description: sql`excluded.description`,
    },
  });

// Com dados reais, remove sobras do mock (a FK apaga o progresso ligado a elas).
if (real) await db.delete(aniimo).where(notInArray(aniimo.id, rows.map((r) => r.id)));
console.log(`Seed ok (${rows.length} Aniimo, ${real ? "wiki" : "mock"})`);
