import { useCallback, useMemo, useRef, useState } from "react";
import { searchVideos, SearchApiError } from "../api/client";
import type {
  SearchFilterState,
  SearchQueryState,
  SearchResultCard,
  SearchResultsState,
  UseVideoSearchResult,
} from "../types";

const SEARCH_FALLBACK_DELAY_MS = 250;

function buildRequestKey(query: SearchQueryState, filters: SearchFilterState): string {
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
  ].join("|");
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function useVideoSearch(initialCards: SearchResultCard[]): UseVideoSearchResult {
  const [resultsState, setResultsState] = useState<SearchResultsState>("idle");
  const [visibleCards, setVisibleCards] = useState<SearchResultCard[]>(initialCards);
  const lastRequestKeyRef = useRef<string | null>(null);

  const runSearch = useCallback(async (query: SearchQueryState, filters: SearchFilterState) => {
    const requestKey = buildRequestKey(query, filters);

    if (requestKey === lastRequestKeyRef.current) {
      return;
    }

    lastRequestKeyRef.current = requestKey;
    setResultsState("loading");

    try {
      await delay(SEARCH_FALLBACK_DELAY_MS);
      const response = await searchVideos({
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
      });

      setVisibleCards(response.items);
      setResultsState(response.items.length > 0 ? "success" : "empty");
    } catch (caughtError) {
      if (caughtError instanceof SearchApiError) {
        setVisibleCards([]);
        setResultsState("error");
        return;
      }

      setVisibleCards([]);
      setResultsState("error");
    }
  }, []);


  const resetSearch = useCallback(() => {
    lastRequestKeyRef.current = null;
    setVisibleCards([]);
    setResultsState("idle");
  }, []);

  return useMemo(
    () => ({
      resultsState,
      visibleCards,
      runSearch,
      resetSearch,
    }),
    [resetSearch, resultsState, runSearch, visibleCards],
  );
}
