interface VideoCardThumbnailProps {
  thumbnailUrl: string;
  title: string;
  durationText: string;
  publishedDateText: string;
  badgeLabel?: string | null;
}

export function VideoCardThumbnail({
  thumbnailUrl,
  title,
  durationText,
  publishedDateText,
  badgeLabel,
}: VideoCardThumbnailProps) {
  return (
    <div className="video-card-thumbnail-wrap">
      <img className="video-card-thumbnail" src={thumbnailUrl} alt={`${title} 썸네일`} loading="lazy" />
      {badgeLabel ? <span className="video-card-badge-top">{badgeLabel}</span> : null}
      <span className="video-card-badge-bottom">{durationText} · {publishedDateText}</span>
    </div>
  );
}
