import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import PageTop from "@/components/PageTop";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { isAdmin } from "@/lib/admin";
import { fmt, isLocale } from "@/lib/i18n";
import { getMessages } from "@/lib/messages";
import AccountClient from "./AccountClient";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function Account({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const s = await auth();
  const uid = (s as any)?.uid as string | undefined;
  if (!s || !uid) redirect(`/${lang}/signin?callbackUrl=${encodeURIComponent(`/${lang}/account`)}`);

  const t = await getMessages(lang);
  const [p] = await db.select().from(profiles).where(eq(profiles.userId, uid));
  const name = s.user?.name ?? "";
  const initial = {
    public: p?.isPublic ?? false,
    token: p?.shareToken ?? null,
    displayName: p?.displayName ?? (name.trim().split(/\s+/)[0] || "·"),
  };

  return (
    <main className="page" id="main" tabIndex={-1}>
      <PageTop lang={lang} t={t} />
      <article className="card">
        <h1>{t.accountTitle}</h1>
        <p>{fmt(t.signedAs, { name: name || t.noName })}</p>
        <p className="muted">
          {t.yourId} <code>{uid}</code>
        </p>
        {isAdmin(uid) && <p><Link href={`/${lang}/admin`}>{t.adminLink}</Link></p>}
        <AccountClient initial={initial} lang={lang} t={t} />
      </article>
    </main>
  );
}
