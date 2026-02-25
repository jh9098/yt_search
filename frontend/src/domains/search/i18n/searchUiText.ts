import { SEARCH_UI_TEXT_EN } from "./locales/en";
import { SEARCH_UI_TEXT_KO } from "./locales/ko";
import type { SearchUiText } from "./searchUiText.types";

export const SEARCH_UI_LOCALES = ["ko", "en"] as const;

export type SearchUiLocale = (typeof SEARCH_UI_LOCALES)[number];

export const DEFAULT_SEARCH_UI_LOCALE: SearchUiLocale = "ko";

const SEARCH_UI_TEXT_BY_LOCALE: Record<SearchUiLocale, SearchUiText> = {
  ko: SEARCH_UI_TEXT_KO,
  en: SEARCH_UI_TEXT_EN,
};

export function isSearchUiLocale(value: string): value is SearchUiLocale {
  return SEARCH_UI_LOCALES.includes(value as SearchUiLocale);
}

export const getSearchUiText = (locale?: string): SearchUiText => {
  if (!locale) {
    return SEARCH_UI_TEXT_BY_LOCALE[DEFAULT_SEARCH_UI_LOCALE];
  }

  if (isSearchUiLocale(locale)) {
    return SEARCH_UI_TEXT_BY_LOCALE[locale];
  }

  return SEARCH_UI_TEXT_BY_LOCALE[DEFAULT_SEARCH_UI_LOCALE];
};

export const SEARCH_UI_TEXT = getSearchUiText();
