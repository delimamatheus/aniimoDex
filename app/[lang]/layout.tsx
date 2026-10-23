import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import { LOCALES, LOCALE_META, isLocale } from "@/lib/i18n";
import { getMessages } from "@/lib/messages";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// Fonte servida pelo próprio site (sem requisição ao Google no navegador do visitante).
// Japonês, coreano, chinês e tailandês usam a fonte do sistema.
const nunito = Nunito({
  subsets: ["latin", "latin-ext", "cyrillic", "vietnamese"],
  weight: ["600", "800"],
  display: "swap",
  variable: "--font-nunito",
});

export const dynamicParams = false;
export const generateStaticParams = () => LOCALES.map((lang) => ({ lang }));
export const viewport: Viewport = { themeColor: "#9cc3dd" };

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = await getMessages(lang);
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t.metaTitle, template: `%s · ${SITE_NAME}` },
    description: t.metaDescription,
    keywords: t.metaKeywords.split(",").map((k) => k.trim()),
    applicationName: SITE_NAME,
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: t.metaTitleShort,
      description: t.metaDescription,
      locale: LOCALE_META[lang].og,
      alternateLocale: LOCALES.filter((l) => l !== lang).map((l) => LOCALE_META[l].og),
    },
    twitter: { card: "summary_large_image", title: t.metaTitleShort, description: t.metaDescription },
  };
}

export default async function RootLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = await getMessages(lang);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: `${SITE_URL}/${lang}`,
    inLanguage: LOCALE_META[lang].html,
    description: t.metaDescription,
  };
  return (
    <html lang={LOCALE_META[lang].html} className={nunito.variable}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>
        <a className="skip-link" href="#main">{t.skipToContent}</a>
        {children}
      </body>
    </html>
  );
}
