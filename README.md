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
5. Dados reais: `npm run wiki:fetch` baixa da wiki a listagem, as formas regionais/prismanas e os sprites (para `public/aniimo/` e `data/aniimo.json`); `npm run db:seed` grava no banco. A tabela `aniimo` tem uma linha por (número, forma); `position` define a ordem (básicas, depois regionais; prismanas ficam em lista própria).

## Login (Auth.js)

Variáveis (em `.env.local` e na Vercel): `AUTH_SECRET` (gere com `npx auth secret`) e ao menos um provider:

- GitHub: `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET` — callback `<url>/api/auth/callback/github`
- Google: `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` — callback `<url>/api/auth/callback/google`

Logado, o progresso fica na tabela `caught`; no primeiro login o que estava no localStorage é enviado para a conta.

## Créditos

Projeto de fã, gratuito e sem vínculo oficial com o jogo. Aceita doações voluntárias só para cobrir custos, sem anúncios.

- **Aniimo** e todos os personagens, nomes, imagens e textos pertencem aos seus respectivos criadores e à empresa responsável pelo jogo.
- Os dados e sprites da listagem foram obtidos da wiki oficial: [wiki.aniimo.com](https://wiki.aniimo.com).

Se você é titular dos direitos e deseja que algum conteúdo seja removido, abra uma issue neste repositório.

## Variáveis opcionais

- `ADMIN_USER_IDS`: contas que acessam `/admin`, separadas por vírgula (ex.: `github:12345,google:98765`). O ID aparece em `/conta` depois do login.
- `NEXT_PUBLIC_SITE_URL`: URL pública (canonical, Open Graph, sitemap). Padrão: `https://aniimo-dex-flax.vercel.app`.
- `NEXT_PUBLIC_CONTACT_EMAIL`: e-mail exibido em Privacidade e Aviso legal. Sem ele, o contato é pelas issues do GitHub.

Ícones do site: `node --experimental-strip-types scripts/make-icons.ts <imagem-quadrada>` regenera `app/icon.png`, `app/apple-icon.png` e `app/favicon.ico`.

## Idiomas

O site existe em 12 idiomas, os mesmos da wiki oficial: `pt en es fr de ja ko tw ru id th vi`. Cada um tem a própria URL (`/pt`, `/ja`, …), com `hreflang` e sitemap por idioma.

- **Detecção automática** (`middleware.ts`, `lib/i18n.ts`): quem abre `/` é redirecionado (307) para um idioma, nesta ordem: escolha salva em cookie (`NEXT_LOCALE`) > idioma do navegador (`Accept-Language`) > país da conexão (cabeçalho `x-vercel-ip-country`, só na Vercel) > inglês. O país é só apoio: não define o idioma de quem tem um idioma suportado no navegador.
- **Troca manual**: seletor no topo; a escolha vira cookie.
- **Textos da interface**: `lib/messages/<idioma>.ts`. O português (`pt.ts`) define as chaves e o TypeScript obriga os outros a ter todas.
- **Nome, descrição e forma de cada Aniimo**: vêm da wiki (`npm run wiki:fetch` gera `data/i18n.json`; `npm run db:seed` grava na tabela `aniimo_i18n`). Sem tradução para um idioma, vale o português.
- Política de privacidade e aviso legal existem em português e inglês; os outros idiomas mostram a versão em inglês com um aviso.
- Painel de admin (`/<idioma>/admin`) só em português.

## Apoio (Ko-fi e Pix)

A página `/<idioma>/support` e o link no rodapé só aparecem se houver algo configurado (na Vercel e no `.env.local`; é preciso redeploy depois de mudar):

- `KOFI_URL`: `https://ko-fi.com/<seu-usuario>` (só aceita links do ko-fi.com).
- `PIX_KEY`: chave Pix. Prefira uma **chave aleatória**, para não expor CPF, telefone ou e-mail.
- `PIX_NAME` e `PIX_CITY` (opcionais): nome e cidade do recebedor.

O QR Code e o "copia e cola" são gerados no próprio site (`lib/pix.ts`), sem valor fixo.
