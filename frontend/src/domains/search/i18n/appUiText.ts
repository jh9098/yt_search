import { APP_UI_TEXT_EN } from "./locales/appEn";
import { APP_UI_TEXT_KO } from "./locales/appKo";
import { DEFAULT_SEARCH_UI_LOCALE, isSearchUiLocale, type SearchUiLocale } from "./searchUiText";
import type { AppUiText } from "./appUiText.types";

const APP_UI_TEXT_BY_LOCALE: Record<SearchUiLocale, AppUiText> = {
  ko: APP_UI_TEXT_KO,
  en: APP_UI_TEXT_EN,
};

export function getAppUiText(locale?: string): AppUiText {
  if (typeof locale !== "string" || locale.trim() === "") {
    return APP_UI_TEXT_BY_LOCALE[DEFAULT_SEARCH_UI_LOCALE];
  }

  if (isSearchUiLocale(locale)) {
    return APP_UI_TEXT_BY_LOCALE[locale];
  }

  return APP_UI_TEXT_BY_LOCALE[DEFAULT_SEARCH_UI_LOCALE];
}
