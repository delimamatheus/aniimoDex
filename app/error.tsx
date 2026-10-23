"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="page" id="main" tabIndex={-1}>
      <article className="card" role="alert">
        <h1>Não foi possível carregar</h1>
        <p>Algo deu errado ao buscar os dados. Isso costuma ser passageiro: tente de novo em instantes.</p>
        <div className="row2">
          <button className="btn" onClick={reset}>Tentar novamente</button>
        </div>
      </article>
    </main>
  );
}
