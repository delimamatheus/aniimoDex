import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageTop from "@/components/PageTop";
import { isLocale, type Locale } from "@/lib/i18n";
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
  const title = pt ? "Política de Privacidade" : "Privacy Policy";
  const description = pt
    ? "Quais dados o Aniimo Dex coleta, para quê, com quem compartilha e como excluir sua conta."
    : "What data Aniimo Dex collects, why, who it is shared with, and how to delete your account.";
  return { title, description, alternates: altMeta(lang, "/privacy"), openGraph: ogMeta(lang, { title, description, path: "/privacy" }) };
}

const Contact = ({ pt, t }: { pt: boolean; t: { opensNewTab: string } }) =>
  CONTACT_EMAIL ? (
    <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
  ) : (
    <a href={REPO_ISSUES} target="_blank" rel="noopener noreferrer">
      {pt ? "abra uma issue no GitHub" : "open an issue on GitHub"}
      <span className="sr-only">{t.opensNewTab}</span>
    </a>
  );

function Pt({ lang, t }: { lang: Locale; t: { opensNewTab: string } }) {
  return (
    <article className="card">
      <h1>Política de Privacidade</h1>
      <p className="muted">Última atualização: 22 de outubro de 2026</p>
      <p>
        O Aniimo Dex é um projeto de fã, gratuito e sem fins comerciais, mantido por uma pessoa física. Esta página explica, de forma direta,
        quais dados tratamos, conforme a Lei Geral de Proteção de Dados (LGPD, Lei 13.709/2018).
      </p>

      <h2>1. Dados que tratamos</h2>
      <ul>
        <li><b>Sem login:</b> seu progresso fica apenas no seu navegador (armazenamento local). Nada é enviado a nós.</li>
        <li>
          <b>Com login (Google ou GitHub):</b> guardamos o identificador da sua conta naquele provedor e o seu progresso (quais Aniimo você
          marcou). Seu nome, e-mail e foto vêm do provedor e ficam apenas no cookie de sessão, sem serem gravados em nosso banco.
        </li>
        <li>
          <b>Perfil público (opcional):</b> se você ativar o compartilhamento em &ldquo;Minha conta&rdquo;, guardamos o nome de exibição que
          você escolheu e um código aleatório do link.
        </li>
        <li><b>Registros técnicos:</b> a hospedagem registra dados de acesso (como endereço IP e navegador) para segurança e funcionamento.</li>
        <li>
          <b>Idioma:</b> escolhemos o idioma do site pelo idioma do seu navegador e, se ele não indicar um idioma disponível, pelo país
          aproximado da sua conexão, informado pela hospedagem. Esse dado não é guardado. Se você trocar o idioma manualmente, guardamos a
          escolha em um cookie do seu navegador.
        </li>
      </ul>

      <h2>2. Para que usamos</h2>
      <p>
        Para salvar e sincronizar seu progresso entre dispositivos, exibir sua coleção por link se você permitir, mostrar o site no seu idioma
        e manter o site seguro e funcionando. Não vendemos dados, não fazemos publicidade nem perfis de comportamento.
      </p>

      <h2>3. Base legal</h2>
      <p>
        Execução do serviço que você pediu ao entrar (art. 7º, V) e seu consentimento para o compartilhamento público do link (art. 7º, I),
        que você pode revogar a qualquer momento.
      </p>

      <h2>4. Com quem compartilhamos</h2>
      <p>Usamos prestadores que operam o serviço por nós, e alguns podem armazenar dados fora do Brasil:</p>
      <ul>
        <li><b>Vercel</b>: hospedagem do site.</li>
        <li><b>Neon</b>: banco de dados (PostgreSQL).</li>
        <li><b>Google</b> e <b>GitHub</b>: autenticação, apenas se você escolher entrar por eles.</li>
      </ul>

      <h2>5. Cookies e armazenamento</h2>
      <p>
        Usamos somente cookies essenciais do login (sessão e proteção contra fraude), um cookie com o idioma que você escolheu e o
        armazenamento local do navegador para guardar seu progresso e preferências (como os atalhos de teclado). Não usamos cookies de
        publicidade nem de análise. As fontes do site são servidas por nós mesmos.
      </p>

      <h2>6. Seus direitos</h2>
      <p>
        Você pode confirmar se tratamos seus dados, acessar, corrigir, pedir a exclusão e revogar consentimentos. Em{" "}
        <Link href={`/${lang}/account`}>Minha conta</Link> você pode desativar ou trocar o link público e <b>excluir todos os seus dados</b>{" "}
        (progresso e perfil) de forma imediata. Para outros pedidos, fale com a gente: <Contact pt t={t} />.
      </p>

      <h2>7. Por quanto tempo guardamos</h2>
      <p>
        Até você excluir seus dados em &ldquo;Minha conta&rdquo; ou pedir a exclusão. Registros técnicos da hospedagem seguem o prazo do
        prestador.
      </p>

      <h2>8. Mudanças</h2>
      <p>Se esta política mudar, a data acima será atualizada.</p>
    </article>
  );
}

