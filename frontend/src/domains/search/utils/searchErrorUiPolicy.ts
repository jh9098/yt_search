import type { SearchUiText } from "../i18n/searchUiText.types";

interface SearchErrorUiPolicy {
  helperMessage: string;
  primaryActionLabel: string;
}

interface SearchErrorUiPolicyInput {
  isRetryable: boolean;
  searchUiText: SearchUiText;
}

export function getSearchErrorUiPolicy({
  isRetryable,
  searchUiText,
}: SearchErrorUiPolicyInput): SearchErrorUiPolicy {
  if (isRetryable) {
    return {
      helperMessage: searchUiText.errorPanel.retryableHelperMessage,
      primaryActionLabel: searchUiText.errorPanel.retryablePrimaryActionLabel,
    };
  }

  return {
    helperMessage: searchUiText.errorPanel.nonRetryableHelperMessage,
    primaryActionLabel: searchUiText.errorPanel.nonRetryablePrimaryActionLabel,
  };
}
