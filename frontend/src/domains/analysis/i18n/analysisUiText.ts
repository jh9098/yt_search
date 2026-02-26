import { ANALYSIS_UI_TEXT_EN } from "./locales/en";
import { ANALYSIS_UI_TEXT_KO } from "./locales/ko";
import type { AnalysisUiText } from "./analysisUiText.types";
import type { SearchUiLocale } from "../../search/i18n/searchUiText";

export const DEFAULT_ANALYSIS_UI_LOCALE: SearchUiLocale = "ko";

const ANALYSIS_UI_TEXT_BY_LOCALE: Record<SearchUiLocale, AnalysisUiText> = {
  ko: ANALYSIS_UI_TEXT_KO,
  en: ANALYSIS_UI_TEXT_EN,
};

export function getAnalysisUiText(locale?: string): AnalysisUiText {
  if (typeof locale !== "string" || locale.trim() === "") {
    return ANALYSIS_UI_TEXT_BY_LOCALE[DEFAULT_ANALYSIS_UI_LOCALE];
  }

  const normalizedLocale = locale.toLowerCase() as SearchUiLocale;

  if (normalizedLocale in ANALYSIS_UI_TEXT_BY_LOCALE) {
    return ANALYSIS_UI_TEXT_BY_LOCALE[normalizedLocale];
  }

  return ANALYSIS_UI_TEXT_BY_LOCALE[DEFAULT_ANALYSIS_UI_LOCALE];
}

export const ANALYSIS_UI_TEXT = getAnalysisUiText();
