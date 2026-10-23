import { and, eq, or } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { aniimo, caught, VARIANTS, type Variant } from "@/db/schema";
import { entryKey, parseKey } from "@/lib/aniimo";

async function uid() {
  const s = await auth();
  return s ? { uid: (s as any).uid as string, name: s.user?.name ?? "" } : null;
}

export async function GET() {
  const u = await uid();
  if (!u) return Response.json({ error: "unauthorized" }, { status: 401 });
  const rows = await db
    .select({ id: caught.aniimoId, form: caught.form, variant: caught.variant })
    .from(caught)
    .where(eq(caught.userId, u.uid));
  const out = Object.fromEntries(VARIANTS.map((v) => [v, [] as string[]])) as Record<Variant, string[]>;
  for (const r of rows) out[r.variant]?.push(entryKey(r.id, r.form));
  return Response.json({ name: u.name, caught: out });
}

// Body: { variant, add?: string[], remove?: string[] }  (chaves: "5" ou "5:highland")
export async function PUT(req: Request) {
  const u = await uid();
  if (!u) return Response.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const variant = VARIANTS.find((v) => v === body.variant);
  if (!variant) return Response.json({ error: "invalid variant" }, { status: 400 });
  const keys = (v: unknown) =>
    Array.isArray(v)
      ? [...new Set(v.filter((k): k is string => typeof k === "string"))]
          .slice(0, 5000)
          .map(parseKey)
          .filter((k): k is NonNullable<typeof k> => !!k)
      : [];
  const match = (list: { id: number; form: string }[]) =>
    or(...list.map((k) => and(eq(aniimo.id, k.id), eq(aniimo.form, k.form))));
  const add = keys(body.add);
  const remove = keys(body.remove);

  if (add.length) {
    // Só entradas que existem na tabela aniimo (a FK rejeitaria o resto).
    const valid = await db.select({ id: aniimo.id, form: aniimo.form }).from(aniimo).where(match(add));
    if (valid.length)
      await db
        .insert(caught)
        .values(valid.map((v) => ({ userId: u.uid, variant, aniimoId: v.id, form: v.form })))
        .onConflictDoNothing();
  }
  if (remove.length)
    await db
      .delete(caught)
      .where(
        and(
          eq(caught.userId, u.uid),
          eq(caught.variant, variant),
          or(...remove.map((k) => and(eq(caught.aniimoId, k.id), eq(caught.form, k.form)))),
        ),
      );
  return Response.json({ ok: true });
}
