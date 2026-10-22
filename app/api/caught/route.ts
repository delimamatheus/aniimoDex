import { and, eq, inArray } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { aniimo, caught } from "@/db/schema";

async function uid() {
  const s = await auth();
  return s ? { uid: (s as any).uid as string, name: s.user?.name ?? "" } : null;
}

export async function GET() {
  const u = await uid();
  if (!u) return Response.json({ error: "unauthorized" }, { status: 401 });
  const rows = await db.select({ id: caught.aniimoId }).from(caught).where(eq(caught.userId, u.uid));
  return Response.json({ name: u.name, ids: rows.map((r) => r.id) });
}

// Body: { add?: number[], remove?: number[] }
export async function PUT(req: Request) {
  const u = await uid();
  if (!u) return Response.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const ints = (v: unknown) =>
    Array.isArray(v) ? [...new Set(v.filter((n): n is number => Number.isInteger(n)))].slice(0, 5000) : [];
  const add = ints(body.add);
  const remove = ints(body.remove);

  if (add.length) {
    // Só ids que existem na tabela aniimo (a FK rejeitaria o resto).
    const valid = await db.select({ id: aniimo.id }).from(aniimo).where(inArray(aniimo.id, add));
    if (valid.length)
      await db.insert(caught).values(valid.map((v) => ({ userId: u.uid, aniimoId: v.id }))).onConflictDoNothing();
  }
  if (remove.length)
    await db.delete(caught).where(and(eq(caught.userId, u.uid), inArray(caught.aniimoId, remove)));
  return Response.json({ ok: true });
}
