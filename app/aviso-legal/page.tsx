import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL, REPO_ISSUES, UPDATED } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Aviso Legal",
  description: "O Aniimo Dex é um projeto de fã, sem vínculo oficial com o jogo Aniimo.",
  alternates: { canonical: "/aviso-legal" },
};

export default function Aviso() {
  return (
    <main className="page" id="main" tabIndex={-1}>
      <Link className="back" href="/">← Voltar ao Aniimo Dex</Link>
      <article className="card">
        <h1>Aviso Legal</h1>
        <p className="muted">Última atualização: {UPDATED}</p>
        <h2>Projeto de fã</h2>
        <p>
          O Aniimo Dex é um projeto de fã, gratuito e sem fins comerciais. <b>Não tem vínculo, patrocínio ou aprovação</b> da
          desenvolvedora ou da publisher do jogo Aniimo.
        </p>
        <h2>Direitos sobre o conteúdo</h2>
        <p>
          Aniimo, seus personagens, nomes, imagens e textos pertencem aos seus respectivos criadores e à empresa responsável pelo jogo.
          Os dados e as imagens exibidos aqui foram obtidos da wiki oficial,{" "}
          <a href="https://wiki.aniimo.com" target="_blank" rel="noopener noreferrer">wiki.aniimo.com<span className="sr-only"> (abre em nova aba)</span></a>, e são usados apenas para
          fins informativos.
        </p>
        <h2>Remoção de conteúdo</h2>
        <p>
          Se você é titular de direitos e quer que algum conteúdo seja removido, avise e ele será retirado:{" "}
          {CONTACT_EMAIL ? (
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          ) : (
            <a href={REPO_ISSUES} target="_blank" rel="noopener noreferrer">abra uma issue no GitHub<span className="sr-only"> (abre em nova aba)</span></a>
          )}.
        </p>
        <h2>Sem garantias</h2>
        <p>
          As informações podem estar incompletas ou desatualizadas em relação ao jogo, e o serviço é oferecido como está, sem garantia de
          disponibilidade. Veja também a <Link href="/privacidade">Política de Privacidade</Link>.
        </p>
      </article>
    </main>
  );
}
