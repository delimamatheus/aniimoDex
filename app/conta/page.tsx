import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { isAdmin } from "@/lib/admin";
import ContaClient from "./ContaClient";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Minha conta", robots: { index: false, follow: false } };

export default async function Conta() {
  const s = await auth();
  const uid = (s as any)?.uid as string | undefined;
  if (!s || !uid) redirect("/api/auth/signin?callbackUrl=/conta");

  const [p] = await db.select().from(profiles).where(eq(profiles.userId, uid));
  const name = s.user?.name ?? "";
  const initial = {
    public: p?.isPublic ?? false,
    token: p?.shareToken ?? null,
    displayName: p?.displayName ?? (name.trim().split(/\s+/)[0] || "Treinador"),
  };

  return (
    <main className="page" id="main" tabIndex={-1}>
      <Link className="back" href="/">← Voltar ao Aniimo Dex</Link>
      <article className="card">
        <h1>Minha conta</h1>
        <p>Você entrou como <b>{name || "conta sem nome"}</b>.</p>
        <p className="muted">
          Seu identificador: <code>{uid}</code>
        </p>
        {isAdmin(uid) && <p><Link href="/admin">Abrir o painel de administração</Link></p>}
        <ContaClient initial={initial} />
      </article>
    </main>
  );
}
