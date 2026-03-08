import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { getSearchUiText } from "../i18n/searchUiText";
import type { SearchResultCard } from "../types";
import { VideoCard } from "./VideoCard";

const CARD_SAMPLE: SearchResultCard = {
  videoId: "video-1",
  title: "가족 대화 실전 팁",
  channelName: "마음연구소",
  thumbnailUrl: "https://img.youtube.com/vi/video-1/hqdefault.jpg",
  durationText: "12:34",
  publishedDateText: "2026-03-01",
  viewCount: 10234,
  viewCountText: "10,234",
  subscriberCount: 56789,
  subscriberCountText: "56,789",
  likeCount: 120,
  commentCount: 45,
  channelPublishedDateText: "2021-10-01",
  countryCode: "KR",
  totalVideoCountText: "120",
  subscriptionRateText: "1.5%",
  annualSubscriberGrowthText: "12%",
  uploadsPerWeekText: "2.1",
  channelGrade: "A",
  isShortForm: false,
  hasScript: true,
  isSubscriberPublic: true,
  keywordMatchedTerms: ["가족", "대화"],
  contributionGrade: "A",
  performanceScore: 87.5,
  exposureScore: 74.2,
  isHotVideo: true,
  recommendationReason: "댓글 참여율이 높아 후속 소재 확장 가능성이 큽니다.",
  estimatedRevenueTotalText: "$123",
  vphText: "120",
  badgeLabel: "급상승",
};

describe("VideoCard", () => {
  it("영문 locale 텍스트를 액션 라벨/aria-label에 반영한다", () => {
    const text = getSearchUiText("en");

    const markup = renderToStaticMarkup(
      <VideoCard
        card={CARD_SAMPLE}
        keyword="family"
        isAnalyzeDisabled={false}
        onAnalyze={vi.fn()}
        onExtractTranscript={vi.fn()}
        hoverMetric="vidiqTrend"
        searchUiText={text}
      />,
    );

    expect(markup).toContain(text.videoCard.watchVideoLabel);
    expect(markup).toContain(text.videoCard.extractTranscriptLabel);
    expect(markup).toContain(text.videoCard.analyzeLabel);
    expect(markup).toContain(`${CARD_SAMPLE.title} ${text.videoCard.watchVideoAriaLabelSuffix}`);
    expect(markup).toContain(`${CARD_SAMPLE.title} ${text.videoCard.extractTranscriptAriaLabelSuffix}`);
    expect(markup).toContain(`${CARD_SAMPLE.title} ${text.videoCard.analyzeAriaLabelSuffix}`);
  });
});
