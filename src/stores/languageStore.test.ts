import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient, setMockGasFailure } from "../services/apiClient";
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
        prompt: "inu",
        choices: ["dog"],
        answer: "dog",
        meaning: "dog",
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

  it("언어 메타 로드를 중복 호출해도 실제 요청은 한 번만 보낸다", async () => {
    const getMetaMock = vi.spyOn(apiClient, "getMeta").mockImplementation(
      () =>
        new Promise((resolve) => {
          window.setTimeout(() => {
            resolve([{ languageCode: "ja", label: "Japanese", totalWords: 94 }]);
          }, 0);
        }),
    );

    const firstLoad = useLanguageStore.getState().loadMeta();
    const secondLoad = useLanguageStore.getState().loadMeta();

    expect(getMetaMock).toHaveBeenCalledTimes(1);

    await Promise.all([firstLoad, secondLoad]);

    const state = useLanguageStore.getState();
    expect(state.availableLanguages).toEqual([
      { languageCode: "ja", label: "Japanese", totalWords: 94 },
    ]);

    getMetaMock.mockRestore();
  });
});
