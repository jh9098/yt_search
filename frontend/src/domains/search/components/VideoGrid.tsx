import { VideoCard } from "./VideoCard";
import type { SearchResultCard, SearchResultsState } from "../types";

interface VideoGridProps {
  cards: SearchResultCard[];
  resultsState: SearchResultsState;
  isAnalyzeDisabled: boolean;
  onAnalyze: (card: SearchResultCard) => void;
}

export function VideoGrid({ cards, resultsState, isAnalyzeDisabled, onAnalyze }: VideoGridProps) {
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
        검색 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.
      </div>
    );
  }

  if (resultsState === "empty") {
    return <div className="results-placeholder">조건에 맞는 영상이 없습니다.</div>;
  }

  return (
    <div className="card-grid">
      {cards.map((card) => (
        <VideoCard
          key={card.videoId}
          card={card}
          isAnalyzeDisabled={isAnalyzeDisabled}
          onAnalyze={onAnalyze}
        />
      ))}
    </div>
  );
}
