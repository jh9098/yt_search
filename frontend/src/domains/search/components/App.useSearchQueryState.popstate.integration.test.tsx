// @vitest-environment jsdom

import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import type { SearchQueryState } from "../types";
import { useSearchQueryState } from "../hooks/useSearchQueryState";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function AppLightweightHarness() {
  const [restoredCallCount, setRestoredCallCount] = useState(0);
  const [lastRestoredKeyword, setLastRestoredKeyword] = useState<string>("");

  const { queryState, viewMode } = useSearchQueryState({
    autoSearchOnPopState: true,
    onPopStateQueryRestored: (restoredQuery: SearchQueryState) => {
      setRestoredCallCount((count) => count + 1);
      setLastRestoredKeyword(restoredQuery.keyword);
    },
  });

  return (
    <div>
      <output data-testid="query-keyword">{queryState.keyword}</output>
      <output data-testid="view-mode">{viewMode}</output>
      <output data-testid="restored-call-count">{String(restoredCallCount)}</output>
      <output data-testid="last-restored-keyword">{lastRestoredKeyword}</output>
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
    root.render(<AppLightweightHarness />);
  });

  return { container, root };
}

function unmountHarness(target: RenderHarnessResult) {
  act(() => {
    target.root.unmount();
  });

  target.container.remove();
}

function getText(container: HTMLDivElement, testId: string): string {
  return container.querySelector(`[data-testid="${testId}"]`)?.textContent ?? "";
}

afterEach(() => {
  document.body.innerHTML = "";
  window.history.replaceState(null, "", window.location.pathname);
});

describe("App 경량 하네스 + useSearchQueryState popstate 통합", () => {
  it("query가 바뀔 때만 onPopStateQueryRestored가 호출되고 view-only 변경에서는 호출되지 않는다", () => {
    const rendered = renderHarness("?q=focus&view=list");

    expect(getText(rendered.container, "query-keyword")).toBe("focus");
    expect(getText(rendered.container, "view-mode")).toBe("list");
    expect(getText(rendered.container, "restored-call-count")).toBe("0");

    act(() => {
      window.history.replaceState(null, "", `${window.location.pathname}?q=focus`);
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    expect(getText(rendered.container, "query-keyword")).toBe("focus");
    expect(getText(rendered.container, "view-mode")).toBe("grid");
    expect(getText(rendered.container, "restored-call-count")).toBe("0");

    act(() => {
      window.history.replaceState(null, "", `${window.location.pathname}?q=next`);
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    expect(getText(rendered.container, "query-keyword")).toBe("next");
    expect(getText(rendered.container, "view-mode")).toBe("grid");
    expect(getText(rendered.container, "restored-call-count")).toBe("1");
    expect(getText(rendered.container, "last-restored-keyword")).toBe("next");

    unmountHarness(rendered);
  });
});
