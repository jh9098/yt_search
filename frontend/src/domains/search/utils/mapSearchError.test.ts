import { describe, expect, it } from "vitest";
import { SearchApiError } from "../api/client";
import { mapSearchError } from "./mapSearchError";

describe("mapSearchError", () => {
  it("SEARCH_QUOTA_EXCEEDED는 고정 메시지 + retryable=true를 반환한다", () => {
    const mapped = mapSearchError(
      new SearchApiError({
        code: "SEARCH_QUOTA_EXCEEDED",
        message: "generic",
      }),
    );

    expect(mapped).toEqual({
      code: "SEARCH_QUOTA_EXCEEDED",
      message: "검색 한도에 도달했습니다. 잠시 후 다시 시도해 주세요.",
      retryable: true,
    });
  });

  it("COMMON_INVALID_REQUEST는 retryable=false를 반환한다", () => {
    const mapped = mapSearchError(
      new SearchApiError({
        code: "COMMON_INVALID_REQUEST",
        message: "invalid request",
      }),
    );

    expect(mapped.retryable).toBe(false);
    expect(mapped.message).toBe("요청값이 올바르지 않습니다. 입력값을 확인해 주세요.");
  });

  it("알 수 없는 코드에서는 서버 메시지를 유지하고 retryable=true를 반환한다", () => {
    const mapped = mapSearchError(
      new SearchApiError({
        code: "UNKNOWN_CODE",
        message: "서버에서 내려준 메시지",
      }),
    );

    expect(mapped).toEqual({
      code: "UNKNOWN_CODE",
      message: "서버에서 내려준 메시지",
      retryable: true,
    });
  });
});
