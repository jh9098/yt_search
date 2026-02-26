import type {
  SearchCorePreset,
  SearchDurationBucket,
  SearchHoverMetric,
  SearchPeriodOption,
  SearchScriptType,
  SearchShortFormType,
  SearchSortOption,
} from "../types";

export const SORT_OPTION_VALUES: SearchSortOption[] = ["subscriberAsc", "relevance", "views", "latest", "recommended", "performanceOnly", "opportunityOnly"];

export const PERIOD_OPTION_VALUES: SearchPeriodOption[] = ["24h", "7d", "30d", "90d", "180d", "365d", "730d", "all"];

export const DURATION_OPTION_VALUES: SearchDurationBucket[] = ["all", "under4m", "4to20m", "over20m"];

export const SHORT_FORM_OPTION_VALUES: SearchShortFormType[] = [
  "all",
  "shopping",
  "clip",
  "game",
  "food",
  "animal",
  "knowledge",
  "beauty",
  "sports",
  "entertainment",
  "other",
];

export const SCRIPT_OPTION_VALUES: SearchScriptType[] = ["all", "scripted", "noScript"];

export const HOVER_METRIC_OPTION_VALUES: SearchHoverMetric[] = ["vidiqTrend", "estimatedRevenue"];

export const MIN_VIEW_OPTION_VALUES: number[] = [0, 1_000, 10_000, 50_000, 100_000, 500_000, 1_000_000];

export const MIN_PERFORMANCE_OPTION_VALUES: number[] = [0, 50, 100, 200, 300];

export const CORE_PRESET_OPTION_VALUES: SearchCorePreset[] = [
  "newRapidGrowth",
  "efficiencyMonster",
  "fastRising",
  "krTrend",
  "globalTrend",
];
