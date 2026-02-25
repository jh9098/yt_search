import { describe, expect, it, vi } from "vitest";
import type { SearchFilterState, SearchQueryState } from "../types";
import { createVideoSearchExecutor } from "./useVideoSearch";

const BASE_QUERY: SearchQueryState = {
  keyword: "가족 대화",
  channel: "",
  topic: "all",
  resultLimit: 50,
};

const BASE_FILTERS: SearchFilterState = {
  sort: "relevance",
  period: "7d",
  minViews: 0,
  country: "KR",
  maxSubscribers: 1_000_000,
  subscriberPublicOnly: false,
  durationBucket: "all",
  shortFormType: "all",
  scriptType: "all",
  hoverMetric: "vidiqTrend",
  minPerformance: 0,
  corePreset: "none",
};

describe("createVideoSearchExecutor", () => {
  it("동일 query/filter/apiKeys 재호출은 API를 중복 호출하지 않는다", async () => {
    const searchVideosFn = vi.fn().mockResolvedValue({ items: [{ videoId: "a" }] });
    const mapErrorFn = vi.fn(() => ({ message: "오류", retryable: true }));
    const waitFn = vi.fn().mockResolvedValue(undefined);

    const executor = createVideoSearchExecutor({ searchVideosFn, mapErrorFn, waitFn });

    const first = await executor.execute(BASE_QUERY, BASE_FILTERS, ["key-1"]);
    const second = await executor.execute(BASE_QUERY, BASE_FILTERS, ["key-1"]);

    expect(first.kind).toBe("success");
    expect(second.kind).toBe("skipped");
    expect(searchVideosFn).toHaveBeenCalledTimes(1);
    expect(waitFn).toHaveBeenCalledTimes(1);
  });

  it("query가 변경되면 API를 다시 호출한다", async () => {
    const searchVideosFn = vi.fn().mockResolvedValue({ items: [{ videoId: "a" }] });
    const mapErrorFn = vi.fn(() => ({ message: "오류", retryable: true }));
    const waitFn = vi.fn().mockResolvedValue(undefined);

    const executor = createVideoSearchExecutor({ searchVideosFn, mapErrorFn, waitFn });

    await executor.execute(BASE_QUERY, BASE_FILTERS, []);
    await executor.execute({ ...BASE_QUERY, keyword: "심리 대화" }, BASE_FILTERS, []);

    expect(searchVideosFn).toHaveBeenCalledTimes(2);
    expect(waitFn).toHaveBeenCalledTimes(2);
  });

  it("에러 후에는 동일 파라미터라도 재시도 호출이 가능하다", async () => {
    const searchVideosFn = vi
      .fn()
      .mockRejectedValueOnce(new Error("network down"))
      .mockResolvedValueOnce({ items: [{ videoId: "retry-ok" }] });
    const mapErrorFn = vi.fn(() => ({ message: "검색에 실패했습니다.", retryable: true }));
    const waitFn = vi.fn().mockResolvedValue(undefined);

    const executor = createVideoSearchExecutor({ searchVideosFn, mapErrorFn, waitFn });

    const first = await executor.execute(BASE_QUERY, BASE_FILTERS, []);
    const second = await executor.execute(BASE_QUERY, BASE_FILTERS, []);

    expect(first).toEqual({ kind: "error", message: "검색에 실패했습니다.", retryable: true });
    expect(second.kind).toBe("success");
    expect(searchVideosFn).toHaveBeenCalledTimes(2);
    expect(mapErrorFn).toHaveBeenCalledTimes(1);
  });

  it("reset 이후에는 동일 파라미터도 다시 호출된다", async () => {
    const searchVideosFn = vi.fn().mockResolvedValue({ items: [{ videoId: "a" }] });
    const mapErrorFn = vi.fn(() => ({ message: "오류", retryable: true }));
    const waitFn = vi.fn().mockResolvedValue(undefined);

    const executor = createVideoSearchExecutor({ searchVideosFn, mapErrorFn, waitFn });

    await executor.execute(BASE_QUERY, BASE_FILTERS, []);
    executor.reset();
    await executor.execute(BASE_QUERY, BASE_FILTERS, []);

    expect(searchVideosFn).toHaveBeenCalledTimes(2);
    expect(waitFn).toHaveBeenCalledTimes(2);
  });

  it("검색 에러코드 매핑 결과의 retryable 값을 그대로 전달한다", async () => {
    const searchVideosFn = vi.fn().mockRejectedValueOnce(new Error("quota"));
    const mapErrorFn = vi.fn(() => ({
      message: "검색 한도에 도달했습니다. 잠시 후 다시 시도해 주세요.",
      retryable: true,
    }));
    const waitFn = vi.fn().mockResolvedValue(undefined);

    const executor = createVideoSearchExecutor({ searchVideosFn, mapErrorFn, waitFn });

    const result = await executor.execute(BASE_QUERY, BASE_FILTERS, []);

    expect(result).toEqual({
      kind: "error",
      message: "검색 한도에 도달했습니다. 잠시 후 다시 시도해 주세요.",
      retryable: true,
    });
  });

  it("입력값 오류처럼 retry 불가 코드도 매핑 결과를 유지한다", async () => {
    const searchVideosFn = vi.fn().mockRejectedValueOnce(new Error("invalid"));
    const mapErrorFn = vi.fn(() => ({
      message: "요청값이 올바르지 않습니다. 입력값을 확인해 주세요.",
      retryable: false,
    }));
    const waitFn = vi.fn().mockResolvedValue(undefined);

    const executor = createVideoSearchExecutor({ searchVideosFn, mapErrorFn, waitFn });

    const result = await executor.execute(BASE_QUERY, BASE_FILTERS, []);

    expect(result).toEqual({
      kind: "error",
      message: "요청값이 올바르지 않습니다. 입력값을 확인해 주세요.",
      retryable: false,
    });
  });
});
