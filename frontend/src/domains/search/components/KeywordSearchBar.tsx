import type React from "react";
import { SEARCH_UI_TEXT } from "../i18n/searchUiText";

interface KeywordSearchBarProps {
  keyword: string;
  resultLimit: 50 | 150 | 250;
  isDisabled: boolean;
  isAttentionRequired: boolean;
  keywordInputRef: React.RefObject<HTMLInputElement>;
  onKeywordChange: (value: string) => void;
  onLimitChange: (value: 50 | 150 | 250) => void;
  onSearch: () => void;
}

const LIMIT_OPTIONS: Array<{ value: 50 | 150 | 250; label: string }> = [
  { value: 50, label: SEARCH_UI_TEXT.keywordSearch.resultLimitOptions.light },
  { value: 150, label: SEARCH_UI_TEXT.keywordSearch.resultLimitOptions.standard },
  { value: 250, label: SEARCH_UI_TEXT.keywordSearch.resultLimitOptions.precise },
];

export function KeywordSearchBar({
  keyword,
  resultLimit,
  isDisabled,
  isAttentionRequired,
  keywordInputRef,
  onKeywordChange,
  onLimitChange,
  onSearch,
}: KeywordSearchBarProps) {
  return (
    <div className="search-input-group" aria-label={SEARCH_UI_TEXT.keywordSearch.sectionAriaLabel}>
      <label htmlFor="keyword-search-input" className="search-label">
        {SEARCH_UI_TEXT.keywordSearch.label}
      </label>
      <div className="search-input-row">
        <input
          id="keyword-search-input"
          className={isAttentionRequired ? "search-input search-input-attention" : "search-input"}
          ref={keywordInputRef}
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
          placeholder={SEARCH_UI_TEXT.keywordSearch.inputPlaceholder}
          aria-label={SEARCH_UI_TEXT.keywordSearch.inputAriaLabel}
          aria-invalid={isAttentionRequired}
        />
        <button
          type="button"
          onClick={onSearch}
          disabled={isDisabled}
          aria-label={SEARCH_UI_TEXT.keywordSearch.submitButtonAriaLabel}
        >
          {SEARCH_UI_TEXT.keywordSearch.submitButtonLabel}
        </button>
        <select
          className="search-select"
          value={resultLimit}
          disabled={isDisabled}
          onChange={(event) => onLimitChange(Number(event.target.value) as 50 | 150 | 250)}
          aria-label={SEARCH_UI_TEXT.keywordSearch.resultLimitAriaLabel}
        >
          {LIMIT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
