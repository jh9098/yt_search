import type { ChangeEvent } from "react";
import type { AppUiText } from "../i18n/appUiText.types";
import type { CookieInputMode } from "../types";

type CookieFilePathManagerProps = {
  inputMode: CookieInputMode;
  filePathValue: string;
  contentValue: string;
  text: AppUiText["cookieManager"];
  onModeChange: (mode: CookieInputMode) => void;
  onPathSave: (cookieFilePath: string) => void;
  onContentSave: (cookieContent: string) => void;
};

function readTextFile(event: ChangeEvent<HTMLInputElement>, onLoaded: (content: string) => void): void {
  const selectedFile = event.target.files?.[0];
  if (!selectedFile) {
    return;
  }

  selectedFile
    .text()
    .then((content) => {
      onLoaded(content);
    })
    .finally(() => {
      event.target.value = "";
    });
}

export function CookieFilePathManager({
  inputMode,
  filePathValue,
  contentValue,
  text,
  onModeChange,
  onPathSave,
  onContentSave,
}: CookieFilePathManagerProps) {
  const hasValue = inputMode === "path" ? filePathValue.trim().length > 0 : contentValue.trim().length > 0;

  return (
    <section className="api-key-manager" aria-label={text.sectionAriaLabel}>
      <div className="api-key-manager-header">
        <p className="api-key-manager-title">{text.title}</p>
        <p className="api-key-manager-summary">{hasValue ? text.summaryConfigured : text.summaryNotConfigured}</p>
      </div>

      <div className="cookie-mode-tabs" role="tablist" aria-label={text.tabListAriaLabel}>
        <button
          type="button"
          role="tab"
          aria-selected={inputMode === "path"}
          className={`cookie-mode-tab ${inputMode === "path" ? "is-active" : ""}`}
          onClick={() => {
            onModeChange("path");
          }}
        >
          {text.pathTab}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={inputMode === "content"}
          className={`cookie-mode-tab ${inputMode === "content" ? "is-active" : ""}`}
          onClick={() => {
            onModeChange("content");
          }}
        >
          {text.contentTab}
        </button>
      </div>

      {inputMode === "path" ? (
        <div className="api-key-editor-wrap">
          <input
            className="search-input"
            value={filePathValue}
            onChange={(event) => {
              onPathSave(event.target.value);
            }}
            placeholder={text.pathPlaceholder}
            aria-label={text.pathInputAriaLabel}
          />
          <p className="api-key-manager-help">{text.pathHelpText}</p>
        </div>
      ) : (
        <div className="api-key-editor-wrap">
          <label className="cookie-upload-label">
            <span>{text.uploadLabel}</span>
            <input
              type="file"
              accept=".txt,text/plain"
              onChange={(event) => {
                readTextFile(event, onContentSave);
              }}
            />
          </label>
          <textarea
            className="api-key-editor"
            value={contentValue}
            onChange={(event) => {
              onContentSave(event.target.value);
            }}
            rows={8}
            placeholder={text.contentPlaceholder}
            aria-label={text.contentAriaLabel}
          />
          <p className="api-key-manager-help">{text.contentHelpText}</p>
        </div>
      )}
    </section>
  );
}
