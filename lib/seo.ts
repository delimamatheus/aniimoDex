import { DEFAULT_LOCALE, LOCALES, LOCALE_META, type Locale } from "@/lib/i18n";
import { SITE_NAME } from "@/lib/site";

// canonical + hreflang de uma página: path = "" (início), "/privacy", "/legal"
export function altMeta(lang: Locale, path = "") {
  const languages: Record<string, string> = Object.fromEntries(LOCALES.map((l) => [LOCALE_META[l].html, `/${l}${path}`]));
  languages["x-default"] = `/${DEFAULT_LOCALE}${path}`;
  return { canonical: `/${lang}${path}`, languages };
}

// openGraph completo de uma página. Cada página precisa informar o objeto inteiro:
// o Next substitui (não mescla) o openGraph do layout.
export function ogMeta(lang: Locale, o: { title: string; description: string; path?: string }) {
  return {
    type: "website" as const,
    siteName: SITE_NAME,
    title: o.title,
    description: o.description,
    url: `/${lang}${o.path ?? ""}`,
    locale: LOCALE_META[lang].og,
    alternateLocale: LOCALES.filter((l) => l !== lang).map((l) => LOCALE_META[l].og),
  };
}
