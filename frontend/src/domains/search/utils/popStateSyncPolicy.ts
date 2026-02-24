import type { SearchQueryState, SearchViewMode } from "../types";

export const POPSTATE_RESTORED_MESSAGE = "히스토리 상태를 복구해 검색 결과를 다시 불러왔습니다.";

interface PopStateSyncInputs {
  parsedQueryState: SearchQueryState;
  parsedViewMode: SearchViewMode;
  currentQueryState: SearchQueryState;
  currentViewMode: SearchViewMode;
  autoSearchOnPopState: boolean;
}

export interface PopStateSyncDecision {
  hasQueryChanged: boolean;
  hasViewModeChanged: boolean;
  shouldApplyState: boolean;
  shouldTriggerSearch: boolean;
  shouldShowRestoredNotice: boolean;
}

export function isSameQueryState(left: SearchQueryState, right: SearchQueryState): boolean {
  return (
    left.keyword === right.keyword
    && left.channel === right.channel
    && left.topic === right.topic
    && left.resultLimit === right.resultLimit
  );
}

export function evaluatePopStateSync(inputs: PopStateSyncInputs): PopStateSyncDecision {
  const hasQueryChanged = !isSameQueryState(inputs.parsedQueryState, inputs.currentQueryState);
  const hasViewModeChanged = inputs.parsedViewMode !== inputs.currentViewMode;
  const shouldApplyState = hasQueryChanged || hasViewModeChanged;
  const shouldTriggerSearch = hasQueryChanged && inputs.autoSearchOnPopState;

  return {
    hasQueryChanged,
    hasViewModeChanged,
    shouldApplyState,
    shouldTriggerSearch,
    shouldShowRestoredNotice: shouldTriggerSearch,
  };
}

