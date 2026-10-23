// Uso: npm run db:migrate && npm run db:seed  (lê DATABASE_URL de .env.local)
// Fonte: data/aniimo.json (gerado por `npm run wiki:fetch`); sem ele, usa o mock.
import { existsSync, readFileSync } from "node:fs";
import { and, eq, sql } from "drizzle-orm";
import { db } from "../db/index.ts";
import { aniimo, aniimoI18n, type Kind } from "../db/schema.ts";
import { mockAniimo } from "../lib/aniimo.ts";

type Row = typeof aniimo.$inferInsert;
const real = existsSync("data/aniimo.json");
const rows: Row[] = real
  ? (JSON.parse(readFileSync("data/aniimo.json", "utf8")) as (Omit<Row, "hue" | "elements"> & { kind: Kind; elements: string[] })[]).map(
      (a) => ({ ...a, hue: 0, elements: a.elements.join(",") }),
    )
  : mockAniimo().map((a, position) => ({ ...a, position, image: a.image ?? null, elements: a.elements.join(",") }));

for (let i = 0; i < rows.length; i += 100) {
  await db
    .insert(aniimo)
    .values(rows.slice(i, i + 100))
    .onConflictDoUpdate({
      target: [aniimo.id, aniimo.form],
      set: {
        formLabel: sql`excluded.form_label`, elements: sql`excluded.elements`, kind: sql`excluded.kind`, position: sql`excluded.position`,
        name: sql`excluded.name`, element: sql`excluded.element`, hue: sql`excluded.hue`,
        image: sql`excluded.image`, stage: sql`excluded.stage`, description: sql`excluded.description`,
      },
    });
}

// Remove o que não existe mais na fonte (a FK apaga o progresso ligado a isso).
const keep = new Set(rows.map((r) => `${r.id}/${r.form ?? "basic"}`));
for (const r of await db.select({ id: aniimo.id, form: aniimo.form }).from(aniimo))
  if (!keep.has(`${r.id}/${r.form}`)) await db.delete(aniimo).where(and(eq(aniimo.id, r.id), eq(aniimo.form, r.form)));
// Traduções (data/i18n.json: { idioma: { "5" | "5:highland": { n, d, f? } } })
let tr = 0;
if (real && existsSync("data/i18n.json")) {
  type Tr = { n: string; d: string; f?: string };
  const data = JSON.parse(readFileSync("data/i18n.json", "utf8")) as Record<string, Record<string, Tr>>;
  const list = Object.entries(data).flatMap(([lang, m]) =>
    Object.entries(m).map(([k, t]) => {
      const [id, form = "basic"] = k.split(":");
      return { id: Number(id), form, lang, name: t.n, description: t.d, formLabel: t.f ?? null };
    }),
  );
  for (let i = 0; i < list.length; i += 200) {
    await db
      .insert(aniimoI18n)
      .values(list.slice(i, i + 200))
      .onConflictDoUpdate({
        target: [aniimoI18n.id, aniimoI18n.form, aniimoI18n.lang],
        set: { name: sql`excluded.name`, description: sql`excluded.description`, formLabel: sql`excluded.form_label` },
      });
  }
  tr = list.length;
}
console.log(`Seed ok (${rows.length} entradas, ${tr} traduções, ${real ? "wiki" : "mock"})`);
