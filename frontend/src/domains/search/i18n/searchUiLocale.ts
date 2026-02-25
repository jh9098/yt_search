import {
  DEFAULT_SEARCH_UI_LOCALE,
  isSearchUiLocale,
  type SearchUiLocale,
} from "./searchUiText";

export const SEARCH_UI_LOCALE_STORAGE_KEY = "yt-search-ui-locale";

export function toSearchUiLocale(candidate: string | null | undefined): SearchUiLocale | null {
  if (!candidate) {
    return null;
  }

  const normalized = candidate.trim().toLowerCase();
  if (normalized.length === 0) {
    return null;
  }

  const [baseLocale] = normalized.split("-");
  if (isSearchUiLocale(baseLocale)) {
    return baseLocale;
  }

  return null;
}

export function resolveSearchUiLocale(options?: {
  storedLocale?: string | null;
  browserLocale?: string | null;
}): SearchUiLocale {
  const fromStorage = toSearchUiLocale(options?.storedLocale);
  if (fromStorage) {
    return fromStorage;
  }

  const fromBrowser = toSearchUiLocale(options?.browserLocale);
  if (fromBrowser) {
    return fromBrowser;
  }

  return DEFAULT_SEARCH_UI_LOCALE;
}

export function loadSearchUiLocale(): SearchUiLocale {
  return resolveSearchUiLocale({
    storedLocale: window.localStorage.getItem(SEARCH_UI_LOCALE_STORAGE_KEY),
    browserLocale: window.navigator.language,
  });
}

export function saveSearchUiLocale(locale: SearchUiLocale): void {
  window.localStorage.setItem(SEARCH_UI_LOCALE_STORAGE_KEY, locale);
}
