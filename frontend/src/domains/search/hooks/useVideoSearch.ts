import { useCallback, useMemo, useRef, useState } from "react";
import { searchVideos } from "../api/client";
import type {
  SearchApiResponseData,
  SearchFilterState,
  SearchQueryState,
  SearchResultCard,
  SearchResultsState,
  UseVideoSearchResult,
} from "../types";
import { mapSearchErrorMessage } from "../utils/mapSearchErrorMessage";

const SEARCH_FALLBACK_DELAY_MS = 250;

interface VideoSearchExecutorDependencies {
  searchVideosFn: (params: {
    q: string;
    channel: string;
    topic: SearchQueryState["topic"];
    resultLimit: SearchQueryState["resultLimit"];
    sort: SearchFilterState["sort"];
    period: SearchFilterState["period"];
    minViews: number;
    country: string;
    maxSubscribers: number;
    subscriberPublicOnly: boolean;
    durationBucket: SearchFilterState["durationBucket"];
    shortFormType: SearchFilterState["shortFormType"];
    scriptType: SearchFilterState["scriptType"];
    hoverMetric: SearchFilterState["hoverMetric"];
    minPerformance: number;
    corePreset: SearchFilterState["corePreset"];
    apiKeys?: string[];
  }) => Promise<SearchApiResponseData>;
  mapErrorMessageFn: (error: unknown) => string;
  waitFn: (ms: number) => Promise<void>;
}

type VideoSearchExecutorResult =
  | { kind: "skipped" }
  | { kind: "success"; items: SearchResultCard[] }
  | { kind: "error"; message: string };

function buildRequestKey(query: SearchQueryState, filters: SearchFilterState, apiKeys: string[]): string {
  return [
    query.keyword.trim().toLowerCase(),
    query.channel.trim().toLowerCase(),
    query.topic,
    String(query.resultLimit),
    filters.sort,
    filters.period,
    String(filters.minViews),
    filters.country.trim().toUpperCase(),
    String(filters.maxSubscribers),
    String(filters.subscriberPublicOnly),
    filters.durationBucket,
    filters.shortFormType,
    filters.scriptType,
    filters.hoverMetric,
    String(filters.minPerformance),
    filters.corePreset,
    apiKeys.join(","),
  ].join("|");
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    globalThis.setTimeout(resolve, ms);
  });
}

export function createVideoSearchExecutor({
  searchVideosFn,
  mapErrorMessageFn,
  waitFn,
}: VideoSearchExecutorDependencies) {
  let lastRequestKey: string | null = null;

  const execute = async (
    query: SearchQueryState,
    filters: SearchFilterState,
    apiKeys: string[] = [],
  ): Promise<VideoSearchExecutorResult> => {
    const requestKey = buildRequestKey(query, filters, apiKeys);

    if (requestKey === lastRequestKey) {
      return { kind: "skipped" };
    }

    lastRequestKey = requestKey;

    try {
      await waitFn(SEARCH_FALLBACK_DELAY_MS);
      const response = await searchVideosFn({
        q: query.keyword,
        channel: query.channel,
        topic: query.topic,
        resultLimit: query.resultLimit,
        sort: filters.sort,
        period: filters.period,
        minViews: filters.minViews,
        country: filters.country,
        maxSubscribers: filters.maxSubscribers,
        subscriberPublicOnly: filters.subscriberPublicOnly,
        durationBucket: filters.durationBucket,
        shortFormType: filters.shortFormType,
        scriptType: filters.scriptType,
        hoverMetric: filters.hoverMetric,
        minPerformance: filters.minPerformance,
        corePreset: filters.corePreset,
        apiKeys,
      });

      return { kind: "success", items: response.items };
    } catch (caughtError) {
      lastRequestKey = null;
      return { kind: "error", message: mapErrorMessageFn(caughtError) };
    }
  };

  const reset = () => {
    lastRequestKey = null;
  };

  return {
    execute,
    reset,
  };
}

export function useVideoSearch(initialCards: SearchResultCard[]): UseVideoSearchResult {
  const [resultsState, setResultsState] = useState<SearchResultsState>("idle");
  const [visibleCards, setVisibleCards] = useState<SearchResultCard[]>(initialCards);
  const [searchErrorMessage, setSearchErrorMessage] = useState<string | null>(null);
  const executorRef = useRef(
    createVideoSearchExecutor({
      searchVideosFn: searchVideos,
      mapErrorMessageFn: mapSearchErrorMessage,
      waitFn: delay,
    }),
  );

  const runSearch = useCallback(async (query: SearchQueryState, filters: SearchFilterState, apiKeys: string[] = []) => {
    setResultsState("loading");
    setSearchErrorMessage(null);

    const result = await executorRef.current.execute(query, filters, apiKeys);

    if (result.kind === "skipped") {
      return;
    }

    if (result.kind === "error") {
      setVisibleCards([]);
      setSearchErrorMessage(result.message);
      setResultsState("error");
      return;
    }

    setVisibleCards(result.items);
    setResultsState(result.items.length > 0 ? "success" : "empty");
  }, []);


  const resetSearch = useCallback(() => {
    executorRef.current.reset();
    setVisibleCards([]);
    setSearchErrorMessage(null);
    setResultsState("idle");
  }, []);

  return useMemo(
    () => ({
      resultsState,
      searchErrorMessage,
      visibleCards,
      runSearch,
      resetSearch,
    }),
    [resetSearch, resultsState, runSearch, searchErrorMessage, visibleCards],
  );
}
