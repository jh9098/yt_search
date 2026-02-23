import type {
  SearchFilterState,
  SearchPeriodOption,
  SearchSortOption,
} from "../types";

interface FilterToolbarProps {
  filters: SearchFilterState;
  isDisabled: boolean;
  onChange: (next: SearchFilterState) => void;
  onReset: () => void;
}

const SORT_OPTIONS: Array<{ value: SearchSortOption; label: string }> = [
  { value: "relevance", label: "관련도" },
  { value: "views", label: "조회수" },
  { value: "latest", label: "최신순" },
];

const PERIOD_OPTIONS: Array<{ value: SearchPeriodOption; label: string }> = [
  { value: "24h", label: "24시간" },
  { value: "7d", label: "7일" },
  { value: "30d", label: "30일" },
  { value: "all", label: "전체" },
];

export function FilterToolbar({ filters, isDisabled, onChange, onReset }: FilterToolbarProps) {
  return (
    <section className="filter-toolbar" aria-label="검색 필터 도구 모음">
      <div className="filter-group">
        <label htmlFor="search-sort" className="filter-label">
          정렬
        </label>
        <select
          id="search-sort"
          className="filter-select"
          value={filters.sort}
          disabled={isDisabled}
          onChange={(event) =>
            onChange({
              ...filters,
              sort: event.target.value as SearchSortOption,
            })
          }
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="search-period" className="filter-label">
          기간
        </label>
        <select
          id="search-period"
          className="filter-select"
          value={filters.period}
          disabled={isDisabled}
          onChange={(event) =>
            onChange({
              ...filters,
              period: event.target.value as SearchPeriodOption,
            })
          }
        >
          {PERIOD_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="search-min-views" className="filter-label">
          최소 조회수
        </label>
        <input
          id="search-min-views"
          type="number"
          min={0}
          step={1000}
          className="filter-input"
          value={filters.minViews}
          disabled={isDisabled}
          onChange={(event) => {
            const next = Number(event.target.value);
            onChange({
              ...filters,
              minViews: Number.isFinite(next) && next >= 0 ? next : 0,
            });
          }}
        />
      </div>

      <button type="button" onClick={onReset} disabled={isDisabled} className="filter-reset-button">
        필터 초기화
      </button>
    </section>
  );
}
