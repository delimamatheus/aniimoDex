// Uso: npm run wiki:fetch [-- --force]
// Lê a listagem de wiki.aniimo.com/pt, baixa os sprites para public/aniimo/<id>.webp
// e grava data/aniimo.json (consumido por `npm run db:seed`).
import { mkdir, writeFile, access } from "node:fs/promises";
import sharp from "sharp";

const URL_LIST = "https://wiki.aniimo.com/pt";
const UA = "Mozilla/5.0 (aniimo-dex fan project)";
const FORCE = process.argv.includes("--force");

const ELEMENTS: Record<string, string> = {
  "attributes-fire": "Fogo", "attributes-water": "Água", "attributes-grass": "Planta",
  "attributes-ice": "Gelo", "attributes-rock": "Pedra", "attributes-wind": "Vento",
  "attributes-electric": "Elétrico", "attributes-dark": "Sombra", "attributes-holy": "Luz",
};

type Raw = {
  entryId: string; name: string; imageUrl: string; description: string;
  currentStage: string; attributes: string[];
};

// O Nuxt serializa o estado em __NUXT_DATA__ no formato "devalue" (array com índices).
function extract(html: string): Raw[] {
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

  const byImage = new Map<string, Raw>();
  const walk = (o: unknown) => {
    if (!o || typeof o !== "object") return;
    const r = o as Record<string, unknown>;
    if (r.type === "ANIIMO" && typeof r.imageUrl === "string") {
      byImage.set(r.imageUrl, r as unknown as Raw);
      return;
    }
    for (const k in r) walk(r[k]);
  };
  walk(res(0));
  return [...byImage.values()];
}

const exists = (p: string) => access(p).then(() => true, () => false);

async function pool<T>(items: T[], n: number, fn: (x: T) => Promise<void>) {
  let i = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) await fn(items[i++]); }));
}

const html = await (await fetch(URL_LIST, { headers: { "user-agent": UA } })).text();
const raw = extract(html);
if (raw.length < 50) throw new Error(`Só ${raw.length} Aniimo encontrados; a estrutura da wiki deve ter mudado.`);

const list = raw
  .map((r) => ({
    id: Number(r.entryId),
    name: r.name,
    element: r.attributes.map((a) => ELEMENTS[a] ?? a.replace("attributes-", "")).join(" / "),
    stage: Number(r.currentStage) || 1,
    description: r.description,
    image: `/aniimo/${r.entryId.padStart(3, "0")}.webp`,
    src: r.imageUrl,
  }))
  .sort((a, b) => a.id - b.id);

const ids = new Set(list.map((a) => a.id));
if (ids.size !== list.length) throw new Error("entryId duplicado na wiki");

await mkdir("public/aniimo", { recursive: true });
await mkdir("data", { recursive: true });

let done = 0;
await pool(list, 6, async (a) => {
  const file = `public${a.image}`;
  if (!FORCE && (await exists(file))) return void done++;
  const res = await fetch(a.src, { headers: { "user-agent": UA } });
  if (!res.ok) throw new Error(`${a.name}: HTTP ${res.status} em ${a.src}`);
  const webp = await sharp(Buffer.from(await res.arrayBuffer()))
    .resize({ width: 320, height: 520, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
  await writeFile(file, webp);
  done++;
});

await writeFile("data/aniimo.json", JSON.stringify(list.map(({ src, ...a }) => a), null, 2) + "\n");
console.log(`${list.length} Aniimo, ${done} imagens em public/aniimo/, dados em data/aniimo.json`);
