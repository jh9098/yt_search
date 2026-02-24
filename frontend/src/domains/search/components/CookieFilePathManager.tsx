import type { ChangeEvent } from "react";
import type { CookieInputMode } from "../types";

type CookieFilePathManagerProps = {
  inputMode: CookieInputMode;
  filePathValue: string;
  contentValue: string;
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
  onModeChange,
  onPathSave,
  onContentSave,
}: CookieFilePathManagerProps) {
  const hasValue = inputMode === "path" ? filePathValue.trim().length > 0 : contentValue.trim().length > 0;

  return (
    <section className="api-key-manager" aria-label="쿠키 설정">
      <div className="api-key-manager-header">
        <p className="api-key-manager-title">cookies_netscape.txt 설정</p>
        <p className="api-key-manager-summary">{hasValue ? "설정됨" : "미설정"}</p>
      </div>

      <div className="cookie-mode-tabs" role="tablist" aria-label="쿠키 입력 방식 선택">
        <button
          type="button"
          role="tab"
          aria-selected={inputMode === "path"}
          className={`cookie-mode-tab ${inputMode === "path" ? "is-active" : ""}`}
          onClick={() => {
            onModeChange("path");
          }}
        >
          파일 경로 입력
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
          업로드/붙여넣기
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
            placeholder="예) /Users/me/cookies_netscape.txt"
            aria-label="쿠키 파일 경로"
          />
          <p className="api-key-manager-help">서버가 접근 가능한 로컬 경로를 입력해 주세요.</p>
        </div>
      ) : (
        <div className="api-key-editor-wrap">
          <label className="cookie-upload-label">
            <span>cookies_netscape.txt 파일 업로드</span>
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
            placeholder="cookies_netscape.txt 내용을 그대로 붙여넣어 주세요"
            aria-label="쿠키 파일 내용"
          />
          <p className="api-key-manager-help">보안상 브라우저 로컬 저장소에 저장됩니다. 공용 PC에서는 사용 후 삭제해 주세요.</p>
        </div>
      )}
    </section>
  );
}
