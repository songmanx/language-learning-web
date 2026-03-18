const STORAGE_VERSION = "v1";

export function buildScopedStorageKey(segment: string, options?: {
  playerId?: string | null;
  languageCode?: string | null;
}) {
  const playerId = options?.playerId ?? "guest";
  const languageCode = options?.languageCode ?? "global";

  return ["study-web", STORAGE_VERSION, playerId, languageCode, segment].join(":");
}
