export type AppUiText = {
  localeSelector: {
    label: string;
    options: {
      ko: string;
      en: string;
    };
  };
  apiKeyManager: {
    sectionAriaLabel: string;
    title: string;
    summaryEmpty: string;
    summaryRegistered: (count: number) => string;
    openButton: string;
    closeButton: string;
    inputPlaceholder: string;
    helpText: string;
    saveButton: string;
    clearButton: string;
  };
  cookieManager: {
    sectionAriaLabel: string;
    title: string;
    summaryConfigured: string;
    summaryNotConfigured: string;
    tabListAriaLabel: string;
    pathTab: string;
    contentTab: string;
    pathPlaceholder: string;
    pathInputAriaLabel: string;
    pathHelpText: string;
    uploadLabel: string;
    contentPlaceholder: string;
    contentAriaLabel: string;
    contentHelpText: string;
  };
  appHeader: {
    title: string;
    subtitle: string;
    quotaAriaLabel: string;
    quotaTitle: string;
  };
  common: {
    analysisPreparing: string;
    copyUrlSuccess: string;
    copyUrlFailure: string;
    transcriptUnknownError: string;
  };
  transcriptModal: {
    dialogAriaLabel: string;
    loadingTitle: string;
    defaultTitle: string;
    closeButton: string;
    loadingMessage: string;
    defaultErrorMessage: string;
    titleLabel: string;
    languageLabel: string;
    sourceLabel: string;
  };
};
