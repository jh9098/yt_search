interface KeywordSearchBarProps {
  keyword: string;
  isDisabled: boolean;
  onKeywordChange: (value: string) => void;
  onSearch: () => void;
}

export function KeywordSearchBar({
  keyword,
  isDisabled,
  onKeywordChange,
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
          className="search-input"
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
          placeholder="예: 가족 대화법"
          aria-label="키워드 입력"
        />
        <button type="button" onClick={onSearch} disabled={isDisabled} aria-label="키워드 검색 실행">
          검색
        </button>
      </div>
    </div>
  );
}
