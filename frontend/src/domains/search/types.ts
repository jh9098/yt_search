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
  viewCountText: string;
  uploadedAtText: string;
}

export interface SearchSummary {
  totalCount: number;
  shownCount: number;
  resultsState: SearchResultsState;
}
