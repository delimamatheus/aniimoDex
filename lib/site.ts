// URL pública do site (para canonical, Open Graph e sitemap). Defina NEXT_PUBLIC_SITE_URL ao usar domínio próprio.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://aniimo-dex-flax.vercel.app").replace(/\/$/, "");
export const SITE_NAME = "Aniimo Dex";
export const SITE_DESC =
  "Acompanhe sua coleção de Aniimo: marque os capturados nas storages, incluindo formas regionais, umbral, cintilante e prismana. Projeto de fã, gratuito.";
