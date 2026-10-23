// Uso: npm run wiki:fetch [-- --force]
// Lê a listagem de wiki.aniimo.com/pt e a página de cada Aniimo (para descobrir as formas
// regionais e prismanas), baixa os sprites para public/aniimo/ e grava data/aniimo.json
// (consumido por `npm run db:seed`).
import { mkdir, writeFile, access } from "node:fs/promises";
import sharp from "sharp";

const WIKI = "https://wiki.aniimo.com/pt";
const UA = "Mozilla/5.0 (aniimo-dex fan project)";
const FORCE = process.argv.includes("--force");

const ELEMENTS: Record<string, string> = {
  "attributes-fire": "Fogo", "attributes-water": "Água", "attributes-grass": "Planta",
  "attributes-ice": "Gelo", "attributes-rock": "Pedra", "attributes-wind": "Vento",
  "attributes-electric": "Elétrico", "attributes-dark": "Sombra", "attributes-holy": "Luz",
};

type Entry = {
  entryId: string; name: string; imageUrl: string; description: string;
  currentMorphology: string; currentStage: string; attributes: string[];
};
type Tag = { tagKey: string; name: string; sort: number };
type Detail = { entry: Entry; forms: string[]; tags: Tag[] };

// O Nuxt serializa o estado em __NUXT_DATA__ no formato "devalue" (array com índices).
function nuxtData(html: string): any {
  const m = html.match(/<script[^>]*id="__NUXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) throw new Error("__NUXT_DATA__ não encontrado (a wiki mudou?)");
  const arr: unknown[] = JSON.parse(m[1]);
  const WRAP = ["Reactive", "ShallowReactive", "Ref", "ShallowRef"];
  const memo = new Map<number, unknown>();
  const res = (i: unknown): unknown => {
    if (typeof i !== "number") return i;
    if (memo.has(i)) return memo.get(i);
    const v = arr[i];
    if (Array.isArray(v)) {
      if (typeof v[0] === "string" && WRAP.includes(v[0])) return res(v[1]);
      const out: unknown[] = [];
      memo.set(i, out);
      v.forEach((x) => out.push(res(x)));
      return out;
    }
    if (v && typeof v === "object") {
      const o: Record<string, unknown> = {};
      memo.set(i, o);
      for (const k in v) o[k] = res((v as Record<string, unknown>)[k]);
      return o;
    }
    return v;
  };
  return res(0);
}

const page = async (url: string) => {
  const res = await fetch(url, { headers: { "user-agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} em ${url}`);
  return nuxtData(await res.text());
};

function listEntries(root: any): Entry[] {
  const byImage = new Map<string, Entry>();
  const walk = (o: any) => {
    if (!o || typeof o !== "object") return;
    if (o.type === "ANIIMO" && typeof o.imageUrl === "string") return void byImage.set(o.imageUrl, o);
    for (const k in o) walk(o[k]);
  };
  walk(root);
  return [...byImage.values()];
}

const slug = (s: string) => s.trim().toLowerCase().replace(/\s+/g, "-");
// Chave curta da forma no banco: "Highland Form" -> "highland"
const formKey = (morph: string) => slug(morph.replace(/\s+Form$/i, ""));

async function detail(entryId: string, morph: string): Promise<Detail> {
  const root = await page(`${WIKI}/item/${encodeURIComponent(entryId)}/${slug(morph)}`);
  const key = Object.keys(root.data).find((k) => k.startsWith("aniimo-detail"));
  if (!key) throw new Error(`detalhe de ${entryId}/${morph} não encontrado`);
  const d = root.data[key];
  const tags: Tag[] = (root.data["morphology-tags-pt"] ?? []).filter((t: any) => t.tagType === "morphologyTypes");
  return { entry: d.searchKey, forms: d.morphologyList.map((m: any) => m.currentMorphology), tags };
}

const exists = (p: string) => access(p).then(() => true, () => false);

async function pool<T>(items: T[], n: number, fn: (x: T) => Promise<void>) {
  let i = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) await fn(items[i++]); }));
}

// 1) Listagem (formas básicas)
const base = listEntries(await page(WIKI));
if (base.length < 50) throw new Error(`Só ${base.length} Aniimo encontrados; a estrutura da wiki deve ter mudado.`);

// 2) Formas de cada Aniimo + nomes (pt) e ordem das formas
const baseDetails = new Map<string, Detail>();
await pool(base, 5, async (b) => void baseDetails.set(b.entryId, await detail(b.entryId, "Basic Form")));
const tags = new Map<string, Tag>();
baseDetails.forEach((d) => d.tags.forEach((t) => tags.set(t.tagKey, t)));

type Row = {
  id: number; form: string; formLabel: string | null; kind: "base" | "regional" | "prismana";
  name: string; element: string; stage: number; description: string; image: string; src: string; sort: number;
};
const toRow = (e: Entry, morph: string): Row => {
  const isBase = morph === "Basic Form";
  const form = isBase ? "basic" : formKey(morph);
  return {
    id: Number(e.entryId),
    form,
    formLabel: isBase ? null : tags.get(morph)?.name ?? morph,
    kind: isBase ? "base" : form === "prismana" ? "prismana" : "regional",
    name: e.name,
    element: e.attributes.map((a) => ELEMENTS[a] ?? a.replace("attributes-", "")).join(" / "),
    stage: Number(e.currentStage) || 1,
    description: e.description,
    image: `/aniimo/${e.entryId.padStart(3, "0")}${isBase ? "" : "-" + form}.webp`,
    src: e.imageUrl,
    sort: tags.get(morph)?.sort ?? 0,
  };
};

// 3) Detalhe de cada forma não básica
const rows: Row[] = base.map((b) => toRow(b, "Basic Form"));
const extra = [...baseDetails.entries()].flatMap(([id, d]) =>
  d.forms.filter((f) => f !== "Basic Form").map((f) => ({ id, morph: f })));
await pool(extra, 5, async ({ id, morph }) => void rows.push(toRow((await detail(id, morph)).entry, morph)));

// Ordem de exibição: básicas por número, depois regionais (número, tipo da forma), depois prismanas
const kindOrder = { base: 0, regional: 1, prismana: 2 };
rows.sort((a, b) => kindOrder[a.kind] - kindOrder[b.kind] || a.id - b.id || a.sort - b.sort);
const keys = new Set(rows.map((r) => `${r.id}/${r.form}`));
if (keys.size !== rows.length) throw new Error("(id, forma) duplicado na wiki");

// 4) Imagens
await mkdir("public/aniimo", { recursive: true });
await mkdir("data", { recursive: true });
let done = 0;
await pool(rows, 6, async (r) => {
  const file = `public${r.image}`;
  if (!FORCE && (await exists(file))) return void done++;
  const res = await fetch(r.src, { headers: { "user-agent": UA } });
  if (!res.ok) throw new Error(`${r.name} (${r.form}): HTTP ${res.status} em ${r.src}`);
  const webp = await sharp(Buffer.from(await res.arrayBuffer()))
    .resize({ width: 320, height: 520, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
  await writeFile(file, webp);
  done++;
});

const out = rows.map(({ src, sort, ...r }, position) => ({ ...r, position }));
await writeFile("data/aniimo.json", JSON.stringify(out, null, 2) + "\n");
const n = (k: Row["kind"]) => rows.filter((r) => r.kind === k).length;
console.log(`${rows.length} entradas (${n("base")} base, ${n("regional")} regionais, ${n("prismana")} prismanas), ${done} imagens, dados em data/aniimo.json`);
