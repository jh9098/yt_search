import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnalysisModal } from "./domains/analysis/components/AnalysisModal";
import {
  AnalysisApiError,
  createAnalysisJob,
  getAnalysisJobStatus,
} from "./domains/analysis/api/client";
import { analysisErrorMock } from "./domains/analysis/mocks/analysisResult.mock";
import { mapAnalysisError } from "./domains/analysis/utils/errorMapper";
import { toLoadingState } from "./domains/analysis/utils/loadingFallback";
import { ChannelSearchBar } from "./domains/search/components/ChannelSearchBar";
import { FilterToolbar } from "./domains/search/components/FilterToolbar";
import { KeywordSearchBar } from "./domains/search/components/KeywordSearchBar";
import { ResultSummaryBar } from "./domains/search/components/ResultSummaryBar";
import { VideoGrid } from "./domains/search/components/VideoGrid";
import { ViewModeToggle } from "./domains/search/components/ViewModeToggle";
import { ApiKeyManager } from "./domains/search/components/ApiKeyManager";
import { CookieFilePathManager } from "./domains/search/components/CookieFilePathManager";
import { TranscriptModal } from "./domains/search/components/TranscriptModal";
import { useSearchQueryState } from "./domains/search/hooks/useSearchQueryState";
import { POPSTATE_RESTORED_MESSAGE } from "./domains/search/utils/popStateSyncPolicy";
import { useVideoSearch } from "./domains/search/hooks/useVideoSearch";
import { loadUserApiKeys, saveUserApiKeys } from "./domains/search/apiKeyStorage";
import {
  loadCookieContent,
  loadCookieFilePath,
  loadCookieInputMode,
  saveCookieContent,
  saveCookieFilePath,
  saveCookieInputMode,
} from "./domains/search/cookiePathStorage";
import { fetchVideoTranscript, SearchApiError } from "./domains/search/api/client";
import type {
  AnalysisErrorState,
  AnalysisLoadingState,
  AnalysisModalStatus,
  AnalysisResult,
  AnalysisStatusData,
} from "./domains/analysis/types";
import type {
  SearchFilterState,
  SearchQueryState,
  SearchResultCard,
  SearchSummary,
  TranscriptResultData,
  CookieInputMode,
} from "./domains/search/types";


const DEFAULT_FILTERS: SearchFilterState = {
  sort: "subscriberAsc",
  period: "7d",
  minViews: 0,
  country: "",
  maxSubscribers: 0,
  subscriberPublicOnly: false,
  durationBucket: "all",
  shortFormType: "all",
  scriptType: "all",
  hoverMetric: "vidiqTrend",
  minPerformance: 150,
  corePreset: "none",
};

const POLLING_INTERVAL_MS = 1200;
const POPSTATE_NOTICE_DURATION_MS = 2600;

