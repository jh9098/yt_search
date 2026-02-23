const STORAGE_KEY = "yt_search_user_api_keys";

function normalizeApiKey(value: string): string {
  return value.trim();
}

export function parseApiKeys(rawValue: string): string[] {
  const lines = rawValue
    .split(/[\n,]+/)
    .map((line) => normalizeApiKey(line))
    .filter((line) => line.length > 0);

  const deduped: string[] = [];
  const seen = new Set<string>();

  for (const key of lines) {
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    deduped.push(key);
  }

  return deduped;
}

export function serializeApiKeys(apiKeys: string[]): string {
  return apiKeys.join("\n");
}

export function saveUserApiKeys(apiKeys: string[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(apiKeys));
}

export function loadUserApiKeys(): string[] {
  try {
    const rawValue = localStorage.getItem(STORAGE_KEY);
    if (!rawValue) {
      return [];
    }

    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((key): key is string => typeof key === "string" && key.trim().length > 0);
  } catch {
    return [];
  }
}
