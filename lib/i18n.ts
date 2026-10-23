// Idiomas do site = idiomas que a wiki oficial oferece (os textos dos Aniimo vêm de lá).
export const LOCALES = ["pt", "en", "es", "fr", "de", "ja", "ko", "tw", "ru", "id", "th", "vi"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
export const COOKIE = "NEXT_LOCALE";

export const LOCALE_META: Record<Locale, { native: string; html: string; og: string }> = {
  pt: { native: "Português", html: "pt-BR", og: "pt_BR" },
  en: { native: "English", html: "en", og: "en_US" },
  es: { native: "Español", html: "es", og: "es_ES" },
  fr: { native: "Français", html: "fr", og: "fr_FR" },
  de: { native: "Deutsch", html: "de", og: "de_DE" },
  ja: { native: "日本語", html: "ja", og: "ja_JP" },
  ko: { native: "한국어", html: "ko", og: "ko_KR" },
  tw: { native: "繁體中文", html: "zh-TW", og: "zh_TW" },
  ru: { native: "Русский", html: "ru", og: "ru_RU" },
  id: { native: "Bahasa Indonesia", html: "id", og: "id_ID" },
  th: { native: "ไทย", html: "th", og: "th_TH" },
  vi: { native: "Tiếng Việt", html: "vi", og: "vi_VN" },
};

export const isLocale = (x: unknown): x is Locale => typeof x === "string" && (LOCALES as readonly string[]).includes(x);

// Idioma do navegador (Accept-Language) -> idioma suportado. É o sinal principal.
function fromTag(tag: string): Locale | null {
  const t = tag.toLowerCase();
  if (t.startsWith("pt")) return "pt";
  if (t.startsWith("zh")) return "tw"; // só há chinês tradicional; é o mais próximo para qualquer variante
  for (const l of ["en", "es", "fr", "de", "ja", "ko", "ru", "th", "vi"] as const) if (t === l || t.startsWith(l + "-")) return l;
  if (t === "id" || t === "in" || t.startsWith("id-") || t.startsWith("ms")) return "id";
  return null;
}
export function fromAcceptLanguage(header?: string | null): Locale | null {
  if (!header) return null;
  const items = header
    .split(",")
    .map((p) => {
      const [tag, ...params] = p.trim().split(";");
      const q = Number(params.find((x) => x.trim().startsWith("q="))?.split("=")[1] ?? 1);
      return { tag: tag.trim(), q: Number.isFinite(q) ? q : 0 };
    })
    .filter((x) => x.tag && x.tag !== "*" && x.q > 0)
    .sort((a, b) => b.q - a.q);
  for (const { tag } of items) {
    const l = fromTag(tag);
    if (l) return l;
  }
  return null;
}

// País (cabeçalho da Vercel) -> idioma. Só é usado quando o navegador não indica um idioma suportado.
const COUNTRY: Record<string, Locale> = {
  ...Object.fromEntries(["BR", "PT", "AO", "MZ", "CV", "GW", "ST", "TL"].map((c) => [c, "pt"])),
  ...Object.fromEntries(["ES", "MX", "AR", "CO", "CL", "PE", "VE", "EC", "GT", "CU", "BO", "DO", "HN", "PY", "SV", "NI", "CR", "PA", "UY", "PR", "GQ"].map((c) => [c, "es"])),
  ...Object.fromEntries(["FR", "BE", "LU", "MC", "SN", "CI", "CM", "MG", "ML", "BF", "NE", "TG", "BJ", "HT", "GA", "CD", "CG"].map((c) => [c, "fr"])),
  ...Object.fromEntries(["DE", "AT", "LI"].map((c) => [c, "de"])),
  JP: "ja", KR: "ko", ID: "id", TH: "th", VN: "vi",
  ...Object.fromEntries(["TW", "HK", "MO", "CN", "SG"].map((c) => [c, "tw"])),
  ...Object.fromEntries(["RU", "BY", "KZ", "KG", "UA"].map((c) => [c, "ru"])),
};
export const fromCountry = (c?: string | null): Locale | null => (c ? COUNTRY[c.toUpperCase()] ?? null : null);

// Ordem: escolha salva (cookie) > idioma do navegador > país > inglês.
export function detectLocale(i: { cookie?: string | null; acceptLanguage?: string | null; country?: string | null }): Locale {
  if (isLocale(i.cookie)) return i.cookie;
  return fromAcceptLanguage(i.acceptLanguage) ?? fromCountry(i.country) ?? DEFAULT_LOCALE;
}

// Troca o prefixo de idioma de um caminho: /pt/conta -> /en/conta
export function swapLocale(pathname: string, to: Locale): string {
  const parts = pathname.split("/");
  if (isLocale(parts[1])) parts[1] = to;
  else parts.splice(1, 0, to);
  return parts.join("/") || `/${to}`;
}

// {n} -> valor
export function fmt(tpl: string, vars?: Record<string, string | number>): string {
  return vars ? tpl.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`)) : tpl;
}