function En({ lang, t }: { lang: Locale; t: { opensNewTab: string } }) {
  return (
    <article className="card">
      <h1>Privacy Policy</h1>
      <p className="muted">Last updated: October 22, 2026</p>
      <p>
        Aniimo Dex is a free fan project with no commercial purpose, run by an individual. This page explains plainly what data we process.
        It is written with Brazil&rsquo;s data protection law (LGPD) in mind, and we apply the same practices to everyone.
      </p>

      <h2>1. Data we process</h2>
      <ul>
        <li><b>Without signing in:</b> your progress stays only in your browser (local storage). Nothing is sent to us.</li>
        <li>
          <b>Signed in (Google or GitHub):</b> we store your account identifier at that provider and your progress (which Aniimo you marked).
          Your name, email and photo come from the provider and stay only in the session cookie; they are not written to our database.
        </li>
        <li>
          <b>Public profile (optional):</b> if you turn on sharing in &ldquo;My account&rdquo;, we store the display name you chose and a
          random link code.
        </li>
        <li><b>Technical logs:</b> the hosting provider records access data (such as IP address and browser) for security and operation.</li>
        <li>
          <b>Language:</b> we pick the site language from your browser&rsquo;s language and, if it doesn&rsquo;t indicate a supported one,
          from the approximate country of your connection, provided by the host. This is not stored. If you change the language manually, we
          keep your choice in a cookie in your browser.
        </li>
      </ul>

      <h2>2. What we use it for</h2>
      <p>
        To save and sync your progress across devices, show your collection by link if you allow it, display the site in your language, and
        keep the site secure and running. We don&rsquo;t sell data and we don&rsquo;t do advertising or behavioral profiling.
      </p>

      <h2>3. Legal basis</h2>
      <p>
        Performing the service you asked for when signing in, and your consent to the public sharing link, which you can withdraw at any time.
      </p>

      <h2>4. Who we share it with</h2>
      <p>We use providers that run the service for us, and some may store data outside Brazil:</p>
      <ul>
        <li><b>Vercel</b>: site hosting.</li>
        <li><b>Neon</b>: database (PostgreSQL).</li>
        <li><b>Google</b> and <b>GitHub</b>: authentication, only if you choose to sign in with them.</li>
      </ul>

      <h2>5. Cookies and storage</h2>
      <p>
        We only use essential sign-in cookies (session and fraud protection), a cookie with the language you chose, and your browser&rsquo;s
        local storage to keep your progress and preferences (such as keyboard shortcuts). We use no advertising or analytics cookies. The
        site&rsquo;s fonts are served by us.
      </p>

      <h2>6. Your rights</h2>
      <p>
        You can ask whether we process your data, access it, correct it, request deletion and withdraw consent. In{" "}
        <Link href={`/${lang}/account`}>My account</Link> you can turn off or change the public link and <b>delete all your data</b>{" "}
        (progress and profile) immediately. For anything else, contact us: <Contact pt={false} t={t} />.
      </p>

      <h2>7. How long we keep it</h2>
      <p>Until you delete your data in &ldquo;My account&rdquo; or ask us to. The host&rsquo;s technical logs follow the provider&rsquo;s retention period.</p>

      <h2>8. Changes</h2>
      <p>If this policy changes, the date above will be updated.</p>
    </article>
  );
}

export default async function Privacy({ params }: P) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = await getMessages(lang);
  return (
    <main className="page" id="main" tabIndex={-1}>
      <PageTop lang={lang} t={t} />
      {lang !== "pt" && lang !== "en" && <p className="banner info">{t.legalFallback}</p>}
      {lang === "pt" ? <Pt lang={lang} t={t} /> : <En lang={lang} t={t} />}
    </main>
  );
}
