import type { SearchViewMode } from "../types";

interface ViewModeToggleProps {
  mode: SearchViewMode;
  isDisabled: boolean;
  onChange: (next: SearchViewMode) => void;
}

export function ViewModeToggle({ mode, isDisabled, onChange }: ViewModeToggleProps) {
  return (
    <section className="view-mode-toggle" aria-label="보기 모드 전환">
      <button
        type="button"
        className={mode === "grid" ? "view-mode-button is-active" : "view-mode-button"}
        disabled={isDisabled}
        onClick={() => onChange("grid")}
      >
        그리드
      </button>
      <button
        type="button"
        className={mode === "list" ? "view-mode-button is-active" : "view-mode-button"}
        disabled={isDisabled}
        onClick={() => onChange("list")}
      >
        리스트
      </button>
    </section>
  );
}
