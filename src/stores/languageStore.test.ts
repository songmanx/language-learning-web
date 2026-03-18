import { beforeEach, describe, expect, it } from "vitest";
import { setMockGasFailure } from "../services/apiClient";
import { writeCachedWords } from "../services/sessionRecovery";
import { useAuthStore } from "./authStore";
import { useLanguageStore } from "./languageStore";

describe("languageStore", () => {
  beforeEach(() => {
    window.localStorage.clear();
    useAuthStore.setState({
      isLoggedIn: true,
      token: "mock-token",
      playerId: "player-demo",
      nickname: "demo",
    });
    useLanguageStore.setState({
      selectedLanguage: "ja",
      availableLanguages: [],
      words: [],
      isLoading: false,
      loadError: null,
    });
  });

  it("단어 로드 실패 시 계정과 언어별 캐시 문제를 사용한다", async () => {
    writeCachedWords("player-demo", "ja", [
      {
        id: "cached-1",
        prompt: "いぬ",
        choices: ["개"],
        answer: "개",
        meaning: "개",
        difficulty: "1",
        questionType: "meaning_to_word",
      },
    ]);
    setMockGasFailure("getWords", "network down");

    await useLanguageStore.getState().loadWords("ja");

    const state = useLanguageStore.getState();
    expect(state.words[0]?.id).toBe("cached-1");
    expect(state.loadError).toBeTruthy();
  });
});
