import { SEARCH_UI_TEXT } from "../i18n/searchUiText";

interface SearchErrorUiPolicy {
  helperMessage: string;
  primaryActionLabel: string;
}

const RETRYABLE_POLICY: SearchErrorUiPolicy = {
  helperMessage: SEARCH_UI_TEXT.errorPanel.retryableHelperMessage,
  primaryActionLabel: SEARCH_UI_TEXT.errorPanel.retryablePrimaryActionLabel,
};

const NON_RETRYABLE_POLICY: SearchErrorUiPolicy = {
  helperMessage: SEARCH_UI_TEXT.errorPanel.nonRetryableHelperMessage,
  primaryActionLabel: SEARCH_UI_TEXT.errorPanel.nonRetryablePrimaryActionLabel,
};

export function getSearchErrorUiPolicy(isRetryable: boolean): SearchErrorUiPolicy {
  return isRetryable ? RETRYABLE_POLICY : NON_RETRYABLE_POLICY;
}
