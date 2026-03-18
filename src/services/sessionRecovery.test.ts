import { beforeEach, describe, expect, it } from "vitest";
import type { SaveSessionRequest } from "../services/apiClient";
import {
  clearPendingSession,
  getPendingSessionKey,
  readCachedWords,
  readPendingSession,
  writeCachedWords,
  writePendingSession,
} from "../services/sessionRecovery";

const samplePayload: SaveSessionRequest = {
  playerId: "player-demo",
  languageCode: "ja",
  modeType: "standard",
  quizType: "mixed",
  totalTimeSec: 6,
  score: 42,
  heartsLeft: 2,
  totalQuestions: 3,
  correctAnswers: 2,
  answerLog: [],
  reviewState: [],
};

describe("sessionRecovery", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("계정과 언어 기준으로 단어 캐시를 분리 저장한다", () => {
    writeCachedWords("player-demo", "ja", [
      {
        id: "ja-1",
        prompt: "ねこ",
        choices: ["고양이"],
        answer: "고양이",
        meaning: "고양이",
        difficulty: "1",
        questionType: "word_to_meaning",
      },
    ]);

    const cached = readCachedWords("player-demo", "ja");
    const other = readCachedWords("player-demo", "en");

    expect(cached).toHaveLength(1);
    expect(other).toEqual([]);
  });

  it("저장 실패 payload를 임시 세션으로 보관하고 제거할 수 있다", () => {
    writePendingSession("player-demo", "ja", samplePayload, "mock save failure");

    const pending = readPendingSession("player-demo", "ja");
    expect(pending?.payload.score).toBe(42);
    expect(pending?.reason).toBe("mock save failure");

    clearPendingSession("player-demo", "ja");
    expect(readPendingSession("player-demo", "ja")).toBeNull();
    expect(window.localStorage.getItem(getPendingSessionKey("player-demo", "ja"))).toBeNull();
  });
});
