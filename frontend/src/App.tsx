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
import { KeywordSearchBar } from "./domains/search/components/KeywordSearchBar";
import { ResultSummaryBar } from "./domains/search/components/ResultSummaryBar";
import { VideoGrid } from "./domains/search/components/VideoGrid";
import type {
  AnalysisErrorState,
  AnalysisLoadingState,
  AnalysisModalStatus,
  AnalysisStatusData,
  AnalysisResult,
} from "./domains/analysis/types";
import type {
  SearchQueryState,
  SearchResultCard,
  SearchResultsState,
  SearchSummary,
} from "./domains/search/types";

const SEARCH_RESULT_CARDS: SearchResultCard[] = [
  {
    videoId: "video_family_talk_001",
    title: "가족과 대화가 자꾸 꼬일 때 감정 다루는 법",
    channelName: "마음연구소",
    viewCountText: "42만",
    uploadedAtText: "3일 전",
  },
  {
    videoId: "video_conflict_case_002",
    title: "부부 갈등 대화, 왜 반복될까?",
    channelName: "관계코치TV",
    viewCountText: "18만",
    uploadedAtText: "1주 전",
  },
  {
    videoId: "video_work_life_003",
    title: "퇴근 후 에너지 회복 루틴 5가지",
    channelName: "직장인회복실",
    viewCountText: "9.7만",
    uploadedAtText: "2주 전",
  },
];

const POLLING_INTERVAL_MS = 1200;

export function App() {
  const [queryState, setQueryState] = useState<SearchQueryState>({
    keyword: "가족 대화법",
    channel: "",
  });
  const [resultsState, setResultsState] = useState<SearchResultsState>("success");
  const [visibleCards, setVisibleCards] = useState<SearchResultCard[]>(SEARCH_RESULT_CARDS);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [status, setStatus] = useState<AnalysisModalStatus>("loading");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<AnalysisErrorState | null>(null);
  const [loadingState, setLoadingState] = useState<AnalysisLoadingState>({
    message: "분석을 준비 중입니다.",
  });
  const pollTimerRef = useRef<number | null>(null);
  const searchTimerRef = useRef<number | null>(null);
  const activeSessionRef = useRef(0);
  const isModalOpenRef = useRef(false);

  useEffect(() => {
    isModalOpenRef.current = isModalOpen;
  }, [isModalOpen]);

  useEffect(() => {
    return () => {
      if (searchTimerRef.current !== null) {
        window.clearTimeout(searchTimerRef.current);
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
      setResult(null);
      setError(null);
      setLoadingState({ message: "분석을 준비 중입니다." });

      const sessionId = activeSessionRef.current;

      try {
        const created = await createAnalysisJob({
          videoId: card.videoId,
          forceRefresh,
        });

        if (activeSessionRef.current !== sessionId) {
          return;
        }

        applyStatusData(created);

        const needsPolling = created.status === "queued" || created.status === "processing";
        if (needsPolling) {
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

  const filterCards = useCallback((query: SearchQueryState) => {
    const normalizedKeyword = query.keyword.trim().toLowerCase();
    const normalizedChannel = query.channel.trim().toLowerCase();

    return SEARCH_RESULT_CARDS.filter((card) => {
      const titleMatched =
        normalizedKeyword.length === 0 || card.title.toLowerCase().includes(normalizedKeyword);
      const channelMatched =
        normalizedChannel.length === 0 || card.channelName.toLowerCase().includes(normalizedChannel);
      return titleMatched && channelMatched;
    });
  }, []);

  const runSearch = useCallback(
    (nextQuery: SearchQueryState) => {
      if (searchTimerRef.current !== null) {
        window.clearTimeout(searchTimerRef.current);
      }

      setResultsState("loading");
      searchTimerRef.current = window.setTimeout(() => {
        if (nextQuery.keyword.trim() === "에러테스트") {
          setVisibleCards([]);
          setResultsState("error");
          return;
        }

        const filteredCards = filterCards(nextQuery);
        setVisibleCards(filteredCards);
        setResultsState(filteredCards.length > 0 ? "success" : "empty");
      }, 300);
    },
    [filterCards],
  );

  const handleKeywordSearch = () => {
    runSearch(queryState);
  };

  const handleChannelSearch = () => {
    runSearch(queryState);
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
    runSearch(nextQuery);
  };

  const summary: SearchSummary = {
    totalCount: SEARCH_RESULT_CARDS.length,
    shownCount: visibleCards.length,
    resultsState,
  };

  const isAnalyzeButtonDisabled = isModalOpen && status === "loading";

  return (
    <main className="app-container">
      <header className="app-header">
        <h1>유튜브 소재 채굴기</h1>
        <p className="app-subtitle">검색 결과에서 바로 AI 소재 분석을 실행할 수 있습니다.</p>
      </header>

      <section className="search-panel" aria-label="탐색 검색 패널">
        <KeywordSearchBar
          keyword={queryState.keyword}
          isDisabled={resultsState === "loading"}
          onKeywordChange={(keyword) => {
            setQueryState((previous) => ({ ...previous, keyword }));
          }}
          onSearch={handleKeywordSearch}
        />

        <ChannelSearchBar
          channel={queryState.channel}
          isDisabled={resultsState === "loading"}
          onChannelChange={(channel) => {
            setQueryState((previous) => ({ ...previous, channel }));
          }}
          onSearch={handleChannelSearch}
        />
      </section>

      <section className="search-section" aria-label="검색 결과">
        <ResultSummaryBar summary={summary} />
        <VideoGrid
          cards={visibleCards}
          resultsState={resultsState}
          isAnalyzeDisabled={isAnalyzeButtonDisabled}
          onAnalyze={openAnalysisModal}
        />
      </section>

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
