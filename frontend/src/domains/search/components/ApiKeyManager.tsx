import { useMemo, useState } from "react";
import { parseApiKeys, serializeApiKeys } from "../apiKeyStorage";

type ApiKeyManagerProps = {
  apiKeys: string[];
  onSave: (apiKeys: string[]) => void;
};

export function ApiKeyManager({ apiKeys, onSave }: ApiKeyManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState(serializeApiKeys(apiKeys));

  const summaryText = useMemo(() => {
    if (apiKeys.length === 0) {
      return "등록된 API 키 없음";
    }
    return `${apiKeys.length}개 등록됨`;
  }, [apiKeys.length]);

  const handleSave = () => {
    const parsed = parseApiKeys(draft);
    onSave(parsed);
    setDraft(serializeApiKeys(parsed));
  };

  return (
    <section className="api-key-manager" aria-label="유튜브 API 키 관리">
      <div className="api-key-manager-header">
        <p className="api-key-manager-title">YouTube API 키</p>
        <p className="api-key-manager-summary">{summaryText}</p>
      </div>
      <button
        type="button"
        onClick={() => {
          setDraft(serializeApiKeys(apiKeys));
          setIsOpen((previous) => !previous);
        }}
      >
        {isOpen ? "입력창 닫기" : "키 입력"}
      </button>

      {isOpen ? (
        <div className="api-key-editor-wrap">
          <textarea
            className="api-key-editor"
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
            }}
            placeholder="한 줄에 하나씩 API 키를 입력해 주세요. 쉼표(,)로 구분해도 됩니다."
            rows={5}
          />
          <p className="api-key-manager-help">
            여러 키를 등록하면, 앞의 키 한도가 소진됐을 때 다음 키로 자동 재시도합니다.
          </p>
          <div className="api-key-manager-actions">
            <button type="button" onClick={handleSave}>저장</button>
            <button
              type="button"
              onClick={() => {
                setDraft("");
                onSave([]);
              }}
            >
              모두 삭제
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
