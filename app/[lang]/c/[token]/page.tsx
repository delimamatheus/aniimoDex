import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import Dex from "@/components/Dex";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { getAniimo } from "@/lib/aniimo";
import { loadCaught } from "@/lib/caught";
import { fmt, isLocale } from "@/lib/i18n";
import { getMessages } from "@/lib/messages";
import { supportConfigured } from "@/lib/support";

export const dynamic = "force-dynamic";

async function find(token: string) {
  if (!/^[A-Za-z0-9_-]{8,40}$/.test(token)) return null;
  const [p] = await db
    .select()
    .from(profiles)
    .where(and(eq(profiles.shareToken, token), eq(profiles.isPublic, true)));
  return p ?? null;
}

type P = { params: Promise<{ lang: string; token: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { lang, token } = await params;
  if (!isLocale(lang)) return {};
  const [p, t] = await Promise.all([find(token), getMessages(lang)]);
  return {
    title: p ? fmt(t.sharedTitle, { owner: p.displayName }) : t.sharedNotFound,
    robots: { index: false, follow: false }, // coleções compartilhadas não vão para buscadores
  };
}

export default async function Shared({ params }: P) {
  const { lang, token } = await params;
  if (!isLocale(lang)) notFound();
  const p = await find(token);
  if (!p) notFound();
  const [aniimo, caught, t] = await Promise.all([getAniimo(lang), loadCaught(p.userId), getMessages(lang)]);
  return <Dex aniimo={aniimo} lang={lang} t={t} support={supportConfigured()} readOnly={{ owner: p.displayName, caught }} />;
}
