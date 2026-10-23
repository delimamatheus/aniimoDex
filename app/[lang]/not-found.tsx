import Link from "next/link";
import { headers } from "next/headers";
import { detectLocale, isLocale } from "@/lib/i18n";
import { getMessages } from "@/lib/messages";

// notFound() não recebe params: o idioma vem do cabeçalho x-lang (definido no middleware) ou do navegador.
export default async function NotFound() {
  const h = await headers();
  const fromUrl = h.get("x-lang");
  const lang = isLocale(fromUrl)
    ? fromUrl
    : detectLocale({ acceptLanguage: h.get("accept-language"), country: h.get("x-vercel-ip-country") });
  const t = await getMessages(lang);
  return (
    <main className="page" id="main" tabIndex={-1}>
      <article className="card">
        <h1>{t.nfTitle}</h1>
        <p>{t.nfText}</p>
        <p><Link href={`/${lang}`}>{t.nfBack}</Link></p>
      </article>
    </main>
  );
}
