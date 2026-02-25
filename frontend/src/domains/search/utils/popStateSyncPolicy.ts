import type { SearchUiText } from "../i18n/searchUiText.types";
import type { SearchQueryState, SearchViewMode } from "../types";

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

export function getPopStateRestoredMessage(searchUiText: SearchUiText): string {
  return searchUiText.resultSummary.popStateRestoredNotice;
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
