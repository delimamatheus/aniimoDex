export type Kind = "base" | "regional" | "prismana";
export type Aniimo = {
  id: number; // número da dex; formas regionais/prismanas repetem o do original
  form: string; // "basic" | "highland" | "prismana" | ...
  formLabel?: string;
  kind: Kind;
  name: string; element: string; hue: number; image?: string; stage?: number; description?: string;
};

// Chave única de uma entrada: "5" (básica) ou "5:highland". Usada no cliente e na API.
export const entryKey = (id: number, form: string) => (form === "basic" ? String(id) : `${id}:${form}`);
export function parseKey(k: string): { id: number; form: string } | null {
  const [id, form = "basic"] = k.split(":");
  return Number.isInteger(Number(id)) && form ? { id: Number(id), form } : null;
}

// ===== MOCK =====
const NAMES = ["Skippy","Mossling","Embera","Tidepup","Glimmoth","Bramblet","Pebblin","Zephyra","Cindrel","Lumipaw","Frostel","Voltik","Dewdrop","Thornix","Quillby","Marshmo","Sunnyx","Nimbler","Rustle","Cobalto","Fernyx","Gustle","Ashkit","Pondo","Blossa","Craggo","Wispur","Drizzle","Hexbug","Tumblet","Petalune","Ripple","Kindle","Moonlet","Snapdra","Burrowl","Glacier","Sparkle","Mistfin","Oakley","Puddle","Flarepup","Gleamer","Sootlet","Brooklyn","Velvetail","Clovet","Rumbler"];
const ELEMENTS = ["Água", "Fogo", "Planta", "Luz", "Sombra", "Gelo"];

export function mockAniimo(): Aniimo[] {
  return Array.from({ length: 60 }, (_, i) => ({
    id: i + 1,
    form: "basic",
    kind: "base" as const,
    name: NAMES[i] ?? `Aniimo ${i + 1}`,
    element: ELEMENTS[i % ELEMENTS.length],
    hue: (i * 47) % 360,
  }));
}

// Lê do Postgres (Neon). O mock só vale em desenvolvimento, sem banco configurado:
// em produção, falha explícita (a página de erro aparece e o Next segue servindo a última versão boa).
export async function getAniimo(): Promise<Aniimo[]> {
  if (!process.env.DATABASE_URL) {
    if (process.env.NODE_ENV === "production") throw new Error("DATABASE_URL não configurada");
    return mockAniimo();
  }
  const { neon } = await import("@neondatabase/serverless");
  const rows = await neon(process.env.DATABASE_URL)`select id, form, form_label, kind, name, element, hue, image, stage, description from aniimo order by position, id`;
  if (!rows.length) {
    if (process.env.NODE_ENV === "production") throw new Error("Tabela aniimo vazia: rode npm run db:seed");
    return mockAniimo();
  }
  return rows.map(({ form_label, ...r }) => ({ ...r, formLabel: form_label ?? undefined, image: r.image ?? undefined, description: r.description ?? undefined })) as Aniimo[];
}

// Enquanto não há sprites reais (/public/aniimo/001.png), desenha um bichinho genérico.
export function sprite(a: Aniimo) {
  if (a.image) return a.image;
  const h = a.hue;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><ellipse cx='50' cy='64' rx='30' ry='25' fill='hsl(${h} 65% 62%)'/><circle cx='50' cy='40' r='23' fill='hsl(${h} 70% 72%)'/><ellipse cx='30' cy='20' rx='8' ry='13' fill='hsl(${h} 60% 55%)'/><ellipse cx='70' cy='20' rx='8' ry='13' fill='hsl(${h} 60% 55%)'/><circle cx='42' cy='40' r='4' fill='#fff'/><circle cx='58' cy='40' r='4' fill='#fff'/><circle cx='42' cy='40' r='2' fill='#223'/><circle cx='58' cy='40' r='2' fill='#223'/></svg>`;
  return "data:image/svg+xml," + encodeURIComponent(svg);
}
