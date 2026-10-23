import Link from "next/link";
import LangSwitch from "@/components/LangSwitch";
import type { Locale } from "@/lib/i18n";
import type { Messages } from "@/lib/messages";

// Topo das páginas de texto: link de volta + seletor de idioma
export default function PageTop({ lang, t }: { lang: Locale; t: Messages }) {
  return (
    <div className="pagetop">
      <Link className="back" href={`/${lang}`}>{t.back}</Link>
      <LangSwitch lang={lang} label={t.language} />
    </div>
  );
}
