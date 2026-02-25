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
    const mapErrorMessageFn = vi.fn((error: unknown) => String(error));
    const waitFn = vi.fn().mockResolvedValue(undefined);

    const executor = createVideoSearchExecutor({ searchVideosFn, mapErrorMessageFn, waitFn });

    const first = await executor.execute(BASE_QUERY, BASE_FILTERS, ["key-1"]);
    const second = await executor.execute(BASE_QUERY, BASE_FILTERS, ["key-1"]);

    expect(first.kind).toBe("success");
    expect(second.kind).toBe("skipped");
    expect(searchVideosFn).toHaveBeenCalledTimes(1);
    expect(waitFn).toHaveBeenCalledTimes(1);
  });

  it("query가 변경되면 API를 다시 호출한다", async () => {
    const searchVideosFn = vi.fn().mockResolvedValue({ items: [{ videoId: "a" }] });
    const mapErrorMessageFn = vi.fn((error: unknown) => String(error));
    const waitFn = vi.fn().mockResolvedValue(undefined);

    const executor = createVideoSearchExecutor({ searchVideosFn, mapErrorMessageFn, waitFn });

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
    const mapErrorMessageFn = vi.fn(() => "검색에 실패했습니다.");
    const waitFn = vi.fn().mockResolvedValue(undefined);

    const executor = createVideoSearchExecutor({ searchVideosFn, mapErrorMessageFn, waitFn });

    const first = await executor.execute(BASE_QUERY, BASE_FILTERS, []);
    const second = await executor.execute(BASE_QUERY, BASE_FILTERS, []);

    expect(first).toEqual({ kind: "error", message: "검색에 실패했습니다." });
    expect(second.kind).toBe("success");
    expect(searchVideosFn).toHaveBeenCalledTimes(2);
    expect(mapErrorMessageFn).toHaveBeenCalledTimes(1);
  });

  it("reset 이후에는 동일 파라미터도 다시 호출된다", async () => {
    const searchVideosFn = vi.fn().mockResolvedValue({ items: [{ videoId: "a" }] });
    const mapErrorMessageFn = vi.fn((error: unknown) => String(error));
    const waitFn = vi.fn().mockResolvedValue(undefined);

    const executor = createVideoSearchExecutor({ searchVideosFn, mapErrorMessageFn, waitFn });

    await executor.execute(BASE_QUERY, BASE_FILTERS, []);
    executor.reset();
    await executor.execute(BASE_QUERY, BASE_FILTERS, []);

    expect(searchVideosFn).toHaveBeenCalledTimes(2);
    expect(waitFn).toHaveBeenCalledTimes(2);
  });
});
