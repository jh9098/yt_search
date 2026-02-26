import type { SearchUiText } from "../i18n/searchUiText.types";
import type { SearchViewMode } from "../types";

interface ViewModeToggleProps {
  mode: SearchViewMode;
  isDisabled: boolean;
  onChange: (next: SearchViewMode) => void;
  searchUiText: SearchUiText;
}

export function ViewModeToggle({ mode, isDisabled, onChange, searchUiText }: ViewModeToggleProps) {
  return (
    <section className="view-mode-toggle" aria-label={searchUiText.viewMode.sectionAriaLabel}>
      <button
        type="button"
        className={mode === "grid" ? "view-mode-button is-active" : "view-mode-button"}
        disabled={isDisabled}
        onClick={() => onChange("grid")}
      >
        {searchUiText.viewMode.gridButtonLabel}
      </button>
      <button
        type="button"
        className={mode === "list" ? "view-mode-button is-active" : "view-mode-button"}
        disabled={isDisabled}
        onClick={() => onChange("list")}
      >
        {searchUiText.viewMode.listButtonLabel}
      </button>
    </section>
  );
}
