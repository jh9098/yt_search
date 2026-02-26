import { SearchResultTable } from "./SearchResultTable";
import { VideoCard } from "./VideoCard";
import { getSearchErrorUiPolicy } from "../utils/searchErrorUiPolicy";
import type { SearchUiText } from "../i18n/searchUiText.types";
import type { SearchHoverMetric, SearchResultCard, SearchResultsState, SearchViewMode } from "../types";

interface VideoGridProps {
  searchUiText: SearchUiText;
  cards: SearchResultCard[];
  resultsState: SearchResultsState;
  viewMode: SearchViewMode;
  errorMessage: string | null;
  isErrorRetryable: boolean;
  keyword: string;
  isAnalyzeDisabled: boolean;
  onRetrySearch: () => void;
  onResetSearchConditions: () => void;
  onAnalyze: (card: SearchResultCard) => void;
  onExtractTranscript: (card: SearchResultCard) => void;
  hoverMetric: SearchHoverMetric;
}

export function VideoGrid({
  searchUiText,
  cards,
  resultsState,
  viewMode,
  errorMessage,
  isErrorRetryable,
  keyword,
  isAnalyzeDisabled,
  onRetrySearch,
  onResetSearchConditions,
  onAnalyze,
  onExtractTranscript,
  hoverMetric,
}: VideoGridProps) {
  if (resultsState === "loading") {
    return (
      <div className="results-loading" role="status" aria-live="polite">
        <span className="loading-spinner" aria-hidden="true" />
        <p className="results-loading-title">{searchUiText.videoGrid.loadingTitle}</p>
        <p className="results-loading-subtitle">{searchUiText.videoGrid.loadingSubtitle}</p>
      </div>
    );
  }

  if (resultsState === "error") {
    const errorUiPolicy = getSearchErrorUiPolicy({
      isRetryable: isErrorRetryable,
      searchUiText,
    });

    return (
      <div className="results-placeholder results-placeholder-error" role="alert">
        <p className="results-error-message">
          {errorMessage ?? searchUiText.errorPanel.fallbackErrorMessage}
        </p>
        <p className="results-error-helper">{errorUiPolicy.helperMessage}</p>
        <div className="results-error-actions">
          <button
            type="button"
            onClick={isErrorRetryable ? onRetrySearch : onResetSearchConditions}
            aria-label={errorUiPolicy.primaryActionLabel}
          >
            {errorUiPolicy.primaryActionLabel}
          </button>
        </div>
      </div>
    );
  }

  if (resultsState === "empty") {
    return <div className="results-placeholder">{searchUiText.errorPanel.emptyResultMessage}</div>;
  }

  if (viewMode === "list") {
    return <SearchResultTable cards={cards} />;
  }

  return (
    <div className="card-grid">
      {cards.map((card) => (
        <VideoCard
          key={card.videoId}
          card={card}
          keyword={keyword}
          isAnalyzeDisabled={isAnalyzeDisabled}
          onAnalyze={onAnalyze}
          onExtractTranscript={onExtractTranscript}
          hoverMetric={hoverMetric}
          searchUiText={searchUiText}
        />
      ))}
    </div>
  );
}
