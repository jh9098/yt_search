import type { CookieInputMode } from "./types";

const COOKIE_PATH_STORAGE_KEY = "yt_search_cookie_file_path";
const COOKIE_CONTENT_STORAGE_KEY = "yt_search_cookie_content";
const COOKIE_INPUT_MODE_STORAGE_KEY = "yt_search_cookie_input_mode";

export function saveCookieFilePath(cookieFilePath: string): void {
  localStorage.setItem(COOKIE_PATH_STORAGE_KEY, cookieFilePath.trim());
}

export function loadCookieFilePath(): string {
  const value = localStorage.getItem(COOKIE_PATH_STORAGE_KEY);
  return (value ?? "").trim();
}

export function saveCookieContent(cookieContent: string): void {
  localStorage.setItem(COOKIE_CONTENT_STORAGE_KEY, cookieContent.trim());
}

export function loadCookieContent(): string {
  const value = localStorage.getItem(COOKIE_CONTENT_STORAGE_KEY);
  return (value ?? "").trim();
}

export function saveCookieInputMode(mode: CookieInputMode): void {
  localStorage.setItem(COOKIE_INPUT_MODE_STORAGE_KEY, mode);
}

export function loadCookieInputMode(): CookieInputMode {
  const saved = localStorage.getItem(COOKIE_INPUT_MODE_STORAGE_KEY);
  return saved === "content" ? "content" : "path";
}
