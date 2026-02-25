import type React from "react";
import type { SearchUiText } from "../i18n/searchUiText.types";

interface KeywordSearchBarProps {
  searchUiText: SearchUiText;
  keyword: string;
  resultLimit: 50 | 150 | 250;
  isDisabled: boolean;
  isAttentionRequired: boolean;
  keywordInputRef: React.RefObject<HTMLInputElement>;
  onKeywordChange: (value: string) => void;
  onLimitChange: (value: 50 | 150 | 250) => void;
  onSearch: () => void;
}

export function KeywordSearchBar({
  searchUiText,
  keyword,
  resultLimit,
  isDisabled,
  isAttentionRequired,
  keywordInputRef,
  onKeywordChange,
  onLimitChange,
  onSearch,
}: KeywordSearchBarProps) {
  const limitOptions: Array<{ value: 50 | 150 | 250; label: string }> = [
    { value: 50, label: searchUiText.keywordSearch.resultLimitOptions.light },
    { value: 150, label: searchUiText.keywordSearch.resultLimitOptions.standard },
    { value: 250, label: searchUiText.keywordSearch.resultLimitOptions.precise },
  ];

  return (
    <div className="search-input-group" aria-label={searchUiText.keywordSearch.sectionAriaLabel}>
      <label htmlFor="keyword-search-input" className="search-label">
        {searchUiText.keywordSearch.label}
      </label>
      <div className="search-input-row">
        <input
          id="keyword-search-input"
          className={isAttentionRequired ? "search-input search-input-attention" : "search-input"}
          ref={keywordInputRef}
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
          placeholder={searchUiText.keywordSearch.inputPlaceholder}
          aria-label={searchUiText.keywordSearch.inputAriaLabel}
          aria-invalid={isAttentionRequired}
        />
        <button
          type="button"
          onClick={onSearch}
          disabled={isDisabled}
          aria-label={searchUiText.keywordSearch.submitButtonAriaLabel}
        >
          {searchUiText.keywordSearch.submitButtonLabel}
        </button>
        <select
          className="search-select"
          value={resultLimit}
          disabled={isDisabled}
          onChange={(event) => onLimitChange(Number(event.target.value) as 50 | 150 | 250)}
          aria-label={searchUiText.keywordSearch.resultLimitAriaLabel}
        >
          {limitOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
