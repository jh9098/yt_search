import { VideoCardMetaRows } from "./VideoCardMetaRows";
import { VideoCardThumbnail } from "./VideoCardThumbnail";
import { VideoCardTitle } from "./VideoCardTitle";
import type { SearchHoverMetric, SearchResultCard } from "../types";

interface VideoCardProps {
  card: SearchResultCard;
  keyword: string;
  isAnalyzeDisabled: boolean;
  onAnalyze: (card: SearchResultCard) => void;
  hoverMetric: SearchHoverMetric;
}

export function VideoCard({ card, keyword, isAnalyzeDisabled, onAnalyze, hoverMetric }: VideoCardProps) {
  const videoUrl = `https://www.youtube.com/watch?v=${card.videoId}`;

  return (
    <article className="result-card" aria-label={`${card.title} 검색 결과 카드`}>
      <a href={videoUrl} target="_blank" rel="noreferrer" className="video-card-link-wrap" aria-label={`${card.title} 영상 열기`}>
        <VideoCardThumbnail
          thumbnailUrl={card.thumbnailUrl}
          title={card.title}
          durationText={card.durationText}
          publishedDateText={card.publishedDateText}
          badgeLabel={card.badgeLabel}
          hoverMetric={hoverMetric}
          estimatedRevenueTotalText={card.estimatedRevenueTotalText}
        />
      </a>

      <a href={videoUrl} target="_blank" rel="noreferrer" className="video-card-link-title" aria-label={`${card.title} 영상 열기`}>
        <VideoCardTitle title={card.title} keyword={keyword} />
      </a>

      <VideoCardMetaRows
        channelName={card.channelName}
        countryCode={card.countryCode}
        viewCountText={card.viewCountText}
        subscriberCountText={card.subscriberCountText}
        hasScript={card.hasScript}
        isSubscriberPublic={card.isSubscriberPublic}
        estimatedRevenueTotalText={card.estimatedRevenueTotalText}
        vphText={card.vphText}
      />

      <div className="video-card-actions">
        <a href={videoUrl} target="_blank" rel="noreferrer" className="video-open-button" aria-label={`${card.title} 영상 보기`}>
          영상 보기
        </a>
        <button
          type="button"
          className="analyze-button"
          disabled={isAnalyzeDisabled}
          onClick={() => onAnalyze(card)}
          aria-label={`${card.title} AI 소재 분석`}
        >
          AI 소재 분석
        </button>
      </div>
    </article>
  );
}
