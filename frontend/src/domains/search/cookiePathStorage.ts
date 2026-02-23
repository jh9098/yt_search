const COOKIE_PATH_STORAGE_KEY = "yt_search_cookie_file_path";

export function saveCookieFilePath(cookieFilePath: string): void {
  localStorage.setItem(COOKIE_PATH_STORAGE_KEY, cookieFilePath.trim());
}

export function loadCookieFilePath(): string {
  const value = localStorage.getItem(COOKIE_PATH_STORAGE_KEY);
  return (value ?? "").trim();
}
