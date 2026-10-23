import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageTop from "@/components/PageTop";
import { isLocale } from "@/lib/i18n";
import { CONTACT_EMAIL, REPO_ISSUES } from "@/lib/legal";
import { getMessages } from "@/lib/messages";
import { altMeta, ogMeta } from "@/lib/seo";

type P = { params: Promise<{ lang: string }> };
// Gerada no build para cada idioma (sem isso o Next trata a rota como dinâmica).
export const dynamic = "force-static";


export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const pt = lang === "pt";
  const title = pt ? "Aviso Legal" : "Legal Notice";
  const description = pt
    ? "O Aniimo Dex é um projeto de fã, sem vínculo oficial com o jogo Aniimo."
    : "Aniimo Dex is a fan project, not officially affiliated with the game Aniimo.";
  return { title, description, alternates: altMeta(lang, "/legal"), openGraph: ogMeta(lang, { title, description, path: "/legal" }) };
}

export default async function Legal({ params }: P) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = await getMessages(lang);
  const pt = lang === "pt";
  const contact = CONTACT_EMAIL ? (
    <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
  ) : (
    <a href={REPO_ISSUES} target="_blank" rel="noopener noreferrer">
      {pt ? "abra uma issue no GitHub" : "open an issue on GitHub"}
      <span className="sr-only">{t.opensNewTab}</span>
    </a>
  );
  const wiki = (
    <a href="https://wiki.aniimo.com" target="_blank" rel="noopener noreferrer">
      wiki.aniimo.com<span className="sr-only">{t.opensNewTab}</span>
    </a>
  );

  return (
    <main className="page" id="main" tabIndex={-1}>
      <PageTop lang={lang} t={t} />
      {lang !== "pt" && lang !== "en" && <p className="banner info">{t.legalFallback}</p>}
      {pt ? (
        <article className="card">
          <h1>Aviso Legal</h1>
          <p className="muted">Última atualização: 22 de outubro de 2026</p>
          <h2>Projeto de fã</h2>
          <p>
            O Aniimo Dex é um projeto de fã, gratuito e sem fins comerciais. <b>Não tem vínculo, patrocínio ou aprovação</b> da desenvolvedora
            ou da publisher do jogo Aniimo.
          </p>
          <h2>Direitos sobre o conteúdo</h2>
          <p>
            Aniimo, seus personagens, nomes, imagens e textos pertencem aos seus respectivos criadores e à empresa responsável pelo jogo. Os
            dados e as imagens exibidos aqui foram obtidos da wiki oficial, {wiki}, e são usados apenas para fins informativos.
          </p>
          <h2>Remoção de conteúdo</h2>
          <p>Se você é titular de direitos e quer que algum conteúdo seja removido, avise e ele será retirado: {contact}.</p>
          <h2>Sem garantias</h2>
          <p>
            As informações podem estar incompletas ou desatualizadas em relação ao jogo, e o serviço é oferecido como está, sem garantia de
            disponibilidade. Veja também a <Link href={`/${lang}/privacy`}>Política de Privacidade</Link>.
          </p>
        </article>
      ) : (
        <article className="card">
          <h1>Legal Notice</h1>
          <p className="muted">Last updated: October 22, 2026</p>
          <h2>Fan project</h2>
          <p>
            Aniimo Dex is a free fan project with no commercial purpose. <b>It is not affiliated with, sponsored by or approved by</b> the
            developer or publisher of the game Aniimo.
          </p>
          <h2>Rights in the content</h2>
          <p>
            Aniimo, its characters, names, images and texts belong to their respective creators and to the company behind the game. The data
            and images shown here were obtained from the official wiki, {wiki}, and are used for informational purposes only.
          </p>
          <h2>Content removal</h2>
          <p>If you are a rights holder and want any content removed, let us know and it will be taken down: {contact}.</p>
          <h2>No warranties</h2>
          <p>
            The information may be incomplete or out of date relative to the game, and the service is provided as is, with no guarantee of
            availability. See also the <Link href={`/${lang}/privacy`}>Privacy Policy</Link>.
          </p>
        </article>
      )}
    </main>
  );
}
