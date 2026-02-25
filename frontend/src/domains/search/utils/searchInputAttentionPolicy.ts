import type { SearchResultsState } from "../types";

interface SearchInputAttentionSnapshot {
  resultsState: SearchResultsState;
  isSearchErrorRetryable: boolean;
}

export function isSearchInputAttentionRequired(snapshot: SearchInputAttentionSnapshot): boolean {
  return snapshot.resultsState === "error" && !snapshot.isSearchErrorRetryable;
}

export function shouldTriggerSearchInputAttention(params: {
  previous: SearchInputAttentionSnapshot | null;
  current: SearchInputAttentionSnapshot;
}): boolean {
  const wasAttentionRequired = params.previous ? isSearchInputAttentionRequired(params.previous) : false;
  const isAttentionRequired = isSearchInputAttentionRequired(params.current);

  return !wasAttentionRequired && isAttentionRequired;
}
