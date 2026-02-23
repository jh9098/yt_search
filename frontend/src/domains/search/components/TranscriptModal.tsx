import type { TranscriptResultData } from "../types";

type TranscriptModalProps = {
  isOpen: boolean;
  status: "idle" | "loading" | "success" | "error";
  result: TranscriptResultData | null;
  errorMessage: string | null;
  onClose: () => void;
};

export function TranscriptModal({ isOpen, status, result, errorMessage, onClose }: TranscriptModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="analysis-modal-backdrop" role="presentation">
      <section className="analysis-modal" role="dialog" aria-modal="true" aria-label="영상 대본 추출 결과">
        <header className="analysis-modal-header">
          <h2>{status === "loading" ? "대본 추출 중" : "영상 대본"}</h2>
          <button type="button" className="analysis-close-button" onClick={onClose}>
            닫기
          </button>
        </header>
        <div className="analysis-modal-body">
          {status === "loading" ? <p>대본을 가져오는 중입니다...</p> : null}
          {status === "error" ? <p>{errorMessage ?? "대본 추출에 실패했습니다."}</p> : null}
          {status === "success" && result ? (
            <>
              <p><strong>제목:</strong> {result.title}</p>
              <p><strong>언어:</strong> {result.language} / <strong>출처:</strong> {result.source}</p>
              <textarea className="api-key-editor" value={result.transcriptText} readOnly rows={14} />
            </>
          ) : null}
        </div>
      </section>
    </div>
  );
}
