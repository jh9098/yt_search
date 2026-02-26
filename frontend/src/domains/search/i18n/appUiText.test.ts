import { describe, expect, it } from "vitest";

import { getAppUiText } from "./appUiText";

describe("getAppUiText", () => {
  it("locale이 없으면 ko 기본값을 반환한다", () => {
    const text = getAppUiText();

    expect(text.appHeader.title).toBe("유튜브 소재 채굴기 v2.0");
  });

  it("지원 locale(en) 요청 시 영어 리소스를 반환한다", () => {
    const text = getAppUiText("en");

    expect(text.appHeader.title).toBe("YouTube Idea Miner v2.0");
    expect(text.transcriptModal.closeButton).toBe("Close");
    expect(text.apiKeyManager.openButton).toBe("Enter keys");
    expect(text.cookieManager.pathTab).toBe("File path");
  });

  it("미지원 locale은 ko로 fallback한다", () => {
    const text = getAppUiText("ja");

    expect(text.appHeader.title).toBe("유튜브 소재 채굴기 v2.0");
  });
});
