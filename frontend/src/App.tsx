import { useState } from "react";
import { AnalysisModal } from "./domains/analysis/components/AnalysisModal";
import { analysisErrorMock, analysisResultMock } from "./domains/analysis/mocks/analysisResult.mock";
import type { AnalysisModalStatus } from "./domains/analysis/types";

export function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<AnalysisModalStatus>("loading");

  const openModalWithStatus = (nextStatus: AnalysisModalStatus) => {
    setStatus(nextStatus);
    setIsOpen(true);
  };

  return (
    <main className="app-container">
      <h1>유튜브 소재 채굴기</h1>
      <p>Netlify 배포 점검용 프론트엔드 기본 화면입니다.</p>

      <div className="button-row">
        <button type="button" onClick={() => openModalWithStatus("loading")}>
          로딩 상태 열기
        </button>
        <button type="button" onClick={() => openModalWithStatus("success")}>
          성공 상태 열기
        </button>
        <button type="button" onClick={() => openModalWithStatus("error")}>
          실패 상태 열기
        </button>
      </div>

      {isOpen ? (
        <AnalysisModal
          status={status}
          result={status === "success" ? analysisResultMock : null}
          error={status === "error" ? analysisErrorMock : null}
          onClose={() => setIsOpen(false)}
          onRetry={() => setStatus("loading")}
        />
      ) : null}
    </main>
  );
}
