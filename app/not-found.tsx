import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page" id="main" tabIndex={-1}>
      <article className="card">
        <h1>Página não encontrada</h1>
        <p>O endereço não existe ou foi removido.</p>
        <p><Link href="/">Voltar ao Aniimo Dex</Link></p>
      </article>
    </main>
  );
}
