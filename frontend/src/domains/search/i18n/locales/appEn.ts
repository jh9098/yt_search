import type { AppUiText } from "../appUiText.types";

export const APP_UI_TEXT_EN: AppUiText = {
  appHeader: {
    title: "YouTube Idea Miner v2.0",
    subtitle: "Run AI content analysis directly from search results.",
    quotaAriaLabel: "Estimated quota remaining",
    quotaTitle: "Estimated quota remaining",
  },
  common: {
    analysisPreparing: "Preparing analysis.",
    copyUrlSuccess: "URL copied.",
    copyUrlFailure: "Failed to copy URL.",
    transcriptUnknownError: "An unknown error occurred while extracting transcript.",
  },
  transcriptModal: {
    dialogAriaLabel: "Video transcript extraction result",
    loadingTitle: "Extracting transcript",
    defaultTitle: "Video transcript",
    closeButton: "Close",
    loadingMessage: "Fetching transcript...",
    defaultErrorMessage: "Failed to extract transcript.",
    titleLabel: "Title",
    languageLabel: "Language",
    sourceLabel: "Source",
  },
};
