import type { MetadataRoute } from "next";
import { LOCALES, LOCALE_META } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";

// Uma entrada por idioma e página, cada uma apontando para as versões nos outros idiomas (hreflang).
const PAGES: { path: string; changeFrequency: "weekly" | "yearly"; priority: number }[] = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.2 },
  { path: "/legal", changeFrequency: "yearly", priority: 0.2 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.flatMap(({ path, ...rest }) =>
    LOCALES.map((l) => ({
      url: `${SITE_URL}/${l}${path}`,
      ...rest,
      alternates: { languages: Object.fromEntries(LOCALES.map((x) => [LOCALE_META[x].html, `${SITE_URL}/${x}${path}`])) },
    })),
  );
}
