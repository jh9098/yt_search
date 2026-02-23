import { VideoCard } from "./VideoCard";
import type { SearchHoverMetric, SearchResultCard, SearchResultsState, SearchViewMode } from "../types";

interface VideoGridProps {
  cards: SearchResultCard[];
  resultsState: SearchResultsState;
  viewMode: SearchViewMode;
  keyword: string;
  isAnalyzeDisabled: boolean;
  onAnalyze: (card: SearchResultCard) => void;
  hoverMetric: SearchHoverMetric;
}

export function VideoGrid({
  cards,
  resultsState,
  viewMode,
  keyword,
  isAnalyzeDisabled,
  onAnalyze,
  hoverMetric,
}: VideoGridProps) {
  if (resultsState === "loading") {
    return (
      <div className="results-placeholder" role="status" aria-live="polite">
        검색 결과를 불러오는 중입니다...
      </div>
    );
  }

  if (resultsState === "error") {
    return (
      <div className="results-placeholder results-placeholder-error" role="alert">
        검색 중 문제가 발생했습니다. 필터를 조정한 뒤 검색 버튼으로 다시 시도해 주세요.
      </div>
    );
  }

  if (resultsState === "empty") {
    return <div className="results-placeholder">조건에 맞는 영상이 없습니다. 필터를 완화하고 다시 검색해 보세요.</div>;
  }

  return (
    <div className={viewMode === "grid" ? "card-grid" : "card-list"}>
      {cards.map((card) => (
        <VideoCard
          key={card.videoId}
          card={card}
          keyword={keyword}
          isAnalyzeDisabled={isAnalyzeDisabled}
          onAnalyze={onAnalyze}
          hoverMetric={hoverMetric}
        />
      ))}
    </div>
  );
}
