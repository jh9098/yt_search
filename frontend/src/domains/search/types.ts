export type SearchResultsState = "idle" | "loading" | "success" | "empty" | "error";

export type SearchViewMode = "grid" | "list";

export type SearchSortOption = "relevance" | "views" | "latest";
export type SearchPeriodOption = "24h" | "7d" | "30d" | "all";

export interface SearchFilterState {
  sort: SearchSortOption;
  period: SearchPeriodOption;
  minViews: number;
}

export interface SearchQueryState {
  keyword: string;
  channel: string;
}

export interface SearchResultCard {
  videoId: string;
  title: string;
  channelName: string;
  thumbnailUrl: string;
  durationText: string;
  publishedDateText: string;
  viewCountText: string;
  subscriberCountText: string;
  countryCode: string;
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
  sort: SearchSortOption;
  period: SearchPeriodOption;
  minViews: number;
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
  visibleCards: SearchResultCard[];
  runSearch: (query: SearchQueryState, filters: SearchFilterState) => Promise<void>;
  resetSearch: () => void;
}

export interface SearchSummary {
  totalCount: number;
  shownCount: number;
  resultsState: SearchResultsState;
}
