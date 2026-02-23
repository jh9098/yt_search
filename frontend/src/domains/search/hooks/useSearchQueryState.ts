import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { SearchQueryState, SearchViewMode } from "../types";

const DEFAULT_QUERY_STATE: SearchQueryState = {
  keyword: "",
  channel: "",
};

const DEFAULT_VIEW_MODE: SearchViewMode = "grid";

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

function parseSearchParams(search: string): {
  queryState: SearchQueryState;
  viewMode: SearchViewMode;
} {
  const params = new URLSearchParams(search);
  return {
    queryState: {
      keyword: params.get("q") ?? DEFAULT_QUERY_STATE.keyword,
      channel: params.get("channel") ?? DEFAULT_QUERY_STATE.channel,
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

  const built = params.toString();
  return built.length > 0 ? `?${built}` : "";
}

export function useSearchQueryState(): UseSearchQueryStateResult {
  const initialState = useMemo(() => parseSearchParams(window.location.search), []);
  const [queryState, setQueryState] = useState<SearchQueryState>(initialState.queryState);
  const [viewMode, setViewMode] = useState<SearchViewMode>(initialState.viewMode);
  const lastSearchRef = useRef(window.location.search);

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
      setQueryState(parsed.queryState);
      setViewMode(parsed.viewMode);
      lastSearchRef.current = window.location.search;
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

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
