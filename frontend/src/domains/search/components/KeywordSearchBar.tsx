import type React from "react";
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
  { value: 50, label: "50개 (라이트)" },
  { value: 150, label: "150개 (표준)" },
  { value: 250, label: "250개 (정밀)" },
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
    <div className="search-input-group" aria-label="키워드 검색 영역">
      <label htmlFor="keyword-search-input" className="search-label">
        키워드 검색
      </label>
      <div className="search-input-row">
        <input
          id="keyword-search-input"
          className={isAttentionRequired ? "search-input search-input-attention" : "search-input"}
          ref={keywordInputRef}
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
          placeholder="예: 가족 사연"
          aria-label="키워드 입력"
          aria-invalid={isAttentionRequired}
        />
        <button type="button" onClick={onSearch} disabled={isDisabled} aria-label="키워드 검색 실행">
          키워드 검색
        </button>
        <select
          className="search-select"
          value={resultLimit}
          disabled={isDisabled}
          onChange={(event) => onLimitChange(Number(event.target.value) as 50 | 150 | 250)}
          aria-label="검색 개수 제한"
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
