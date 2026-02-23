const LOCAL_API_BASE_URL = "http://localhost:8000/api";
const PRODUCTION_API_BASE_URL = "https://yt-search-mytn.onrender.com/api";

function trimTrailingSlash(value: string): string {
  return value.replace(/\/$/, "");
}

function isLocalhostHost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

function readHostname(): string {
  if (typeof window === "undefined") {
    return "";
  }

  return window.location.hostname;
}

function buildApiBaseUrl(): string {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL;

  if (configuredBaseUrl && configuredBaseUrl.trim().length > 0) {
    return trimTrailingSlash(configuredBaseUrl.trim());
  }

  const runtimeHostname = readHostname();

  if (isLocalhostHost(runtimeHostname)) {
    return LOCAL_API_BASE_URL;
  }

  return PRODUCTION_API_BASE_URL;
}

export const API_BASE_URL = buildApiBaseUrl();
