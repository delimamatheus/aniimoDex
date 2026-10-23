import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageTop from "@/components/PageTop";
import { and, desc, eq, sql } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { aniimo, caught, profiles } from "@/db/schema";
import { isAdmin } from "@/lib/admin";
import { isLocale } from "@/lib/i18n";
import { getMessages } from "@/lib/messages";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

const n = sql<number>`count(*)::int`;
const VARIANT_LABEL: Record<string, string> = { normal: "Normal", umbral: "Umbral", shiny: "Cintilante", prismana: "Prismana" };
const KIND_LABEL: Record<string, string> = { base: "Básicas", regional: "Regionais", prismana: "Prismanas" };
// Mostra só o provedor e o fim do ID, para não expor a conta inteira na tela.
const mask = (uid: string) => {
  const [prov, ...rest] = uid.split(":");
  const id = rest.join(":");
  return `${prov}:…${id.slice(-4)}`;
};

export default async function Admin({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  // Qualquer pessoa que não seja admin recebe 404, como se a página não existisse.
  const s = await auth();
  if (!isAdmin((s as any)?.uid)) notFound();

  const t = await getMessages(lang);
  const [totals] = await db
    .select({ users: sql<number>`count(distinct ${caught.userId})::int`, marks: n })
    .from(caught);
  const [pub] = await db.select({ total: n, pub: sql<number>`count(*) filter (where ${profiles.isPublic})::int` }).from(profiles);
  const byVariant = await db.select({ k: caught.variant, n }).from(caught).groupBy(caught.variant);
  const byKind = await db.select({ k: aniimo.kind, n }).from(aniimo).groupBy(aniimo.kind);
  const top = await db
    .select({ id: caught.aniimoId, form: caught.form, name: aniimo.name, label: aniimo.formLabel, n })
    .from(caught)
    .innerJoin(aniimo, and(eq(caught.aniimoId, aniimo.id), eq(caught.form, aniimo.form)))
    .groupBy(caught.aniimoId, caught.form, aniimo.name, aniimo.formLabel)
    .orderBy(desc(n))
    .limit(10);
  const users = await db
    .select({ uid: caught.userId, marks: n, last: sql<string>`max(${caught.createdAt})` })
    .from(caught)
    .groupBy(caught.userId)
    .orderBy(desc(sql`max(${caught.createdAt})`))
    .limit(50);

  return (
    <main className="page" id="main" tabIndex={-1}>
      <PageTop lang={lang} t={t} />
      <article className="card">
        <h1>Administração</h1>
        <p className="muted">Visível apenas para contas listadas em ADMIN_USER_IDS.</p>

        <div className="stats">
          <div className="stat"><b>{totals?.users ?? 0}</b><span>usuários com progresso</span></div>
          <div className="stat"><b>{totals?.marks ?? 0}</b><span>marcações no total</span></div>
          <div className="stat"><b>{pub?.pub ?? 0}</b><span>links públicos ativos (de {pub?.total ?? 0} perfis)</span></div>
          <div className="stat"><b>{byKind.reduce((a, r) => a + r.n, 0)}</b><span>entradas no banco</span></div>
        </div>

        <h2>Entradas por tipo</h2>
        <p>{byKind.map((r) => `${KIND_LABEL[r.k] ?? r.k}: ${r.n}`).join(" · ")}</p>

        <h2>Marcações por variante</h2>
        <p>{byVariant.length ? byVariant.map((r) => `${VARIANT_LABEL[r.k] ?? r.k}: ${r.n}`).join(" · ") : "Nenhuma ainda."}</p>

        <h2>Mais capturados</h2>
        {top.length ? (
          <div className="tablewrap">
            <table>
              <thead><tr><th scope="col">#</th><th scope="col">Aniimo</th><th scope="col">Capturas</th></tr></thead>
              <tbody>
                {top.map((r) => (
                  <tr key={`${r.id}:${r.form}`}>
                    <td>{String(r.id).padStart(3, "0")}</td>
                    <td>{r.name}{r.label ? ` (${r.label})` : ""}</td>
                    <td>{r.n}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p>Sem dados ainda.</p>}

        <h2>Usuários recentes</h2>
        {users.length ? (
          <div className="tablewrap">
            <table>
              <thead><tr><th scope="col">Conta</th><th scope="col">Marcações</th><th scope="col">Última atividade</th></tr></thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.uid}>
                    <td><code>{mask(u.uid)}</code></td>
                    <td>{u.marks}</td>
                    <td>{new Date(u.last).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p>Sem usuários com progresso ainda.</p>}
      </article>
    </main>
  );
}
