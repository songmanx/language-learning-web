import type { SaveSessionRequest, WordItem, ReviewStateRecord } from "./apiTypes";
import type { SessionConfig } from "../features/game/sessionConfig";
import { readJsonStorage, removeStorageItem, writeJsonStorage } from "./storage";
import { buildScopedStorageKey } from "./storageKeys";

export type PendingSessionRecord = {
  payload: SaveSessionRequest;
  savedAt: string;
  reason: string;
};

export type ReviewSnapshot = {
  reviewState: ReviewStateRecord[];
  savedAt: string;
};

export type DailyStatsSnapshot = {
  sessionCount: number;
  practiceSessionCount: number;
  totalScore: number;
  bestScore: number;
  totalQuestions: number;
  correctAnswers: number;
  averageAccuracy: number;
  lastPlayedAt: string;
};

export type SessionConfigSnapshot = {
  sessionConfig: SessionConfig;
  savedAt: string;
};

export type LeaderboardEntry = {
  playedAt: string;
  totalTimeSec: number;
  score: number;
  quizMode?: SessionConfig["quizMode"];
  playerId?: string;
  nickname?: string;
};

export function getWordsCacheKey(playerId: string | null, languageCode: string) {
  return buildScopedStorageKey("words-cache", { playerId, languageCode });
}

export function getSelectedLanguageKey(playerId: string | null) {
  return buildScopedStorageKey("selected-language", { playerId });
}

export function getPendingSessionKey(playerId: string, languageCode: string) {
  return buildScopedStorageKey("pending-session", { playerId, languageCode });
}

export function getReviewSnapshotKey(playerId: string, languageCode: string) {
  return buildScopedStorageKey("review-snapshot", { playerId, languageCode });
}

export function getDailyStatsSnapshotKey(playerId: string, languageCode: string) {
  return buildScopedStorageKey("daily-stats", { playerId, languageCode });
}

export function getSessionConfigSnapshotKey(playerId: string, languageCode: string) {
  return buildScopedStorageKey("session-config", { playerId, languageCode });
}

export function getLeaderboardKey(playerId: string, languageCode: string) {
  return buildScopedStorageKey("leaderboard", { playerId, languageCode });
}

export function getGlobalLeaderboardKey(languageCode: string) {
  return buildScopedStorageKey("global-leaderboard", { playerId: null, languageCode });
}

export function readCachedWords(playerId: string | null, languageCode: string) {
  return readJsonStorage<WordItem[]>(getWordsCacheKey(playerId, languageCode), []);
}

export function writeCachedWords(playerId: string | null, languageCode: string, words: WordItem[]) {
  writeJsonStorage(getWordsCacheKey(playerId, languageCode), words);
}

export function readPendingSession(playerId: string, languageCode: string) {
  return readJsonStorage<PendingSessionRecord | null>(
    getPendingSessionKey(playerId, languageCode),
    null,
  );
}

export function writePendingSession(
  playerId: string,
  languageCode: string,
  payload: SaveSessionRequest,
  reason: string,
) {
  writeJsonStorage(getPendingSessionKey(playerId, languageCode), {
    payload,
    savedAt: new Date().toISOString(),
    reason,
  });
}

export function clearPendingSession(playerId: string, languageCode: string) {
  removeStorageItem(getPendingSessionKey(playerId, languageCode));
}

export function readReviewSnapshot(playerId: string, languageCode: string) {
  return readJsonStorage<ReviewSnapshot | null>(getReviewSnapshotKey(playerId, languageCode), null);
}

export function writeReviewSnapshot(
  playerId: string,
  languageCode: string,
  reviewState: ReviewStateRecord[],
) {
  writeJsonStorage(getReviewSnapshotKey(playerId, languageCode), {
    reviewState,
    savedAt: new Date().toISOString(),
  });
}

export function readDailyStatsSnapshot(playerId: string, languageCode: string) {
  return readJsonStorage<DailyStatsSnapshot | null>(
    getDailyStatsSnapshotKey(playerId, languageCode),
    null,
  );
}

export function writeDailyStatsSnapshot(
  playerId: string,
  languageCode: string,
  snapshot: DailyStatsSnapshot,
) {
  writeJsonStorage(getDailyStatsSnapshotKey(playerId, languageCode), snapshot);
}

export function readSessionConfigSnapshot(playerId: string, languageCode: string) {
  return readJsonStorage<SessionConfigSnapshot | null>(
    getSessionConfigSnapshotKey(playerId, languageCode),
    null,
  );
}

export function writeSessionConfigSnapshot(
  playerId: string,
  languageCode: string,
  sessionConfig: SessionConfig,
) {
  writeJsonStorage(getSessionConfigSnapshotKey(playerId, languageCode), {
    sessionConfig,
    savedAt: new Date().toISOString(),
  });
}

export function readLeaderboard(playerId: string, languageCode: string) {
  return readJsonStorage<LeaderboardEntry[]>(getLeaderboardKey(playerId, languageCode), []);
}

export function writeLeaderboard(
  playerId: string,
  languageCode: string,
  entries: LeaderboardEntry[],
) {
  writeJsonStorage(getLeaderboardKey(playerId, languageCode), entries);
}

export function readGlobalLeaderboard(languageCode: string) {
  return readJsonStorage<LeaderboardEntry[]>(getGlobalLeaderboardKey(languageCode), []);
}

export function writeGlobalLeaderboard(languageCode: string, entries: LeaderboardEntry[]) {
  writeJsonStorage(getGlobalLeaderboardKey(languageCode), entries);
}

export function clearPlayerProgress(playerId: string, languageCode: string) {
  removeStorageItem(getPendingSessionKey(playerId, languageCode));
  removeStorageItem(getReviewSnapshotKey(playerId, languageCode));
  removeStorageItem(getDailyStatsSnapshotKey(playerId, languageCode));
  removeStorageItem(getSessionConfigSnapshotKey(playerId, languageCode));
  removeStorageItem(getLeaderboardKey(playerId, languageCode));

  const globalEntries = readGlobalLeaderboard(languageCode);
  writeGlobalLeaderboard(
    languageCode,
    globalEntries.filter((entry) => entry.playerId !== playerId),
  );
}
