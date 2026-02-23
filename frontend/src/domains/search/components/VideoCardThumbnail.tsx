import { useState } from "react";
import type { SearchHoverMetric } from "../types";

interface VideoCardThumbnailProps {
  thumbnailUrl: string;
  title: string;
  durationText: string;
  publishedDateText: string;
  badgeLabel?: string | null;
  hoverMetric: SearchHoverMetric;
  estimatedRevenueTotalText?: string | null;
}

export function VideoCardThumbnail({
  thumbnailUrl,
  title,
  durationText,
  publishedDateText,
  badgeLabel,
  hoverMetric,
  estimatedRevenueTotalText,
}: VideoCardThumbnailProps) {
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const hoverMetricText = estimatedRevenueTotalText ?? "데이터 없음";
  const shouldShowOverlay = hoverMetric === "estimatedRevenue";

  return (
    <div className="video-card-thumbnail-wrap">
      <img className="video-card-thumbnail" src={thumbnailUrl} alt={`${title} 썸네일`} loading="lazy" />
      {badgeLabel ? <span className="video-card-badge-top">{badgeLabel}</span> : null}
      <span className="video-card-badge-bottom">
        {durationText} · {publishedDateText}
      </span>

      {shouldShowOverlay ? (
        <>
          <div className="video-card-hover-overlay" aria-label={`예상 수익 정보: ${hoverMetricText}`}>
            <strong>예상 수익(TOTAL)</strong>
            <span>{hoverMetricText}</span>
          </div>
          <button
            type="button"
            className="video-card-info-button"
            aria-label={`예상 수익 정보: ${hoverMetricText}`}
            onClick={() => setIsInfoOpen((previous) => !previous)}
          >
            i
          </button>
          {isInfoOpen ? (
            <div className="video-card-mobile-caption" aria-label={`예상 수익 정보: ${hoverMetricText}`}>
              예상 수익(TOTAL): {hoverMetricText}
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
