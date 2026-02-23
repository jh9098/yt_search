import type {
  SearchCorePreset,
  SearchDurationBucket,
  SearchFilterState,
  SearchHoverMetric,
  SearchPeriodOption,
  SearchScriptType,
  SearchShortFormType,
  SearchSortOption,
} from "../types";
import { applyCorePreset } from "../utils/corePreset";

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

const DURATION_OPTIONS: Array<{ value: SearchDurationBucket; label: string }> = [
  { value: "all", label: "전체" },
  { value: "under4m", label: "4분 미만" },
  { value: "4to20m", label: "4~20분" },
  { value: "over20m", label: "20분 초과" },
];

const SHORT_FORM_OPTIONS: Array<{ value: SearchShortFormType; label: string }> = [
  { value: "all", label: "전체" },
  { value: "shorts", label: "숏폼만" },
  { value: "longform", label: "롱폼만" },
];

const SCRIPT_OPTIONS: Array<{ value: SearchScriptType; label: string }> = [
  { value: "all", label: "전체" },
  { value: "scripted", label: "스크립트 있음" },
  { value: "noScript", label: "스크립트 없음" },
];

const HOVER_METRIC_OPTIONS: Array<{ value: SearchHoverMetric; label: string }> = [
  { value: "none", label: "표시 안 함" },
  { value: "estimatedRevenue", label: "예상수익(TOTAL)" },
];

const CORE_PRESET_BUTTONS: Array<{ value: SearchCorePreset; label: string }> = [
  { value: "newRapidGrowth", label: "신규 급성장" },
  { value: "efficiencyMonster", label: "고효율 채널" },
  { value: "fastRising", label: "고속 성장" },
  { value: "krTrend", label: "한국 트렌드" },
  { value: "globalTrend", label: "글로벌 트렌드" },
];

function toNonNegativeNumber(raw: string): number {
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export function FilterToolbar({ filters, isDisabled, onChange, onReset }: FilterToolbarProps) {
  return (
    <section className="filter-toolbar" aria-label="검색 필터 도구 모음">
      <div className="core-preset-toolbar">
        {CORE_PRESET_BUTTONS.map((preset) => (
          <button
            key={preset.value}
            type="button"
            disabled={isDisabled}
            className={filters.corePreset === preset.value ? "core-preset-button is-active" : "core-preset-button"}
            onClick={() => onChange(applyCorePreset(filters, preset.value))}
          >
            {preset.label}
          </button>
        ))}
        <button
          type="button"
          disabled={isDisabled}
          className={filters.corePreset === "none" ? "core-preset-button is-active" : "core-preset-button"}
          onClick={() => onChange(applyCorePreset(filters, "none"))}
        >
          프리셋 해제
        </button>
      </div>

      <div className="filter-grid-fields">
        <div className="filter-group">
          <label htmlFor="search-sort" className="filter-label">
            정렬
          </label>
          <select
            id="search-sort"
            className="filter-select"
            value={filters.sort}
            disabled={isDisabled}
            onChange={(event) => onChange({ ...filters, sort: event.target.value as SearchSortOption })}
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
            onChange={(event) => onChange({ ...filters, period: event.target.value as SearchPeriodOption })}
          >
            {PERIOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="search-country" className="filter-label">
            국가 코드
          </label>
          <input
            id="search-country"
            type="text"
            maxLength={2}
            placeholder="예: KR"
            className="filter-input"
            value={filters.country}
            disabled={isDisabled}
            onChange={(event) => onChange({ ...filters, country: event.target.value.toUpperCase() })}
          />
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
            onChange={(event) => onChange({ ...filters, minViews: toNonNegativeNumber(event.target.value) })}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="search-max-subscribers" className="filter-label">
            최대 구독자 수
          </label>
          <input
            id="search-max-subscribers"
            type="number"
            min={0}
            step={1000}
            className="filter-input"
            value={filters.maxSubscribers}
            disabled={isDisabled}
            onChange={(event) => onChange({ ...filters, maxSubscribers: toNonNegativeNumber(event.target.value) })}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="search-duration-bucket" className="filter-label">
            길이
          </label>
          <select
            id="search-duration-bucket"
            className="filter-select"
            value={filters.durationBucket}
            disabled={isDisabled}
            onChange={(event) => onChange({ ...filters, durationBucket: event.target.value as SearchDurationBucket })}
          >
            {DURATION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="search-short-form" className="filter-label">
            숏폼
          </label>
          <select
            id="search-short-form"
            className="filter-select"
            value={filters.shortFormType}
            disabled={isDisabled}
            onChange={(event) => onChange({ ...filters, shortFormType: event.target.value as SearchShortFormType })}
          >
            {SHORT_FORM_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="search-script-type" className="filter-label">
            스크립트
          </label>
          <select
            id="search-script-type"
            className="filter-select"
            value={filters.scriptType}
            disabled={isDisabled}
            onChange={(event) => onChange({ ...filters, scriptType: event.target.value as SearchScriptType })}
          >
            {SCRIPT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="search-hover-metric" className="filter-label">
            마우스오버 정보
          </label>
          <select
            id="search-hover-metric"
            className="filter-select"
            value={filters.hoverMetric}
            disabled={isDisabled}
            onChange={(event) => onChange({ ...filters, hoverMetric: event.target.value as SearchHoverMetric })}
          >
            {HOVER_METRIC_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group filter-group-checkbox">
          <label htmlFor="search-subscriber-public-only" className="filter-label">
            구독자 공개 채널만
          </label>
          <input
            id="search-subscriber-public-only"
            type="checkbox"
            checked={filters.subscriberPublicOnly}
            disabled={isDisabled}
            onChange={(event) => onChange({ ...filters, subscriberPublicOnly: event.target.checked })}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="search-min-performance" className="filter-label">
            최소 성과 지수
          </label>
          <input
            id="search-min-performance"
            type="number"
            min={0}
            step={1}
            className="filter-input"
            value={filters.minPerformance}
            disabled={isDisabled}
            onChange={(event) => onChange({ ...filters, minPerformance: toNonNegativeNumber(event.target.value) })}
          />
        </div>

        <button type="button" onClick={onReset} disabled={isDisabled} className="filter-reset-button">
          필터 초기화
        </button>
      </div>
    </section>
  );
}
