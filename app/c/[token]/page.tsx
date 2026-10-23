import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import Dex from "@/components/Dex";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { getAniimo } from "@/lib/aniimo";
import { loadCaught } from "@/lib/caught";

export const dynamic = "force-dynamic";

async function find(token: string) {
  if (!/^[A-Za-z0-9_-]{8,40}$/.test(token)) return null;
  const [p] = await db
    .select()
    .from(profiles)
    .where(and(eq(profiles.shareToken, token), eq(profiles.isPublic, true)));
  return p ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const p = await find((await params).token);
  return {
    title: p ? `Coleção de ${p.displayName}` : "Coleção não encontrada",
    robots: { index: false, follow: false }, // coleções compartilhadas não vão para buscadores
  };
}

export default async function Shared({ params }: { params: Promise<{ token: string }> }) {
  const p = await find((await params).token);
  if (!p) notFound();
  const [aniimo, caught] = await Promise.all([getAniimo(), loadCaught(p.userId)]);
  return <Dex aniimo={aniimo} readOnly={{ owner: p.displayName, caught }} />;
}
