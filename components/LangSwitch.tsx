"use client";
import { COOKIE, LOCALES, LOCALE_META, isLocale, swapLocale, type Locale } from "@/lib/i18n";

// Troca manual de idioma: guarda a escolha em cookie (vale nas próximas visitas) e abre a mesma página no novo idioma.
export default function LangSwitch({ lang, label }: { lang: Locale; label: string }) {
  return (
    <label className="langsel">
      <span className="sr-only">{label}</span>
      <select
        value={lang}
        aria-label={label}
        onChange={(e) => {
          const to = e.target.value;
          if (!isLocale(to)) return;
          document.cookie = `${COOKIE}=${to}; path=/; max-age=31536000; samesite=lax`;
          location.assign(swapLocale(location.pathname, to) + location.search);
        }}
      >
        {LOCALES.map((l) => (
          <option key={l} value={l} lang={LOCALE_META[l].html}>{LOCALE_META[l].native}</option>
        ))}
      </select>
    </label>
  );
}
