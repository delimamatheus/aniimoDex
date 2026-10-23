import { NextResponse, type NextRequest } from "next/server";
import { COOKIE, detectLocale, isLocale } from "@/lib/i18n";

// Endereços antigos (sem idioma) -> novos nomes
const LEGACY: Record<string, string> = { "/privacidade": "/privacy", "/aviso-legal": "/legal", "/conta": "/account", "/entrar": "/signin" };

// Qualquer caminho sem prefixo de idioma recebe um: escolha salva > idioma do navegador > país > inglês.
// Redirecionamento temporário (307), porque o destino depende de quem acessa.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const seg = pathname.split("/")[1];
  if (isLocale(seg)) {
    // Repassa o idioma da URL às páginas que não recebem params (ex.: not-found).
    const headers = new Headers(req.headers);
    headers.set("x-lang", seg);
    return NextResponse.next({ request: { headers } });
  }

  const lang = detectLocale({
    cookie: req.cookies.get(COOKIE)?.value,
    acceptLanguage: req.headers.get("accept-language"),
    country: req.headers.get("x-vercel-ip-country"),
  });
  const path = LEGACY[pathname] ?? pathname;
  const url = req.nextUrl.clone();
  url.pathname = `/${lang}${path === "/" ? "" : path}`;
  const res = NextResponse.redirect(url);
  res.headers.set("Vary", "Accept-Language, Cookie");
  return res;
}

// Fora: API, arquivos internos do Next e qualquer arquivo com extensão (icon.png, robots.txt, sitemap.xml…)
export const config = { matcher: ["/((?!api|_next|.*\\..*).*)"] };
