export type SearchResultsState = "idle" | "loading" | "success" | "empty" | "error";

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
