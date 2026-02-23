import { SearchResultTable } from "./SearchResultTable";
import { VideoCard } from "./VideoCard";
import type { SearchHoverMetric, SearchResultCard, SearchResultsState, SearchViewMode } from "../types";

interface VideoGridProps {
  cards: SearchResultCard[];
  resultsState: SearchResultsState;
  viewMode: SearchViewMode;
  errorMessage: string | null;
  keyword: string;
  isAnalyzeDisabled: boolean;
  onAnalyze: (card: SearchResultCard) => void;
  onExtractTranscript: (card: SearchResultCard) => void;
  hoverMetric: SearchHoverMetric;
}

export function VideoGrid({
  cards,
  resultsState,
  viewMode,
  errorMessage,
  keyword,
  isAnalyzeDisabled,
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
    return (
      <div className="results-placeholder results-placeholder-error" role="alert">
        {errorMessage ?? "검색 중 문제가 발생했습니다. 필터를 조정한 뒤 검색 버튼으로 다시 시도해 주세요."}
      </div>
    );
  }

  if (resultsState === "empty") {
    return <div className="results-placeholder">조건에 맞는 영상이 없습니다. 필터를 완화하고 다시 검색해 보세요.</div>;
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
