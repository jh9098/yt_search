export type SearchUiText = {
  searchLayout: {
    panelAriaLabel: string;
    toolbarAriaLabel: string;
    resultSectionAriaLabel: string;
  };
  resultSummary: {
    sectionAriaLabel: string;
    resetButtonAriaLabel: string;
    resetButtonLabel: string;
    copyUrlButtonAriaLabel: string;
    copyUrlButtonLabel: string;
    statePrefix: string;
    stateLabel: {
      idle: string;
      loading: string;
      success: string;
      empty: string;
      error: string;
    };
    nonRetryableGuide: string;
    popStateRestoredNotice: string;
  };
  errorPanel: {
    fallbackErrorMessage: string;
    emptyResultMessage: string;
    retryableHelperMessage: string;
    retryablePrimaryActionLabel: string;
    nonRetryableHelperMessage: string;
    nonRetryablePrimaryActionLabel: string;
  };
  keywordSearch: {
    sectionAriaLabel: string;
    label: string;
    inputPlaceholder: string;
    inputAriaLabel: string;
    submitButtonAriaLabel: string;
    submitButtonLabel: string;
    resultLimitAriaLabel: string;
    resultLimitOptions: {
      light: string;
      standard: string;
      precise: string;
    };
  };
  channelSearch: {
    sectionAriaLabel: string;
    label: string;
    inputPlaceholder: string;
    inputAriaLabel: string;
    submitButtonAriaLabel: string;
    submitButtonLabel: string;
    topicSelectAriaLabel: string;
  };
  filterToolbar: {
    sectionAriaLabel: string;
    resetButtonLabel: string;
  };
  viewMode: {
    sectionAriaLabel: string;
    gridButtonLabel: string;
    listButtonLabel: string;
  };
};
