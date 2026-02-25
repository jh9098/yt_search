import { describe, expect, it } from "vitest";
import { getSearchUiText } from "../i18n/searchUiText";
import { getSearchErrorUiPolicy } from "./searchErrorUiPolicy";

describe("getSearchErrorUiPolicy", () => {
  it("재시도 가능한 오류는 다시 검색 액션을 반환한다", () => {
    const policy = getSearchErrorUiPolicy({
      isRetryable: true,
      searchUiText: getSearchUiText("ko"),
    });

    expect(policy.primaryActionLabel).toBe("같은 조건으로 다시 검색");
    expect(policy.helperMessage).toContain("일시적인 오류");
  });

  it("재시도 불가 오류는 입력 수정 유도 액션을 반환한다", () => {
    const policy = getSearchErrorUiPolicy({
      isRetryable: false,
      searchUiText: getSearchUiText("ko"),
    });

    expect(policy.primaryActionLabel).toBe("검색 조건 초기화");
    expect(policy.helperMessage).toContain("입력값");
  });
});
