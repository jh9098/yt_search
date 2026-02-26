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
    labels: {
      sort: string;
      period: string;
      countryCode: string;
      minViews: string;
      maxSubscribers: string;
      duration: string;
      shortFormType: string;
      scriptType: string;
      hoverMetric: string;
      subscriberPublicOnly: string;
      minPerformance: string;
    };
    placeholders: {
      countryCode: string;
    };
    options: {
      sort: Record<string, string>;
      period: Record<string, string>;
      duration: Record<string, string>;
      shortFormType: Record<string, string>;
      scriptType: Record<string, string>;
      hoverMetric: Record<string, string>;
      minViews: Record<string, string>;
      minPerformance: Record<string, string>;
      corePreset: Record<string, string>;
      clearPreset: string;
    };
  };
  viewMode: {
    sectionAriaLabel: string;
    gridButtonLabel: string;
    listButtonLabel: string;
  };
  videoGrid: {
    loadingTitle: string;
    loadingSubtitle: string;
  };
  videoCard: {
    resultCardAriaLabelSuffix: string;
    openVideoAriaLabelSuffix: string;
    watchVideoLabel: string;
    watchVideoAriaLabelSuffix: string;
    extractTranscriptLabel: string;
    extractTranscriptAriaLabelSuffix: string;
    analyzeLabel: string;
    analyzeAriaLabelSuffix: string;
  };
};
