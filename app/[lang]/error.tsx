"use client";
import { useParams } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import en from "@/lib/messages/en";
import pt from "@/lib/messages/pt";

// Mensagem mínima, sem carregar o dicionário completo: só português e inglês.
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { lang } = useParams<{ lang: string }>();
  const t = isLocale(lang) && lang === "pt" ? pt : en;
  return (
    <main className="page" id="main" tabIndex={-1}>
      <article className="card" role="alert">
        <h1>{t.errTitle}</h1>
        <p>{t.errText}</p>
        <div className="row2">
          <button className="btn" onClick={reset}>{t.retry}</button>
        </div>
      </article>
    </main>
  );
}
