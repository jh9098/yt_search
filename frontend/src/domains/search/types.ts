export type SearchResultsState = "idle" | "loading" | "success" | "empty" | "error";

export type SearchViewMode = "grid" | "list";

export type SearchSortOption = "subscriberAsc" | "relevance" | "views" | "latest";
export type SearchPeriodOption = "24h" | "7d" | "30d" | "90d" | "180d" | "365d" | "730d" | "all";
export type SearchDurationBucket = "all" | "under4m" | "4to20m" | "over20m";
export type SearchShortFormType =
  | "all"
  | "shopping"
  | "clip"
  | "game"
  | "food"
  | "animal"
  | "knowledge"
  | "beauty"
  | "sports"
  | "entertainment"
  | "other";
export type SearchTopicOption =
  | "all"
  | "shopping"
  | "clip"
  | "game"
  | "food"
  | "animal"
  | "knowledge"
  | "beauty"
  | "sports"
  | "entertainment"
  | "other";
export type SearchScriptType = "all" | "scripted" | "noScript";
export type SearchHoverMetric = "vidiqTrend" | "estimatedRevenue";
export type SearchCorePreset = "none" | "newRapidGrowth" | "efficiencyMonster" | "fastRising" | "krTrend" | "globalTrend";
export type SearchTableSortKey =
  | "title"
  | "channelName"
  | "publishedDateText"
  | "viewCount"
  | "subscriberCount"
  | "channelPublishedDateText"
  | "totalVideoCount"
  | "subscriptionRate"
  | "annualSubscriberGrowth"
  | "uploadsPerWeek"
  | "countryCode"
  | "channelGrade";

export interface SearchFilterState {
  sort: SearchSortOption;
  period: SearchPeriodOption;
  minViews: number;
  country: string;
  maxSubscribers: number;
  subscriberPublicOnly: boolean;
  durationBucket: SearchDurationBucket;
  shortFormType: SearchShortFormType;
  scriptType: SearchScriptType;
  hoverMetric: SearchHoverMetric;
  minPerformance: number;
  corePreset: SearchCorePreset;
}

export interface SearchQueryState {
  keyword: string;
  channel: string;
  topic: SearchTopicOption;
  resultLimit: 50 | 150 | 250;
}

export interface SearchResultCard {
  videoId: string;
  title: string;
  channelName: string;
  thumbnailUrl: string;
  durationText: string;
  publishedDateText: string;
  viewCount: number;
  viewCountText: string;
  subscriberCount: number;
  subscriberCountText: string;
  channelPublishedDateText: string;
  countryCode: string;
  totalVideoCountText: string;
  subscriptionRateText: string;
  annualSubscriberGrowthText: string;
  uploadsPerWeekText: string;
  channelGrade: string;
  isShortForm: boolean;
  hasScript: boolean;
  isSubscriberPublic: boolean;
  keywordMatchedTerms: string[];
  estimatedRevenueTotalText?: string | null;
  vphText?: string | null;
  badgeLabel?: string | null;
}

export interface SearchApiRequestParams {
  q: string;
  channel: string;
  topic: SearchTopicOption;
  resultLimit: 50 | 150 | 250;
  sort: SearchSortOption;
  period: SearchPeriodOption;
  minViews: number;
  country: string;
  maxSubscribers: number;
  subscriberPublicOnly: boolean;
  durationBucket: SearchDurationBucket;
  shortFormType: SearchShortFormType;
  scriptType: SearchScriptType;
  hoverMetric: SearchHoverMetric;
  minPerformance: number;
  corePreset: SearchCorePreset;
  apiKeys?: string[];
}

export interface SearchApiResponseData {
  items: SearchResultCard[];
}

export interface SearchApiSuccessResponse<TData> {
  success: true;
  data: TData;
  meta: {
    requestId: string;
    timestamp: string;
  };
}

export interface SearchApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
  meta: {
    requestId: string;
    timestamp: string;
  };
}

export interface UseVideoSearchResult {
  resultsState: SearchResultsState;
  searchErrorMessage: string | null;
  visibleCards: SearchResultCard[];
  runSearch: (query: SearchQueryState, filters: SearchFilterState, apiKeys?: string[]) => Promise<void>;
  resetSearch: () => void;
}

export interface SearchSummary {
  totalCount: number;
  shownCount: number;
  resultsState: SearchResultsState;
}
