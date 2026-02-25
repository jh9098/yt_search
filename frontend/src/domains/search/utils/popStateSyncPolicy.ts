import { SEARCH_UI_TEXT } from "../i18n/searchUiText";
import type { SearchQueryState, SearchViewMode } from "../types";

export const POPSTATE_RESTORED_MESSAGE = SEARCH_UI_TEXT.resultSummary.popStateRestoredNotice;

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

