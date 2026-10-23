import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageTop from "@/components/PageTop";
import { isLocale } from "@/lib/i18n";
import { getMessages } from "@/lib/messages";
import { altMeta, ogMeta } from "@/lib/seo";
import { getSupport } from "@/lib/support";
import PixCopy from "./PixCopy";

// Gerada no build (as variáveis de apoio são lidas nessa hora: redeploy depois de mudá-las).
export const dynamic = "force-static";

type P = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang) || !(await getSupport())) return {};
  const t = await getMessages(lang);
  return {
    title: t.supportTitle,
    description: t.supportIntro,
    alternates: altMeta(lang, "/support"),
    openGraph: ogMeta(lang, { title: t.supportTitle, description: t.supportIntro, path: "/support" }),
  };
}

export default async function Support({ params }: P) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const support = await getSupport();
  if (!support) notFound();
  const t = await getMessages(lang);

  return (
    <main className="page" id="main" tabIndex={-1}>
      <PageTop lang={lang} t={t} />
      <article className="card">
        <h1>{t.supportTitle}</h1>
        <p>{t.supportIntro}</p>
        <p className="muted">{t.supportNote}</p>

        {support.kofi && (
          <section aria-labelledby="kofi-h">
            <h2 id="kofi-h">Ko-fi</h2>
            <p>{t.kofiNote}</p>
            <div className="row2">
              <a className="btn" href={support.kofi} target="_blank" rel="noopener noreferrer">
                {t.kofiBtn}<span className="sr-only">{t.opensNewTab}</span>
              </a>
            </div>
          </section>
        )}

        {support.pix && (
          <section aria-labelledby="pix-h">
            <h2 id="pix-h">{t.pixTitle}</h2>
            <p>{t.pixScan}</p>
            {/* QR Code gerado no próprio site, com fundo branco para leitura em qualquer tema */}
            <img className="pixqr" src={support.pix.qr} alt={t.qrAlt} width={240} height={240} />
            <PixCopy code={support.pix.payload} label={t.pixCopy} okText={t.pixCopied} failText={t.pixCopyFail} codeLabel={t.pixCode} />
            <p className="muted">{t.pixOnlyBR}</p>
          </section>
        )}
      </article>
    </main>
  );
}
