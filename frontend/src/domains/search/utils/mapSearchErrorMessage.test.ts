import { describe, expect, it } from "vitest";
import { SearchApiError } from "../api/client";
import { mapSearchErrorMessage } from "./mapSearchErrorMessage";

describe("mapSearchErrorMessage", () => {
  it("SEARCH_UPSTREAM_UNAVAILABLE 코드를 사용자 안내 문구로 변환한다", () => {
    const error = new SearchApiError({
      code: "SEARCH_UPSTREAM_UNAVAILABLE",
      message: "generic",
    });

    expect(mapSearchErrorMessage(error)).toContain("YOUTUBE_API_KEY");
  });

  it("알 수 없는 코드에서는 서버 메시지를 그대로 노출한다", () => {
    const error = new SearchApiError({
      code: "UNKNOWN_CODE",
      message: "서버에서 내려준 메시지",
    });

    expect(mapSearchErrorMessage(error)).toBe("서버에서 내려준 메시지");
  });

  it("SearchApiError가 아닌 경우 기본 문구를 반환한다", () => {
    expect(mapSearchErrorMessage(new Error("boom"))).toContain("검색 중 문제가 발생했습니다");
  });
});
