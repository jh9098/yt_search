import type {
  SearchDurationBucket,
  SearchFilterState,
  SearchHoverMetric,
  SearchPeriodOption,
  SearchScriptType,
  SearchShortFormType,
  SearchSortOption,
} from "../types";
import type { SearchUiText } from "../i18n/searchUiText.types";
import { applyCorePreset } from "../utils/corePreset";
import {
  CORE_PRESET_OPTION_VALUES,
  DURATION_OPTION_VALUES,
  HOVER_METRIC_OPTION_VALUES,
  MIN_PERFORMANCE_OPTION_VALUES,
  MIN_VIEW_OPTION_VALUES,
  PERIOD_OPTION_VALUES,
  SCRIPT_OPTION_VALUES,
  SHORT_FORM_OPTION_VALUES,
  SORT_OPTION_VALUES,
} from "./filterToolbarOptions";

interface FilterToolbarProps {
  filters: SearchFilterState;
  isDisabled: boolean;
  onChange: (next: SearchFilterState) => void;
  onReset: () => void;
  searchUiText: SearchUiText;
}

export function FilterToolbar({ filters, isDisabled, onChange, onReset, searchUiText }: FilterToolbarProps) {
  return (
    <section className="filter-toolbar" aria-label={searchUiText.filterToolbar.sectionAriaLabel}>
      <div className="core-preset-toolbar">
        {CORE_PRESET_OPTION_VALUES.map((presetValue) => (
          <button
            key={presetValue}
            type="button"
            disabled={isDisabled}
            className={filters.corePreset === presetValue ? "core-preset-button is-active" : "core-preset-button"}
            onClick={() => onChange(applyCorePreset(filters, presetValue))}
          >
            {searchUiText.filterToolbar.options.corePreset[presetValue]}
          </button>
        ))}
        <button
          type="button"
          disabled={isDisabled}
          className={filters.corePreset === "none" ? "core-preset-button is-active" : "core-preset-button"}
          onClick={() => onChange(applyCorePreset(filters, "none"))}
        >
          {searchUiText.filterToolbar.options.clearPreset}
        </button>
      </div>

      <div className="filter-grid-fields">
        <div className="filter-group">
          <label htmlFor="search-sort" className="filter-label">{searchUiText.filterToolbar.labels.sort}</label>
          <select id="search-sort" className="filter-select" value={filters.sort} disabled={isDisabled} onChange={(event) => onChange({ ...filters, sort: event.target.value as SearchSortOption })}>
            {SORT_OPTION_VALUES.map((value) => <option key={value} value={value}>{searchUiText.filterToolbar.options.sort[value]}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="search-period" className="filter-label">{searchUiText.filterToolbar.labels.period}</label>
          <select id="search-period" className="filter-select" value={filters.period} disabled={isDisabled} onChange={(event) => onChange({ ...filters, period: event.target.value as SearchPeriodOption })}>
            {PERIOD_OPTION_VALUES.map((value) => <option key={value} value={value}>{searchUiText.filterToolbar.options.period[value]}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="search-country" className="filter-label">{searchUiText.filterToolbar.labels.countryCode}</label>
          <input id="search-country" type="text" maxLength={2} placeholder={searchUiText.filterToolbar.placeholders.countryCode} className="filter-input" value={filters.country} disabled={isDisabled} onChange={(event) => onChange({ ...filters, country: event.target.value.toUpperCase() })} />
        </div>

        <div className="filter-group">
          <label htmlFor="search-min-views" className="filter-label">{searchUiText.filterToolbar.labels.minViews}</label>
          <select id="search-min-views" className="filter-select" value={filters.minViews} disabled={isDisabled} onChange={(event) => onChange({ ...filters, minViews: Number(event.target.value) })}>
            {MIN_VIEW_OPTION_VALUES.map((value) => <option key={value} value={value}>{searchUiText.filterToolbar.options.minViews[String(value)]}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="search-max-subscribers" className="filter-label">{searchUiText.filterToolbar.labels.maxSubscribers}</label>
          <input id="search-max-subscribers" type="number" min={0} step={1000} className="filter-input" value={filters.maxSubscribers} disabled={isDisabled} onChange={(event) => onChange({ ...filters, maxSubscribers: Number(event.target.value) || 0 })} />
        </div>

        <div className="filter-group">
          <label htmlFor="search-duration-bucket" className="filter-label">{searchUiText.filterToolbar.labels.duration}</label>
          <select id="search-duration-bucket" className="filter-select" value={filters.durationBucket} disabled={isDisabled} onChange={(event) => onChange({ ...filters, durationBucket: event.target.value as SearchDurationBucket })}>
            {DURATION_OPTION_VALUES.map((value) => <option key={value} value={value}>{searchUiText.filterToolbar.options.duration[value]}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="search-short-form" className="filter-label">{searchUiText.filterToolbar.labels.shortFormType}</label>
          <select id="search-short-form" className="filter-select" value={filters.shortFormType} disabled={isDisabled} onChange={(event) => onChange({ ...filters, shortFormType: event.target.value as SearchShortFormType })}>
            {SHORT_FORM_OPTION_VALUES.map((value) => <option key={value} value={value}>{searchUiText.filterToolbar.options.shortFormType[value]}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="search-script-type" className="filter-label">{searchUiText.filterToolbar.labels.scriptType}</label>
          <select id="search-script-type" className="filter-select" value={filters.scriptType} disabled={isDisabled} onChange={(event) => onChange({ ...filters, scriptType: event.target.value as SearchScriptType })}>
            {SCRIPT_OPTION_VALUES.map((value) => <option key={value} value={value}>{searchUiText.filterToolbar.options.scriptType[value]}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="search-hover-metric" className="filter-label">{searchUiText.filterToolbar.labels.hoverMetric}</label>
          <select id="search-hover-metric" className="filter-select" value={filters.hoverMetric} disabled={isDisabled} onChange={(event) => onChange({ ...filters, hoverMetric: event.target.value as SearchHoverMetric })}>
            {HOVER_METRIC_OPTION_VALUES.map((value) => <option key={value} value={value}>{searchUiText.filterToolbar.options.hoverMetric[value]}</option>)}
          </select>
        </div>

        <div className="filter-group filter-group-checkbox">
          <label htmlFor="search-subscriber-public-only" className="filter-label">{searchUiText.filterToolbar.labels.subscriberPublicOnly}</label>
          <input id="search-subscriber-public-only" type="checkbox" checked={filters.subscriberPublicOnly} disabled={isDisabled} onChange={(event) => onChange({ ...filters, subscriberPublicOnly: event.target.checked })} />
        </div>

        <div className="filter-group">
          <label htmlFor="search-min-performance" className="filter-label">{searchUiText.filterToolbar.labels.minPerformance}</label>
          <select id="search-min-performance" className="filter-select" value={filters.minPerformance} disabled={isDisabled} onChange={(event) => onChange({ ...filters, minPerformance: Number(event.target.value) })}>
            {MIN_PERFORMANCE_OPTION_VALUES.map((value) => <option key={value} value={value}>{searchUiText.filterToolbar.options.minPerformance[String(value)]}</option>)}
          </select>
        </div>

        <button type="button" onClick={onReset} disabled={isDisabled} className="filter-reset-button">{searchUiText.filterToolbar.resetButtonLabel}</button>
      </div>
    </section>
  );
}
