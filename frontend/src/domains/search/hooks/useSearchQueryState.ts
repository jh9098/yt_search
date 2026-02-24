import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { SearchQueryState, SearchViewMode } from "../types";

const DEFAULT_QUERY_STATE: SearchQueryState = {
  keyword: "",
  channel: "",
  topic: "all",
  resultLimit: 250,
};

const DEFAULT_VIEW_MODE: SearchViewMode = "grid";

interface UseSearchQueryStateOptions {
  autoSearchOnPopState?: boolean;
  onPopStateQueryRestored?: (queryState: SearchQueryState) => void;
}

interface UseSearchQueryStateResult {
  queryState: SearchQueryState;
  viewMode: SearchViewMode;
  setQueryState: Dispatch<SetStateAction<SearchQueryState>>;
  setViewMode: Dispatch<SetStateAction<SearchViewMode>>;
  copyShareUrl: () => Promise<boolean>;
}

function parseViewMode(rawView: string | null): SearchViewMode {
  if (rawView === "grid" || rawView === "list") {
    return rawView;
  }
  return DEFAULT_VIEW_MODE;
}


function parseTopic(rawTopic: string | null): SearchQueryState["topic"] {
  if (
    rawTopic === "all"
    || rawTopic === "shopping"
    || rawTopic === "clip"
    || rawTopic === "game"
    || rawTopic === "food"
    || rawTopic === "animal"
    || rawTopic === "knowledge"
    || rawTopic === "beauty"
    || rawTopic === "sports"
    || rawTopic === "entertainment"
    || rawTopic === "other"
  ) {
    return rawTopic;
  }

  return DEFAULT_QUERY_STATE.topic;
}

function parseLimit(rawLimit: string | null): SearchQueryState["resultLimit"] {
  if (rawLimit === "50" || rawLimit === "150" || rawLimit === "250") {
    return Number(rawLimit) as SearchQueryState["resultLimit"];
  }

  return DEFAULT_QUERY_STATE.resultLimit;
}

function parseSearchParams(search: string): {
  queryState: SearchQueryState;
  viewMode: SearchViewMode;
} {
  const params = new URLSearchParams(search);
  return {
    queryState: {
      keyword: params.get("q") ?? DEFAULT_QUERY_STATE.keyword,
      channel: params.get("channel") ?? DEFAULT_QUERY_STATE.channel,
      topic: parseTopic(params.get("topic")),
      resultLimit: parseLimit(params.get("limit")),
    },
    viewMode: parseViewMode(params.get("view")),
  };
}

function toSearchString(queryState: SearchQueryState, viewMode: SearchViewMode): string {
  const params = new URLSearchParams();

  const trimmedKeyword = queryState.keyword.trim();
  const trimmedChannel = queryState.channel.trim();

  if (trimmedKeyword.length > 0) {
    params.set("q", trimmedKeyword);
  }

  if (trimmedChannel.length > 0) {
    params.set("channel", trimmedChannel);
  }

  if (viewMode !== DEFAULT_VIEW_MODE) {
    params.set("view", viewMode);
  }

  if (queryState.topic !== DEFAULT_QUERY_STATE.topic) {
    params.set("topic", queryState.topic);
  }

  if (queryState.resultLimit !== DEFAULT_QUERY_STATE.resultLimit) {
    params.set("limit", String(queryState.resultLimit));
  }

  const built = params.toString();
  return built.length > 0 ? `?${built}` : "";
}

function isSameQueryState(left: SearchQueryState, right: SearchQueryState): boolean {
  return (
    left.keyword === right.keyword
    && left.channel === right.channel
    && left.topic === right.topic
    && left.resultLimit === right.resultLimit
  );
}

export function useSearchQueryState(options?: UseSearchQueryStateOptions): UseSearchQueryStateResult {
  const autoSearchOnPopState = options?.autoSearchOnPopState ?? false;
  const onPopStateQueryRestored = options?.onPopStateQueryRestored;

  const initialState = useMemo(() => parseSearchParams(window.location.search), []);
  const [queryState, setQueryState] = useState<SearchQueryState>(initialState.queryState);
  const [viewMode, setViewMode] = useState<SearchViewMode>(initialState.viewMode);
  const lastSearchRef = useRef(window.location.search);
  const queryStateRef = useRef<SearchQueryState>(initialState.queryState);
  const viewModeRef = useRef<SearchViewMode>(initialState.viewMode);

  useEffect(() => {
    queryStateRef.current = queryState;
  }, [queryState]);

  useEffect(() => {
    viewModeRef.current = viewMode;
  }, [viewMode]);

  useEffect(() => {
    const nextSearch = toSearchString(queryState, viewMode);
    if (nextSearch === lastSearchRef.current) {
      return;
    }

    const nextUrl = `${window.location.pathname}${nextSearch}${window.location.hash}`;
    window.history.replaceState(null, "", nextUrl);
    lastSearchRef.current = nextSearch;
  }, [queryState, viewMode]);

  useEffect(() => {
    const handlePopState = () => {
      const parsed = parseSearchParams(window.location.search);

      const hasQueryChanged = !isSameQueryState(parsed.queryState, queryStateRef.current);
      const hasViewModeChanged = parsed.viewMode !== viewModeRef.current;

      if (!hasQueryChanged && !hasViewModeChanged) {
        lastSearchRef.current = window.location.search;
        return;
      }

      setQueryState(parsed.queryState);
      setViewMode(parsed.viewMode);
      lastSearchRef.current = window.location.search;

      if (hasQueryChanged && autoSearchOnPopState && onPopStateQueryRestored) {
        onPopStateQueryRestored(parsed.queryState);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [autoSearchOnPopState, onPopStateQueryRestored]);

  const copyShareUrl = useCallback(async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}${window.location.search}`;

    if (!navigator.clipboard) {
      return false;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      return true;
    } catch {
      return false;
    }
  }, []);

  return {
    queryState,
    viewMode,
    setQueryState,
    setViewMode,
    copyShareUrl,
  };
}
