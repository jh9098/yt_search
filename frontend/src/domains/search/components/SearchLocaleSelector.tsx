import type { SearchUiLocale } from "../i18n/searchUiText";

interface SearchLocaleSelectorProps {
  locale: SearchUiLocale;
  onChange: (locale: SearchUiLocale) => void;
}

const LOCALE_OPTIONS: Array<{ value: SearchUiLocale; label: string }> = [
  { value: "ko", label: "한국어" },
  { value: "en", label: "English" },
];

export function SearchLocaleSelector({ locale, onChange }: SearchLocaleSelectorProps) {
  return (
    <div className="locale-selector-wrap">
      <label htmlFor="search-locale-select" className="locale-selector-label">
        검색 UI 언어
      </label>
      <select
        id="search-locale-select"
        className="locale-selector"
        value={locale}
        onChange={(event) => onChange(event.target.value as SearchUiLocale)}
      >
        {LOCALE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
