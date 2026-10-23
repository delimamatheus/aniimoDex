import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL, REPO_ISSUES, UPDATED } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Quais dados o Aniimo Dex coleta, para quê, com quem compartilha e como excluir sua conta.",
  alternates: { canonical: "/privacidade" },
};

export default function Privacidade() {
  return (
    <main className="page" id="main" tabIndex={-1}>
      <Link className="back" href="/">← Voltar ao Aniimo Dex</Link>
      <article className="card">
        <h1>Política de Privacidade</h1>
        <p className="muted">Última atualização: {UPDATED}</p>
        <p>
          O Aniimo Dex é um projeto de fã, gratuito e sem fins comerciais, mantido por uma pessoa física.
          Esta página explica, de forma direta, quais dados tratamos, conforme a Lei Geral de Proteção de Dados (LGPD, Lei 13.709/2018).
        </p>

        <h2>1. Dados que tratamos</h2>
        <ul>
          <li><b>Sem login:</b> seu progresso fica apenas no seu navegador (armazenamento local). Nada é enviado a nós.</li>
          <li>
            <b>Com login (Google ou GitHub):</b> guardamos o identificador da sua conta naquele provedor e o seu progresso (quais Aniimo
            você marcou). Seu nome, e-mail e foto vêm do provedor e ficam apenas no cookie de sessão, sem serem gravados em nosso banco.
          </li>
          <li>
            <b>Perfil público (opcional):</b> se você ativar o compartilhamento em &ldquo;Minha conta&rdquo;, guardamos o nome de exibição
            que você escolheu e um código aleatório do link.
          </li>
          <li><b>Registros técnicos:</b> a hospedagem registra dados de acesso (como endereço IP e navegador) para segurança e funcionamento.</li>
        </ul>

        <h2>2. Para que usamos</h2>
        <p>Para salvar e sincronizar seu progresso entre dispositivos, exibir sua coleção por link se você permitir, e manter o site seguro e funcionando. Não vendemos dados, não fazemos publicidade nem perfis de comportamento.</p>

        <h2>3. Base legal</h2>
        <p>Execução do serviço que você pediu ao entrar (art. 7º, V) e seu consentimento para o compartilhamento público do link (art. 7º, I), que você pode revogar a qualquer momento.</p>

        <h2>4. Com quem compartilhamos</h2>
        <p>Usamos prestadores que operam o serviço por nós, e alguns podem armazenar dados fora do Brasil:</p>
        <ul>
          <li><b>Vercel</b>: hospedagem do site.</li>
          <li><b>Neon</b>: banco de dados (PostgreSQL).</li>
          <li><b>Google</b> e <b>GitHub</b>: autenticação, apenas se você escolher entrar por eles.</li>
        </ul>

        <h2>5. Cookies e armazenamento</h2>
        <p>
          Usamos somente cookies essenciais do login (sessão e proteção contra fraude) e o armazenamento local do navegador para guardar
          seu progresso e preferências (como os atalhos de teclado). Não usamos cookies de publicidade nem de análise. As fontes do site
          são servidas por nós mesmos.
        </p>

        <h2>6. Seus direitos</h2>
        <p>
          Você pode confirmar se tratamos seus dados, acessar, corrigir, pedir a exclusão e revogar consentimentos. Em{" "}
          <Link href="/conta">Minha conta</Link> você pode desativar ou trocar o link público e <b>excluir todos os seus dados</b> (progresso e perfil) de forma imediata.
          Para outros pedidos, fale com a gente:{" "}
          {CONTACT_EMAIL ? (
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          ) : (
            <a href={REPO_ISSUES} target="_blank" rel="noopener noreferrer">abra uma issue no GitHub<span className="sr-only"> (abre em nova aba)</span></a>
          )}.
        </p>

        <h2>7. Por quanto tempo guardamos</h2>
        <p>Até você excluir seus dados em &ldquo;Minha conta&rdquo; ou pedir a exclusão. Registros técnicos da hospedagem seguem o prazo do prestador.</p>

        <h2>8. Mudanças</h2>
        <p>Se esta política mudar, a data acima será atualizada.</p>
      </article>
    </main>
  );
}
