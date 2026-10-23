import { ImageResponse } from "next/og";
import { isLocale } from "@/lib/i18n";
import { getMessages } from "@/lib/messages";
import { SITE_NAME } from "@/lib/site";

export const alt = SITE_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const HEX = "50,6 94,31 94,83 50,108 6,83 6,31";

// A fonte padrão da imagem só cobre alfabeto latino: nos demais idiomas a frase vai em inglês.
const LATIN = ["pt", "en", "es", "fr", "de", "id"];

export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const t = await getMessages(isLocale(lang) && LATIN.includes(lang) ? lang : "en");
  const hexes = [
    { x: 760, y: 70, o: 0.9 }, { x: 900, y: 150, o: 0.7 }, { x: 760, y: 230, o: 0.55 },
    { x: 900, y: 310, o: 0.9 }, { x: 760, y: 390, o: 0.7 }, { x: 900, y: 470, o: 0.55 },
  ];
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", background: "linear-gradient(160deg,#9cc3dd,#c9dfe9 55%,#a8cdbf)", position: "relative" }}>
        {hexes.map((h, i) => (
          <svg key={i} width="130" height="150" viewBox="0 0 100 114" style={{ position: "absolute", left: h.x, top: h.y, opacity: h.o }}>
            <polygon points={HEX} fill="#fff" />
          </svg>
        ))}
        <div style={{ display: "flex", flexDirection: "column", padding: "0 80px", maxWidth: 720 }}>
          <div style={{ fontSize: 108, fontWeight: 800, color: "#fff", lineHeight: 1, textShadow: "0 3px 10px rgba(0,0,0,.2)" }}>{SITE_NAME}</div>
          <div style={{ fontSize: 40, color: "#23384a", marginTop: 28, lineHeight: 1.25 }}>
            {t.ogTagline}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
