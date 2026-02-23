import { VideoCardMetaRows } from "./VideoCardMetaRows";
import { VideoCardThumbnail } from "./VideoCardThumbnail";
import { VideoCardTitle } from "./VideoCardTitle";
import type { SearchResultCard } from "../types";

interface VideoCardProps {
  card: SearchResultCard;
  keyword: string;
  isAnalyzeDisabled: boolean;
  onAnalyze: (card: SearchResultCard) => void;
}

export function VideoCard({ card, keyword, isAnalyzeDisabled, onAnalyze }: VideoCardProps) {
  return (
    <article className="result-card" aria-label={`영상 카드 ${card.title}`}>
      <VideoCardThumbnail
        thumbnailUrl={card.thumbnailUrl}
        title={card.title}
        durationText={card.durationText}
        publishedDateText={card.publishedDateText}
        badgeLabel={card.badgeLabel}
      />
      <VideoCardTitle title={card.title} keyword={keyword} />
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
