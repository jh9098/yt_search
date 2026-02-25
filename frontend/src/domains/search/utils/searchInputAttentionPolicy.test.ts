import { describe, expect, it } from "vitest";
import {
  isSearchInputAttentionRequired,
  shouldTriggerSearchInputAttention,
} from "./searchInputAttentionPolicy";

describe("searchInputAttentionPolicy", () => {
  it("error + retryable=false 일 때만 주의 유도를 요구한다", () => {
    expect(isSearchInputAttentionRequired({ resultsState: "error", isSearchErrorRetryable: false })).toBe(true);
    expect(isSearchInputAttentionRequired({ resultsState: "error", isSearchErrorRetryable: true })).toBe(false);
    expect(isSearchInputAttentionRequired({ resultsState: "loading", isSearchErrorRetryable: false })).toBe(false);
  });

  it("비대상 상태에서 대상 상태로 전환될 때만 포커스 트리거를 반환한다", () => {
    const trigger = shouldTriggerSearchInputAttention({
      previous: { resultsState: "loading", isSearchErrorRetryable: true },
      current: { resultsState: "error", isSearchErrorRetryable: false },
    });

    expect(trigger).toBe(true);
  });

  it("이미 대상 상태였으면 중복 포커스 트리거를 반환하지 않는다", () => {
    const trigger = shouldTriggerSearchInputAttention({
      previous: { resultsState: "error", isSearchErrorRetryable: false },
      current: { resultsState: "error", isSearchErrorRetryable: false },
    });

    expect(trigger).toBe(false);
  });
});
