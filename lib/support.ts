import QRCode from "qrcode";
import { pixPayload } from "@/lib/pix";

// Dados de apoio vêm de variáveis de ambiente (nada fica no código):
//   KOFI_URL  — https://ko-fi.com/<seu-usuario>
//   PIX_KEY   — chave Pix (recomendado: chave aleatória, para não expor CPF/telefone/e-mail)
//   PIX_NAME / PIX_CITY — nome e cidade do recebedor (opcionais)
// Sem nenhuma delas, o link e a página de apoio não aparecem.

function kofiUrl(): string | null {
  const raw = process.env.KOFI_URL?.trim();
  if (!raw) return null;
  try {
    const u = new URL(raw);
    // só aceita links do próprio Ko-fi, em https
    return u.protocol === "https:" && /(^|\.)ko-fi\.com$/.test(u.hostname) ? u.toString() : null;
  } catch {
    return null;
  }
}

export const supportConfigured = () => !!(kofiUrl() || process.env.PIX_KEY?.trim());

export type Support = { kofi: string | null; pix: { payload: string; qr: string } | null };

export async function getSupport(): Promise<Support | null> {
  const key = process.env.PIX_KEY?.trim();
  const kofi = kofiUrl();
  if (!kofi && !key) return null;

  let pix: Support["pix"] = null;
  if (key) {
    const payload = pixPayload({ key, name: process.env.PIX_NAME ?? "Aniimo Dex", city: process.env.PIX_CITY ?? "Brasil" });
    const svg = await QRCode.toString(payload, { type: "svg", margin: 2, errorCorrectionLevel: "M" });
    pix = { payload, qr: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}` };
  }
  return { kofi, pix };
}
