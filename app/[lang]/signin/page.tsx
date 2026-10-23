import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { providerIds } from "@/auth";
import PageTop from "@/components/PageTop";
import { isLocale } from "@/lib/i18n";
import { getMessages } from "@/lib/messages";
import SignInButtons from "./SignInButtons";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

type P = { params: Promise<{ lang: string }>; searchParams: Promise<{ callbackUrl?: string; error?: string }> };

export default async function SignIn({ params, searchParams }: P) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const { callbackUrl, error } = await searchParams;
  const t = await getMessages(lang);
  // Só caminhos do próprio site (evita redirecionar para fora após o login).
  const to = callbackUrl && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//") ? callbackUrl : `/${lang}`;
  return (
    <main className="page" id="main" tabIndex={-1}>
      <PageTop lang={lang} t={t} />
      <article className="card">
        <h1>{t.signinTitle}</h1>
        <p>{t.signinText}</p>
        {error && <p className="banner err" role="alert">{t.signinError}</p>}
        {providerIds.length ? (
          <SignInButtons
            callbackUrl={to}
            items={providerIds.map((id) => ({ id, label: t.signinWith.replace("{provider}", id === "github" ? "GitHub" : "Google") }))}
          />
        ) : (
          <p>{t.signinNone}</p>
        )}
      </article>
    </main>
  );
}
