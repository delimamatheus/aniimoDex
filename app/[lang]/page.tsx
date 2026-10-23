import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Dex from "@/components/Dex";
import { getAniimo } from "@/lib/aniimo";
import { isLocale } from "@/lib/i18n";
import { getMessages } from "@/lib/messages";
import { altMeta, ogMeta } from "@/lib/seo";
import { supportConfigured } from "@/lib/support";

export const revalidate = 300;
// Gerada no build para cada idioma (sem isso o Next trata a rota como dinâmica).
export const dynamic = "force-static";


export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = await getMessages(lang);
  return { alternates: altMeta(lang), openGraph: ogMeta(lang, { title: t.metaTitleShort, description: t.metaDescription }) };
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const [aniimo, t] = await Promise.all([getAniimo(lang), getMessages(lang)]);
  return <Dex aniimo={aniimo} lang={lang} t={t} support={supportConfigured()} />;
}
