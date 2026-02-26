import { VideoCardMetaRows } from "./VideoCardMetaRows";
import { VideoCardThumbnail } from "./VideoCardThumbnail";
import { VideoCardTitle } from "./VideoCardTitle";
import type { SearchUiText } from "../i18n/searchUiText.types";
import type { SearchHoverMetric, SearchResultCard } from "../types";

interface VideoCardProps {
  card: SearchResultCard;
  keyword: string;
  isAnalyzeDisabled: boolean;
  onAnalyze: (card: SearchResultCard) => void;
  onExtractTranscript: (card: SearchResultCard) => void;
  hoverMetric: SearchHoverMetric;
  searchUiText: SearchUiText;
}

export function VideoCard({ card, keyword, isAnalyzeDisabled, onAnalyze, onExtractTranscript, hoverMetric, searchUiText }: VideoCardProps) {
  const videoUrl = `https://www.youtube.com/watch?v=${card.videoId}`;
  const text = searchUiText.videoCard;

  return (
    <article className="result-card" aria-label={`${card.title} ${text.resultCardAriaLabelSuffix}`}>
      <a href={videoUrl} target="_blank" rel="noreferrer" className="video-card-link-wrap" aria-label={`${card.title} ${text.openVideoAriaLabelSuffix}`}>
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

      <a href={videoUrl} target="_blank" rel="noreferrer" className="video-card-link-title" aria-label={`${card.title} ${text.openVideoAriaLabelSuffix}`}>
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
        <a href={videoUrl} target="_blank" rel="noreferrer" className="video-open-button" aria-label={`${card.title} ${text.watchVideoAriaLabelSuffix}`}>
          {text.watchVideoLabel}
        </a>
        <button
          type="button"
          className="video-open-button"
          onClick={() => onExtractTranscript(card)}
          aria-label={`${card.title} ${text.extractTranscriptAriaLabelSuffix}`}
        >
          {text.extractTranscriptLabel}
        </button>
        <button
          type="button"
          className="analyze-button"
          disabled={isAnalyzeDisabled}
          onClick={() => onAnalyze(card)}
          aria-label={`${card.title} ${text.analyzeAriaLabelSuffix}`}
        >
          {text.analyzeLabel}
        </button>
      </div>
    </article>
  );
}
