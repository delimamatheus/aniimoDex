import type { Locale } from "@/lib/i18n";
import type { Messages } from "./pt";

export type { Messages };

const loaders: Record<Locale, () => Promise<{ default: Messages }>> = {
  pt: () => import("./pt"),
  en: () => import("./en"),
  es: () => import("./es"),
  fr: () => import("./fr"),
  de: () => import("./de"),
  ja: () => import("./ja"),
  ko: () => import("./ko"),
  tw: () => import("./tw"),
  ru: () => import("./ru"),
  id: () => import("./id"),
  th: () => import("./th"),
  vi: () => import("./vi"),
};

export async function getMessages(lang: Locale): Promise<Messages> {
  return (await loaders[lang]()).default;
}
