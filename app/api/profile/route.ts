import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { caught, profiles } from "@/db/schema";

async function me() {
  const s = await auth();
  return s ? { uid: (s as any).uid as string, name: s.user?.name ?? "" } : null;
}
const firstName = (n: string) => n.trim().split(/\s+/)[0]?.slice(0, 40) || "Treinador";
const newToken = () => randomBytes(9).toString("base64url"); // 12 caracteres, não adivinhável

async function current(uid: string) {
  const [p] = await db.select().from(profiles).where(eq(profiles.userId, uid));
  return p;
}
const shape = (p?: typeof profiles.$inferSelect, name = "") => ({
  public: p?.isPublic ?? false,
  token: p?.shareToken ?? null,
  displayName: p?.displayName ?? firstName(name),
});

export async function GET() {
  const u = await me();
  if (!u) return Response.json({ error: "unauthorized" }, { status: 401 });
  return Response.json(shape(await current(u.uid), u.name));
}

// Body: { public?: boolean, displayName?: string, regenerate?: boolean }
export async function PUT(req: Request) {
  const u = await me();
  if (!u) return Response.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const prev = await current(u.uid);

  const displayName =
    typeof body.displayName === "string" && body.displayName.trim()
      ? body.displayName.trim().slice(0, 40)
      : prev?.displayName ?? firstName(u.name);
  const isPublic = typeof body.public === "boolean" ? body.public : prev?.isPublic ?? false;
  const shareToken = body.regenerate === true || !prev?.shareToken ? newToken() : prev.shareToken;

  const [row] = await db
    .insert(profiles)
    .values({ userId: u.uid, displayName, isPublic, shareToken })
    .onConflictDoUpdate({ target: profiles.userId, set: { displayName, isPublic, shareToken } })
    .returning();
  return Response.json(shape(row, u.name));
}

// Exclui todos os dados da conta (progresso + perfil). Direito de exclusão da LGPD.
export async function DELETE() {
  const u = await me();
  if (!u) return Response.json({ error: "unauthorized" }, { status: 401 });
  await db.delete(caught).where(eq(caught.userId, u.uid));
  await db.delete(profiles).where(eq(profiles.userId, u.uid));
  return Response.json({ ok: true });
}
