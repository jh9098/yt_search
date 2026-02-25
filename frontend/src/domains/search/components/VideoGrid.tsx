import { SearchResultTable } from "./SearchResultTable";
import { VideoCard } from "./VideoCard";
import { SEARCH_UI_TEXT } from "../i18n/searchUiText";
import { getSearchErrorUiPolicy } from "../utils/searchErrorUiPolicy";
import type { SearchHoverMetric, SearchResultCard, SearchResultsState, SearchViewMode } from "../types";

interface VideoGridProps {
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
        <p className="results-loading-title">데이터를 분석하고 있습니다...</p>
        <p className="results-loading-subtitle">영상 상세 정보 분석 중...</p>
      </div>
    );
  }

  if (resultsState === "error") {
    const errorUiPolicy = getSearchErrorUiPolicy(isErrorRetryable);

    return (
      <div className="results-placeholder results-placeholder-error" role="alert">
        <p className="results-error-message">
          {errorMessage ?? SEARCH_UI_TEXT.errorPanel.fallbackErrorMessage}
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
    return <div className="results-placeholder">{SEARCH_UI_TEXT.errorPanel.emptyResultMessage}</div>;
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
        />
      ))}
    </div>
  );
}
