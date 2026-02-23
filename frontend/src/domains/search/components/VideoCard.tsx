import type { SearchResultCard } from "../types";

interface VideoCardProps {
  card: SearchResultCard;
  isAnalyzeDisabled: boolean;
  onAnalyze: (card: SearchResultCard) => void;
}

export function VideoCard({ card, isAnalyzeDisabled, onAnalyze }: VideoCardProps) {
  return (
    <article className="result-card" aria-label={`영상 카드 ${card.title}`}>
      <p className="result-card-channel">채널: {card.channelName}</p>
      <h2 className="result-card-title">{card.title}</h2>
      <p className="result-card-meta">조회수: {card.viewCountText}</p>
      <p className="result-card-meta">업로드: {card.uploadedAtText}</p>
      <p className="result-card-video-id">videoId: {card.videoId}</p>

      <button
        type="button"
        className="analyze-button"
        disabled={isAnalyzeDisabled}
        onClick={() => onAnalyze(card)}
        aria-label={`${card.title} AI 소재 분석`}
      >
        AI 소재 분석
      </button>
    </article>
  );
}
