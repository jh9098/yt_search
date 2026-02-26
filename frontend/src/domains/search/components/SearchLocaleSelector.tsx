import type { AppUiText } from "../i18n/appUiText.types";
import type { SearchUiLocale } from "../i18n/searchUiText";

interface SearchLocaleSelectorProps {
  locale: SearchUiLocale;
  text: AppUiText["localeSelector"];
  onChange: (locale: SearchUiLocale) => void;
}

export function SearchLocaleSelector({ locale, text, onChange }: SearchLocaleSelectorProps) {
  return (
    <div className="locale-selector-wrap">
      <label htmlFor="search-locale-select" className="locale-selector-label">
        {text.label}
      </label>
      <select
        id="search-locale-select"
        className="locale-selector"
        value={locale}
        onChange={(event) => onChange(event.target.value as SearchUiLocale)}
      >
        <option value="ko">{text.options.ko}</option>
        <option value="en">{text.options.en}</option>
      </select>
    </div>
  );
}
