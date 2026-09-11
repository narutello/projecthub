import { en, type Messages } from "./en";
import { fa } from "./fa";

export type Locale = "en" | "fa";
export type { Messages };

export const locales: Locale[] = ["en", "fa"];
export const defaultLocale: Locale = "en";
export const LOCALE_COOKIE = "ph_locale";
export const THEME_COOKIE = "ph_theme";

export const dictionaries: Record<Locale, Messages> = { en, fa };

export function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "fa";
}

export function messagesFor(locale: Locale): Messages {
  return dictionaries[locale];
}

export function dirFor(locale: Locale): "ltr" | "rtl" {
  return locale === "fa" ? "rtl" : "ltr";
}
