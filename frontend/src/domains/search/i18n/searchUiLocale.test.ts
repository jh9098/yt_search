import { describe, expect, it } from "vitest";
import {
  resolveSearchUiLocale,
  toSearchUiLocale,
} from "./searchUiLocale";

describe("toSearchUiLocale", () => {
  it("지원 locale은 그대로 반환한다", () => {
    expect(toSearchUiLocale("en")).toBe("en");
    expect(toSearchUiLocale("ko")).toBe("ko");
  });

  it("브라우저 locale(en-US)은 base locale로 정규화한다", () => {
    expect(toSearchUiLocale("en-US")).toBe("en");
  });

  it("미지원 locale은 null을 반환한다", () => {
    expect(toSearchUiLocale("ja")).toBeNull();
  });
});

describe("resolveSearchUiLocale", () => {
  it("저장된 locale이 유효하면 우선 적용한다", () => {
    expect(resolveSearchUiLocale({ storedLocale: "en", browserLocale: "ko-KR" })).toBe("en");
  });

  it("저장값이 없으면 브라우저 locale을 적용한다", () => {
    expect(resolveSearchUiLocale({ storedLocale: null, browserLocale: "en-US" })).toBe("en");
  });

  it("저장값/브라우저 locale 모두 미지원이면 기본 locale(ko)을 적용한다", () => {
    expect(resolveSearchUiLocale({ storedLocale: "ja", browserLocale: "fr-FR" })).toBe("ko");
  });
});