export function App() {
  const [filters, setFilters] = useState<SearchFilterState>(DEFAULT_FILTERS);
  const {
    resultsState,
    searchErrorMessage,
    isSearchErrorRetryable,
    visibleCards,
    runSearch,
    resetSearch,
  } = useVideoSearch([]);
  const [userApiKeys, setUserApiKeys] = useState<string[]>(() => loadUserApiKeys());

  const handlePopStateQueryRestored = useCallback((restoredQuery: SearchQueryState) => {
    void runSearch(restoredQuery, filters, userApiKeys);
  }, [filters, runSearch, userApiKeys]);

  const showPopStateNotice = useCallback(() => {
    if (popStateNoticeTimerRef.current !== null) {
      window.clearTimeout(popStateNoticeTimerRef.current);
      popStateNoticeTimerRef.current = null;
    }

    setPopStateNoticeMessage(POPSTATE_RESTORED_MESSAGE);
    popStateNoticeTimerRef.current = window.setTimeout(() => {
      setPopStateNoticeMessage(null);
      popStateNoticeTimerRef.current = null;
    }, POPSTATE_NOTICE_DURATION_MS);
  }, []);

  const { queryState, setQueryState, viewMode, setViewMode, copyShareUrl } = useSearchQueryState({
    autoSearchOnPopState: true,
    onPopStateQueryRestored: handlePopStateQueryRestored,
    onPopStateSearchRestoredNotice: showPopStateNotice,
  });
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [status, setStatus] = useState<AnalysisModalStatus>("loading");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<AnalysisErrorState | null>(null);
  const [loadingState, setLoadingState] = useState<AnalysisLoadingState>({
    message: "분석을 준비 중입니다.",
  });
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const [popStateNoticeMessage, setPopStateNoticeMessage] = useState<string | null>(null);
  const popStateNoticeTimerRef = useRef<number | null>(null);
  const pollTimerRef = useRef<number | null>(null);
  const activeSessionRef = useRef(0);
  const isModalOpenRef = useRef(false);
  const [cookieInputMode, setCookieInputMode] = useState<CookieInputMode>(() => loadCookieInputMode());
  const [cookieFilePath, setCookieFilePath] = useState<string>(() => loadCookieFilePath());
  const [cookieContent, setCookieContent] = useState<string>(() => loadCookieContent());
  const [isTranscriptModalOpen, setIsTranscriptModalOpen] = useState(false);
  const [transcriptStatus, setTranscriptStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [transcriptResult, setTranscriptResult] = useState<TranscriptResultData | null>(null);
  const [transcriptErrorMessage, setTranscriptErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    isModalOpenRef.current = isModalOpen;
  }, [isModalOpen]);

  useEffect(() => {
    return () => {
      if (popStateNoticeTimerRef.current !== null) {
        window.clearTimeout(popStateNoticeTimerRef.current);
      }
    };
  }, []);

  const selectedCard = useMemo(
    () => visibleCards.find((card) => card.videoId === selectedVideoId) ?? null,
    [selectedVideoId, visibleCards],
  );

  const clearPollTimer = useCallback(() => {
    if (pollTimerRef.current !== null) {
      window.clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const stopPolling = useCallback(() => {
    activeSessionRef.current += 1;
    clearPollTimer();
  }, [clearPollTimer]);

  const applyStatusData = useCallback((data: AnalysisStatusData) => {
    if (data.status === "completed" && data.result) {
      setResult(data.result);
      setStatus("success");
      return;
    }

    if (data.status === "failed") {
      const mappedError = mapAnalysisError({
        code: data.error?.code,
        message: data.error?.message,
      });
      setError(mappedError);
      setStatus("error");
      return;
    }

    setLoadingState(
      toLoadingState({
        status: data.status,
        progress: data.progress,
        step: data.step,
        message: data.message,
      }),
    );
    setStatus("loading");
  }, []);

  const pollJobStatus = useCallback(
    async (jobId: string, sessionId: number) => {
      if (!isModalOpenRef.current || activeSessionRef.current !== sessionId) {
        return;
      }

      try {
        const statusData = await getAnalysisJobStatus(jobId);
        if (!isModalOpenRef.current || activeSessionRef.current !== sessionId) {
          return;
        }

        applyStatusData(statusData);
        const isCompleted = statusData.status === "completed" && Boolean(statusData.result);
        const isFailed = statusData.status === "failed";

        if (isCompleted || isFailed) {
          clearPollTimer();
          return;
        }

        clearPollTimer();
        pollTimerRef.current = window.setTimeout(() => {
          void pollJobStatus(jobId, sessionId);
        }, POLLING_INTERVAL_MS);
      } catch (caughtError) {
        if (!isModalOpenRef.current || activeSessionRef.current !== sessionId) {
          return;
        }

        const fallbackError =
          caughtError instanceof AnalysisApiError
            ? mapAnalysisError({
                code: caughtError.code,
                message: caughtError.message,
                retryAfterSeconds: caughtError.retryAfterSeconds,
              })
            : mapAnalysisError({ code: "ANALYSIS_TIMEOUT" });

        setError(fallbackError);
        setStatus("error");
        clearPollTimer();
      }
    },
    [applyStatusData, clearPollTimer],
  );

  const startAnalysis = useCallback(
    async (card: SearchResultCard, forceRefresh: boolean) => {
      stopPolling();
      setSelectedVideoId(card.videoId);
      setIsModalOpen(true);
      setStatus("loading");
      setError(null);
      setResult(null);
      setLoadingState({ message: "분석을 준비 중입니다." });

      const sessionId = activeSessionRef.current;

      try {
        const created = await createAnalysisJob({
          videoId: card.videoId,
          forceRefresh,
        });

        if (!isModalOpenRef.current || activeSessionRef.current !== sessionId) {
          return;
        }

        applyStatusData(created);

        const shouldContinuePolling =
          created.status === "queued" ||
          created.status === "processing" ||
          (created.status === "completed" && !created.result);

        if (shouldContinuePolling) {
          clearPollTimer();
          pollTimerRef.current = window.setTimeout(() => {
            void pollJobStatus(created.jobId, sessionId);
          }, POLLING_INTERVAL_MS);
        }
      } catch (caughtError) {
        const mappedError =
          caughtError instanceof AnalysisApiError
            ? mapAnalysisError({
                code: caughtError.code,
                message: caughtError.message,
                retryAfterSeconds: caughtError.retryAfterSeconds,
              })
            : mapAnalysisError({ code: "ANALYSIS_TIMEOUT" });

        setError(mappedError);
        setStatus("error");
      }
    },
    [applyStatusData, clearPollTimer, pollJobStatus, stopPolling],
  );

  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hasInitialQuery = (params.get("q") ?? "").trim() !== "";
    const hasInitialChannel = (params.get("channel") ?? "").trim() !== "";

    if (hasInitialQuery || hasInitialChannel) {
      void runSearch(queryState, filters, userApiKeys);
    }
    // URL 기반 초기 진입일 때만 검색을 복구한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleKeywordSearch = () => {
    void runSearch(queryState, filters, userApiKeys);
  };

  const handleChannelSearch = () => {
    void runSearch(queryState, filters, userApiKeys);
  };

  const openAnalysisModal = (card: SearchResultCard) => {
    if (isModalOpen && status === "loading") {
      return;
    }

    void startAnalysis(card, false);
  };

  const closeModal = () => {
    stopPolling();
    setIsModalOpen(false);
  };

  const retryAnalysis = () => {
    if (!selectedCard) {
      setError(analysisErrorMock);
      setStatus("error");
      return;
    }

    void startAnalysis(selectedCard, true);
  };

  const handleKeywordClick = (keyword: string) => {
    const nextQuery: SearchQueryState = {
      ...queryState,
      keyword,
    };
    setQueryState(nextQuery);
    void runSearch(nextQuery, filters, userApiKeys);
  };

  const handleResetAll = () => {
    const resetQuery: SearchQueryState = {
      keyword: "",
      channel: "",
      topic: "all",
      resultLimit: 250,
    };
    setQueryState(resetQuery);
    setViewMode("grid");
    setFilters(DEFAULT_FILTERS);
    setShareMessage(null);
    resetSearch();
  };

  const handleCopyShareUrl = async () => {
    const copied = await copyShareUrl();
    setShareMessage(copied ? "URL이 복사되었습니다." : "URL 복사에 실패했습니다.");
  };

  const handleSaveApiKeys = (nextApiKeys: string[]) => {
    saveUserApiKeys(nextApiKeys);
    setUserApiKeys(nextApiKeys);
  };

  const handleCookieInputModeChange = (nextMode: CookieInputMode) => {
    saveCookieInputMode(nextMode);
    setCookieInputMode(nextMode);
  };

  const handleSaveCookieFilePath = (nextCookieFilePath: string) => {
    saveCookieFilePath(nextCookieFilePath);
    setCookieFilePath(nextCookieFilePath);
  };

  const handleSaveCookieContent = (nextCookieContent: string) => {
    saveCookieContent(nextCookieContent);
    setCookieContent(nextCookieContent);
  };

  const handleExtractTranscript = (card: SearchResultCard) => {
    setIsTranscriptModalOpen(true);
    setTranscriptStatus("loading");
    setTranscriptResult(null);
    setTranscriptErrorMessage(null);

    void fetchVideoTranscript({
      videoId: card.videoId,
      cookieFilePath: cookieInputMode === "path" ? cookieFilePath : undefined,
      cookieContent: cookieInputMode === "content" ? cookieContent : undefined,
    })
      .then((data) => {
        setTranscriptResult(data);
        setTranscriptStatus("success");
      })
      .catch((caughtError: unknown) => {
        if (caughtError instanceof SearchApiError) {
          setTranscriptErrorMessage(caughtError.message);
        } else {
          setTranscriptErrorMessage("대본 추출 중 알 수 없는 오류가 발생했습니다.");
        }
        setTranscriptStatus("error");
      });
  };

  const closeTranscriptModal = () => {
    setIsTranscriptModalOpen(false);
    setTranscriptStatus("idle");
  };

  const summary: SearchSummary = {
    totalCount: visibleCards.length,
    shownCount: visibleCards.length,
    resultsState,
  };

  const isSearchLoading = resultsState === "loading";
  const isAnalyzeButtonDisabled = isModalOpen && status === "loading";
  const quotaMax = 10000;
  const estimatedQuotaLeft = Math.max(0, quotaMax - visibleCards.length * 3);

  return (
    <main className="app-container">
      <header className="app-header">
        <div className="app-header-title-wrap">
          <h1>유튜브 소재 채굴기 v2.0</h1>
          <p className="app-subtitle">검색 결과에서 바로 AI 소재 분석을 실행할 수 있습니다.</p>
        </div>
        <div className="app-header-tools">
          <div className="quota-indicator" aria-label="추정 할당량 잔량">
            <p className="quota-title">추정 할당량 잔량</p>
            <p className="quota-value">{estimatedQuotaLeft.toLocaleString()} / {quotaMax.toLocaleString()} pt</p>
            <progress value={estimatedQuotaLeft} max={quotaMax} />
          </div>
          <ApiKeyManager apiKeys={userApiKeys} onSave={handleSaveApiKeys} />
          <CookieFilePathManager
            inputMode={cookieInputMode}
            filePathValue={cookieFilePath}
            contentValue={cookieContent}
            onModeChange={handleCookieInputModeChange}
            onPathSave={handleSaveCookieFilePath}
            onContentSave={handleSaveCookieContent}
          />
        </div>
      </header>

      <section className="search-panel" aria-label="탐색 검색 패널">
        <KeywordSearchBar
          keyword={queryState.keyword}
          resultLimit={queryState.resultLimit}
          isDisabled={isSearchLoading}
          onKeywordChange={(keyword) => {
            setQueryState((previous) => ({ ...previous, keyword }));
          }}
          onLimitChange={(resultLimit) => {
            setQueryState((previous) => ({ ...previous, resultLimit }));
          }}
          onSearch={handleKeywordSearch}
        />

        <ChannelSearchBar
          channel={queryState.channel}
          topic={queryState.topic}
          isDisabled={isSearchLoading}
          onChannelChange={(channel) => {
            setQueryState((previous) => ({ ...previous, channel }));
          }}
          onTopicChange={(topic) => {
            setQueryState((previous) => ({ ...previous, topic }));
          }}
          onSearch={handleChannelSearch}
        />
      </section>

      <section className="toolbar-row" aria-label="필터 및 보기 모드">
        <FilterToolbar
          filters={filters}
          isDisabled={isSearchLoading}
          onChange={(nextFilters) => {
            setFilters(nextFilters);
          }}
          onReset={() => {
            setFilters(DEFAULT_FILTERS);
            setShareMessage(null);
          }}
        />
        <ViewModeToggle
          mode={viewMode}
          isDisabled={isSearchLoading}
          onChange={(nextMode) => {
            setViewMode(nextMode);
          }}
        />
      </section>

      <section className="search-section" aria-label="검색 결과">
        <ResultSummaryBar
          summary={summary}
          isSearchErrorRetryable={isSearchErrorRetryable}
          onReset={handleResetAll}
          onCopyShareUrl={() => {
            void handleCopyShareUrl();
          }}
          shareMessage={shareMessage}
          popStateNoticeMessage={popStateNoticeMessage}
        />
        <VideoGrid
          cards={visibleCards}
          resultsState={resultsState}
          errorMessage={searchErrorMessage}
          isErrorRetryable={isSearchErrorRetryable}
          viewMode={viewMode}
          keyword={queryState.keyword}
          isAnalyzeDisabled={isAnalyzeButtonDisabled}
          onRetrySearch={handleKeywordSearch}
          onResetSearchConditions={handleResetAll}
          onAnalyze={openAnalysisModal}
          onExtractTranscript={handleExtractTranscript}
          hoverMetric={filters.hoverMetric}
        />
      </section>

      <TranscriptModal
        isOpen={isTranscriptModalOpen}
        status={transcriptStatus}
        result={transcriptResult}
        errorMessage={transcriptErrorMessage}
        onClose={closeTranscriptModal}
      />

      {isModalOpen ? (
        <AnalysisModal
          status={status}
          result={status === "success" ? result : null}
          error={status === "error" ? error ?? analysisErrorMock : null}
          loadingState={status === "loading" ? loadingState : undefined}
          isActionDisabled={status === "loading"}
          onClose={closeModal}
          onRetry={retryAnalysis}
          onKeywordClick={handleKeywordClick}
        />
      ) : null}
    </main>
  );
}
