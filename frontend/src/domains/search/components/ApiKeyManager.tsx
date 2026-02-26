import { useMemo, useState } from "react";
import type { AppUiText } from "../i18n/appUiText.types";
import { parseApiKeys, serializeApiKeys } from "../apiKeyStorage";

type ApiKeyManagerProps = {
  apiKeys: string[];
  text: AppUiText["apiKeyManager"];
  onSave: (apiKeys: string[]) => void;
};

export function ApiKeyManager({ apiKeys, text, onSave }: ApiKeyManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState(serializeApiKeys(apiKeys));

  const summaryText = useMemo(() => {
    if (apiKeys.length === 0) {
      return text.summaryEmpty;
    }
    return text.summaryRegistered(apiKeys.length);
  }, [apiKeys.length, text]);

  const handleSave = () => {
    const parsed = parseApiKeys(draft);
    onSave(parsed);
    setDraft(serializeApiKeys(parsed));
  };

  return (
    <section className="api-key-manager" aria-label={text.sectionAriaLabel}>
      <div className="api-key-manager-header">
        <p className="api-key-manager-title">{text.title}</p>
        <p className="api-key-manager-summary">{summaryText}</p>
      </div>
      <button
        type="button"
        onClick={() => {
          setDraft(serializeApiKeys(apiKeys));
          setIsOpen((previous) => !previous);
        }}
      >
        {isOpen ? text.closeButton : text.openButton}
      </button>

      {isOpen ? (
        <div className="api-key-editor-wrap">
          <textarea
            className="api-key-editor"
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
            }}
            placeholder={text.inputPlaceholder}
            rows={5}
          />
          <p className="api-key-manager-help">{text.helpText}</p>
          <div className="api-key-manager-actions">
            <button type="button" onClick={handleSave}>{text.saveButton}</button>
            <button
              type="button"
              onClick={() => {
                setDraft("");
                onSave([]);
              }}
            >
              {text.clearButton}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
