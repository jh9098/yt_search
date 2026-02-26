import type { AppUiText } from "../i18n/appUiText.types";
import type { TranscriptResultData } from "../types";

type TranscriptModalProps = {
  isOpen: boolean;
  status: "idle" | "loading" | "success" | "error";
  result: TranscriptResultData | null;
  errorMessage: string | null;
  text: AppUiText["transcriptModal"];
  onClose: () => void;
};

export function TranscriptModal({ isOpen, status, result, errorMessage, text, onClose }: TranscriptModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="analysis-modal-backdrop" role="presentation">
      <section className="analysis-modal" role="dialog" aria-modal="true" aria-label={text.dialogAriaLabel}>
        <header className="analysis-modal-header">
          <h2>{status === "loading" ? text.loadingTitle : text.defaultTitle}</h2>
          <button type="button" className="analysis-close-button" onClick={onClose}>
            {text.closeButton}
          </button>
        </header>
        <div className="analysis-modal-body">
          {status === "loading" ? <p>{text.loadingMessage}</p> : null}
          {status === "error" ? <p>{errorMessage ?? text.defaultErrorMessage}</p> : null}
          {status === "success" && result ? (
            <>
              <p>
                <strong>{text.titleLabel}:</strong> {result.title}
              </p>
              <p>
                <strong>{text.languageLabel}:</strong> {result.language} / <strong>{text.sourceLabel}:</strong> {result.source}
              </p>
              <textarea className="api-key-editor" value={result.transcriptText} readOnly rows={14} />
            </>
          ) : null}
        </div>
      </section>
    </div>
  );
}
