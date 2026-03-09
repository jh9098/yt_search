// @vitest-environment jsdom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import { getSearchUiText } from "../i18n/searchUiText";
import { useSearchQueryState } from "../hooks/useSearchQueryState";
import { ViewModeToggle } from "./ViewModeToggle";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function IntegrationHarness() {
  const searchUiText = getSearchUiText("en");
  const { queryState, viewMode, setViewMode } = useSearchQueryState();

  const isListMode = viewMode === "list";

  return (
    <div>
      <ViewModeToggle
        mode={viewMode}
        isDisabled={false}
        onChange={setViewMode}
        searchUiText={searchUiText}
      />
      <output data-testid="current-query-keyword">{queryState.keyword}</output>
      <output data-testid="current-view-mode">{viewMode}</output>
      {isListMode ? <section data-testid="app-list-view" /> : <section data-testid="app-grid-view" />}
    </div>
  );
}

interface RenderHarnessResult {
  container: HTMLDivElement;
  root: Root;
}

function renderHarness(initialSearch: string): RenderHarnessResult {
  window.history.replaceState(null, "", `${window.location.pathname}${initialSearch}`);

  const container = document.createElement("div");
  document.body.appendChild(container);

  const root = createRoot(container);
  act(() => {
    root.render(<IntegrationHarness />);
  });

  return { container, root };
}

function unmountHarness(target: RenderHarnessResult) {
  act(() => {
    target.root.unmount();
  });
  target.container.remove();
}

afterEach(() => {
  document.body.innerHTML = "";
  window.history.replaceState(null, "", window.location.pathname);
});

describe("ViewModeToggle + useSearchQueryState 통합", () => {
  it("URL 쿼리가 view=list면 최초 렌더가 list 모드와 일치한다", () => {
    const rendered = renderHarness("?view=list");
    const listButton = rendered.container.querySelectorAll("button")[1];
    const modeText = rendered.container.querySelector('[data-testid="current-view-mode"]');

    expect(modeText?.textContent).toBe("list");
    expect(listButton.className).toContain("is-active");

    unmountHarness(rendered);
  });

  it("grid 버튼 클릭 시 기본 모드로 돌아가며 URL view 쿼리를 제거한다", () => {
    const rendered = renderHarness("?view=list");
    const buttons = rendered.container.querySelectorAll("button");
    const gridButton = buttons[0];
    const modeText = rendered.container.querySelector('[data-testid="current-view-mode"]');

    act(() => {
      gridButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(modeText?.textContent).toBe("grid");
    expect(window.location.search).toBe("");

    unmountHarness(rendered);
  });

  it("list 버튼 클릭 시 렌더 모드와 URL view=list가 함께 갱신된다", () => {
    const rendered = renderHarness("");
    const buttons = rendered.container.querySelectorAll("button");
    const listButton = buttons[1];
    const modeText = rendered.container.querySelector('[data-testid="current-view-mode"]');

    act(() => {
      listButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(modeText?.textContent).toBe("list");
    expect(window.location.search).toBe("?view=list");
    expect(listButton.className).toContain("is-active");

    unmountHarness(rendered);
  });

  it("popstate에서 query는 같고 view만 바뀌면 App 실제 렌더가 즉시 동기화된다", () => {
    const rendered = renderHarness("?q=focus&view=list");
    const modeText = rendered.container.querySelector('[data-testid="current-view-mode"]');
    const queryText = rendered.container.querySelector('[data-testid="current-query-keyword"]');

    expect(modeText?.textContent).toBe("list");
    expect(queryText?.textContent).toBe("focus");
    expect(rendered.container.querySelector('[data-testid="app-list-view"]')).not.toBeNull();
    expect(rendered.container.querySelector('[data-testid="app-grid-view"]')).toBeNull();

    act(() => {
      window.history.replaceState(null, "", `${window.location.pathname}?q=focus`);
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    expect(window.location.search).toBe("?q=focus");
    expect(queryText?.textContent).toBe("focus");
    expect(modeText?.textContent).toBe("grid");
    expect(rendered.container.querySelector('[data-testid="app-grid-view"]')).not.toBeNull();
    expect(rendered.container.querySelector('[data-testid="app-list-view"]')).toBeNull();

    unmountHarness(rendered);
  });
});
