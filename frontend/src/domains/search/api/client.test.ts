import { describe, expect, it } from "vitest";
import { buildPrimarySearchUrl, buildSearchRequestPath } from "./client";

describe("search api client url contract", () => {
  it("요청 경로를 /search/videos + 확장 쿼리 문자열로 만든다", () => {
    const path = buildSearchRequestPath({
      q: "가족 대화법",
      channel: "",
      sort: "relevance",
      period: "7d",
      minViews: 0,
      country: "KR",
      maxSubscribers: 100000,
      subscriberPublicOnly: true,
      durationBucket: "under4m",
      shortFormType: "shorts",
      scriptType: "all",
      hoverMetric: "estimatedRevenue",
      minPerformance: 0,
      corePreset: "none",
    });

    expect(path.startsWith("/search/videos?")).toBe(true);
    expect(path).toContain("q=%EA%B0%80%EC%A1%B1+%EB%8C%80%ED%99%94%EB%B2%95");
    expect(path).toContain("sort=relevance");
    expect(path).toContain("period=7d");
    expect(path).toContain("minViews=0");
    expect(path).toContain("country=KR");
    expect(path).toContain("maxSubscribers=100000");
    expect(path).toContain("subscriberPublicOnly=true");
    expect(path).toContain("durationBucket=under4m");
    expect(path).toContain("shortFormType=shorts");
    expect(path).toContain("scriptType=all");
    expect(path).toContain("hoverMetric=estimatedRevenue");
    expect(path).toContain("corePreset=none");
  });

  it("기본 baseUrl(/api)와 결합 시 /api/search/videos가 된다", () => {
    const url = buildPrimarySearchUrl("/search/videos?q=test&sort=relevance&period=7d&minViews=0");
    expect(url).toContain("/api/search/videos");
  });
});
