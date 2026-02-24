import { describe, expect, it } from "vitest";
import { evaluatePopStateSync, isSameQueryState } from "./popStateSyncPolicy";

describe("isSameQueryState", () => {
  it("모든 필드가 같으면 true를 반환한다", () => {
    expect(
      isSameQueryState(
        { keyword: "abc", channel: "chan", topic: "all", resultLimit: 250 },
        { keyword: "abc", channel: "chan", topic: "all", resultLimit: 250 },
      ),
    ).toBe(true);
  });

  it("하나라도 다르면 false를 반환한다", () => {
    expect(
      isSameQueryState(
        { keyword: "abc", channel: "chan", topic: "all", resultLimit: 250 },
        { keyword: "abc", channel: "chan", topic: "shopping", resultLimit: 250 },
      ),
    ).toBe(false);
  });
});

describe("evaluatePopStateSync", () => {
  it("query/view가 동일하면 상태 반영/재조회/안내를 모두 생략한다", () => {
    const decision = evaluatePopStateSync({
      parsedQueryState: { keyword: "abc", channel: "chan", topic: "all", resultLimit: 250 },
      parsedViewMode: "grid",
      currentQueryState: { keyword: "abc", channel: "chan", topic: "all", resultLimit: 250 },
      currentViewMode: "grid",
      autoSearchOnPopState: true,
    });

    expect(decision.shouldApplyState).toBe(false);
    expect(decision.shouldTriggerSearch).toBe(false);
    expect(decision.shouldShowRestoredNotice).toBe(false);
  });

  it("query가 변경되고 autoSearchOnPopState=true면 재조회/안내를 수행한다", () => {
    const decision = evaluatePopStateSync({
      parsedQueryState: { keyword: "next", channel: "chan", topic: "all", resultLimit: 250 },
      parsedViewMode: "grid",
      currentQueryState: { keyword: "prev", channel: "chan", topic: "all", resultLimit: 250 },
      currentViewMode: "grid",
      autoSearchOnPopState: true,
    });

    expect(decision.shouldApplyState).toBe(true);
    expect(decision.shouldTriggerSearch).toBe(true);
    expect(decision.shouldShowRestoredNotice).toBe(true);
  });

  it("query가 변경돼도 autoSearchOnPopState=false면 안내를 노출하지 않는다", () => {
    const decision = evaluatePopStateSync({
      parsedQueryState: { keyword: "next", channel: "chan", topic: "all", resultLimit: 250 },
      parsedViewMode: "grid",
      currentQueryState: { keyword: "prev", channel: "chan", topic: "all", resultLimit: 250 },
      currentViewMode: "grid",
      autoSearchOnPopState: false,
    });

    expect(decision.shouldApplyState).toBe(true);
    expect(decision.shouldTriggerSearch).toBe(false);
    expect(decision.shouldShowRestoredNotice).toBe(false);
  });
});
