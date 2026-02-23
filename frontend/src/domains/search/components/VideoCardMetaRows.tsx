interface VideoCardMetaRowsProps {
  channelName: string;
  countryCode: string;
  viewCountText: string;
  subscriberCountText: string;
  hasScript: boolean;
  isSubscriberPublic: boolean;
  estimatedRevenueTotalText?: string | null;
  vphText?: string | null;
}

export function VideoCardMetaRows({
  channelName,
  countryCode,
  viewCountText,
  subscriberCountText,
  hasScript,
  isSubscriberPublic,
  estimatedRevenueTotalText,
  vphText,
}: VideoCardMetaRowsProps) {
  return (
    <div className="video-card-meta-rows">
      <p className="result-card-meta">채널: {channelName} · 국가: {countryCode}</p>
      <p className="result-card-meta">
        조회수: {viewCountText} · 구독자: {subscriberCountText}
        {isSubscriberPublic ? "" : " (비공개)"}
      </p>
      <p className="result-card-meta">
        스크립트: {hasScript ? "있음" : "없음"}
        {vphText ? ` · 구독자대비 조회효율: ${vphText}` : ""}
        {estimatedRevenueTotalText ? ` · 예상 수익: ${estimatedRevenueTotalText}` : ""}
      </p>
    </div>
  );
}
