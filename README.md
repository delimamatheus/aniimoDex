# Aniimo Dex Tracker

Fase 1 (atual): dados mockados em `lib/aniimo.ts`, progresso salvo no localStorage.

    npm install
    npm run dev   # http://localhost:3000

Fase 2: trocar `getAniimo()` por consulta ao Postgres e salvar `caught` no banco, com login e roles.

## Banco de dados (Neon, grátis) + deploy (Vercel)

1. Vercel → projeto → **Storage** → **Create Database** → **Neon** (plano Free). Isso injeta `DATABASE_URL` no projeto.
2. Local: `npx vercel link && npx vercel env pull .env.local` (ou copie a connection string do Neon para `.env.local` como `DATABASE_URL=...`).
3. `npm run db:migrate` cria/atualiza as tabelas (Drizzle, pasta `drizzle/`) e `npm run db:seed` popula `aniimo`.
   Ao mudar `db/schema.ts`: `npm run db:generate` e depois `db:migrate`.
4. Sem `DATABASE_URL`, o app usa os dados mockados.

## Login (Auth.js)

Variáveis (em `.env.local` e na Vercel): `AUTH_SECRET` (gere com `npx auth secret`) e ao menos um provider:

- GitHub: `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET` — callback `<url>/api/auth/callback/github`
- Google: `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` — callback `<url>/api/auth/callback/google`

Logado, o progresso fica na tabela `caught`; no primeiro login o que estava no localStorage é enviado para a conta.
