import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { SITE_DESC, SITE_NAME, SITE_URL } from "@/lib/site";

// Fonte servida pelo próprio site (sem requisição ao Google no navegador do visitante).
const nunito = Nunito({ subsets: ["latin"], weight: ["600", "800"], display: "swap", variable: "--font-nunito" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} — Pokédex e tracker de capturas do Aniimo`, template: `%s · ${SITE_NAME}` },
  description: SITE_DESC,
  keywords: ["Aniimo", "Aniimo Dex", "Aniimo dex", "lista de Aniimo", "Aniimo capturados", "formas regionais", "Aniimo cintilante", "Aniimo umbral", "Aniimo prismana"],
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — tracker de capturas do Aniimo`,
    description: SITE_DESC,
    locale: "pt_BR",
  },
  twitter: { card: "summary_large_image", title: `${SITE_NAME} — tracker de capturas do Aniimo`, description: SITE_DESC },
};

export const viewport: Viewport = { themeColor: "#9cc3dd" };

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: "pt-BR",
  description: SITE_DESC,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={nunito.variable}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>
        <a className="skip-link" href="#main">Pular para o conteúdo</a>
        {children}
      </body>
    </html>
  );
}
