import { eq } from "drizzle-orm";
import { db } from "@/db";
import { caught, VARIANTS, type Variant } from "@/db/schema";
import { entryKey } from "@/lib/aniimo";

export type CaughtByVariant = Record<Variant, string[]>;

export async function loadCaught(uid: string): Promise<CaughtByVariant> {
  const rows = await db
    .select({ id: caught.aniimoId, form: caught.form, variant: caught.variant })
    .from(caught)
    .where(eq(caught.userId, uid));
  const out = Object.fromEntries(VARIANTS.map((v) => [v, [] as string[]])) as CaughtByVariant;
  for (const r of rows) out[r.variant]?.push(entryKey(r.id, r.form));
  return out;
}
