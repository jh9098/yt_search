import type { SearchUiText } from "../searchUiText.types";

export const SEARCH_UI_TEXT_EN: SearchUiText = {
  resultSummary: {
    sectionAriaLabel: "Search result summary",
    resetButtonAriaLabel: "Reset search filters",
    resetButtonLabel: "Reset filters",
    copyUrlButtonAriaLabel: "Copy current search URL",
    copyUrlButtonLabel: "Copy URL",
    statePrefix: "State:",
    stateLabel: {
      idle: "Enter a keyword and press search",
      loading: "Searching",
      success: "Search complete",
      empty: "No results",
      error: "Search error",
    },
    nonRetryableGuide:
      "Adjust your keyword or filters before retrying. Update your conditions and search again.",
    popStateRestoredNotice: "Restored history state and reloaded search results.",
  },
  errorPanel: {
    fallbackErrorMessage:
      "Something went wrong while searching. Adjust filters and try again using the search button.",
    emptyResultMessage: "No videos match your conditions. Relax filters and try again.",
    retryableHelperMessage: "This may be a temporary issue. Try searching again with the same conditions.",
    retryablePrimaryActionLabel: "Retry with same conditions",
    nonRetryableHelperMessage: "Please adjust your input values or filters, then search again.",
    nonRetryablePrimaryActionLabel: "Reset search filters",
  },
  keywordSearch: {
    sectionAriaLabel: "Keyword search section",
    label: "Keyword search",
    inputPlaceholder: "e.g. family story",
    inputAriaLabel: "Keyword input",
    submitButtonAriaLabel: "Run keyword search",
    submitButtonLabel: "Search",
    resultLimitAriaLabel: "Search result limit",
    resultLimitOptions: {
      light: "50 (light)",
      standard: "150 (standard)",
      precise: "250 (precise)",
    },
  },
};
