export type Aniimo = { id: number; name: string; element: string; hue: number; image?: string };

// ===== MOCK =====
// Na fase 2 esta função passa a consultar o Postgres (tabela `aniimo`).
// O resto do app só depende de getAniimo(), então nada mais muda.
const NAMES = ["Skippy","Mossling","Embera","Tidepup","Glimmoth","Bramblet","Pebblin","Zephyra","Cindrel","Lumipaw","Frostel","Voltik","Dewdrop","Thornix","Quillby","Marshmo","Sunnyx","Nimbler","Rustle","Cobalto","Fernyx","Gustle","Ashkit","Pondo","Blossa","Craggo","Wispur","Drizzle","Hexbug","Tumblet","Petalune","Ripple","Kindle","Moonlet","Snapdra","Burrowl","Glacier","Sparkle","Mistfin","Oakley","Puddle","Flarepup","Gleamer","Sootlet","Brooklyn","Velvetail","Clovet","Rumbler"];
const ELEMENTS = ["Água", "Fogo", "Planta", "Luz", "Sombra", "Gelo"];

export async function getAniimo(): Promise<Aniimo[]> {
  return Array.from({ length: 60 }, (_, i) => ({
    id: i + 1,
    name: NAMES[i] ?? `Aniimo ${i + 1}`,
    element: ELEMENTS[i % ELEMENTS.length],
    hue: (i * 47) % 360,
  }));
}

// Enquanto não há sprites reais (/public/aniimo/001.png), desenha um bichinho genérico.
export function sprite(a: Aniimo) {
  if (a.image) return a.image;
  const h = a.hue;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><ellipse cx='50' cy='64' rx='30' ry='25' fill='hsl(${h} 65% 62%)'/><circle cx='50' cy='40' r='23' fill='hsl(${h} 70% 72%)'/><ellipse cx='30' cy='20' rx='8' ry='13' fill='hsl(${h} 60% 55%)'/><ellipse cx='70' cy='20' rx='8' ry='13' fill='hsl(${h} 60% 55%)'/><circle cx='42' cy='40' r='4' fill='#fff'/><circle cx='58' cy='40' r='4' fill='#fff'/><circle cx='42' cy='40' r='2' fill='#223'/><circle cx='58' cy='40' r='2' fill='#223'/></svg>`;
  return "data:image/svg+xml," + encodeURIComponent(svg);
}
