// Uso: npm run db:migrate && npm run db:seed  (lê DATABASE_URL de .env.local)
// Fonte: data/aniimo.json (gerado por `npm run wiki:fetch`); sem ele, usa o mock.
import { existsSync, readFileSync } from "node:fs";
import { and, eq, sql } from "drizzle-orm";
import { db } from "../db/index.ts";
import { aniimo, type Kind } from "../db/schema.ts";
import { mockAniimo } from "../lib/aniimo.ts";

type Row = typeof aniimo.$inferInsert;
const real = existsSync("data/aniimo.json");
const rows: Row[] = real
  ? (JSON.parse(readFileSync("data/aniimo.json", "utf8")) as (Omit<Row, "hue"> & { kind: Kind })[]).map((a) => ({ ...a, hue: 0 }))
  : mockAniimo().map((a, position) => ({ ...a, position, image: a.image ?? null }));

for (let i = 0; i < rows.length; i += 100) {
  await db
    .insert(aniimo)
    .values(rows.slice(i, i + 100))
    .onConflictDoUpdate({
      target: [aniimo.id, aniimo.form],
      set: {
        formLabel: sql`excluded.form_label`, kind: sql`excluded.kind`, position: sql`excluded.position`,
        name: sql`excluded.name`, element: sql`excluded.element`, hue: sql`excluded.hue`,
        image: sql`excluded.image`, stage: sql`excluded.stage`, description: sql`excluded.description`,
      },
    });
}

// Remove o que não existe mais na fonte (a FK apaga o progresso ligado a isso).
const keep = new Set(rows.map((r) => `${r.id}/${r.form ?? "basic"}`));
for (const r of await db.select({ id: aniimo.id, form: aniimo.form }).from(aniimo))
  if (!keep.has(`${r.id}/${r.form}`)) await db.delete(aniimo).where(and(eq(aniimo.id, r.id), eq(aniimo.form, r.form)));
console.log(`Seed ok (${rows.length} entradas, ${real ? "wiki" : "mock"})`);
