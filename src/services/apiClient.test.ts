import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const originalBaseUrl = import.meta.env.VITE_GAS_BASE_URL;
const originalUseMock = import.meta.env.VITE_GAS_USE_MOCK;
const originalStaticMetaUrl = import.meta.env.VITE_STATIC_DATA_META_URL;
const originalStaticWordsBasePath = import.meta.env.VITE_STATIC_DATA_WORDS_BASE_PATH;

describe("apiClient remote mode", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
    import.meta.env.VITE_GAS_BASE_URL = "https://example.com/gas";
    import.meta.env.VITE_GAS_USE_MOCK = "false";
    import.meta.env.VITE_STATIC_DATA_META_URL = "";
    import.meta.env.VITE_STATIC_DATA_WORDS_BASE_PATH = "";
  });

  afterEach(() => {
    import.meta.env.VITE_GAS_BASE_URL = originalBaseUrl;
    import.meta.env.VITE_GAS_USE_MOCK = originalUseMock;
    import.meta.env.VITE_STATIC_DATA_META_URL = originalStaticMetaUrl;
    import.meta.env.VITE_STATIC_DATA_WORDS_BASE_PATH = originalStaticWordsBasePath;
    vi.unstubAllGlobals();
  });

  it("maps login responses from the API envelope", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        data: {
          session_token: "token-1",
          player_id: "player-1",
          nickname: "demo",
        },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { apiClient } = await import("./apiClient");
    const result = await apiClient.login({ loginId: "demo", password: "pw" });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.com/gas",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
      }),
    );
    expect(result).toEqual({
      token: "token-1",
      playerId: "player-1",
      nickname: "demo",
    });
  });

  it("throws the API error message when the envelope returns ok false", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          ok: false,
          error: {
            code: "AUTH_FAILED",
            message: "bad credentials",
          },
        }),
      }),
    );

    const { apiClient } = await import("./apiClient");

    await expect(apiClient.login({ loginId: "demo", password: "pw" })).rejects.toThrow(
      "bad credentials",
    );
  });

  it("sends saveSession payloads through the shared action envelope", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        data: {
          saved: true,
        },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { apiClient } = await import("./apiClient");
    const payload = {
      playerId: "player-demo",
      languageCode: "ja",
      modeType: "standard" as const,
      quizType: "mixed" as const,
      totalTimeSec: 4,
      score: 12,
      heartsLeft: 2,
      totalQuestions: 2,
      correctAnswers: 1,
      answerLog: [],
      reviewState: [],
    };

    const result = await apiClient.saveSession(payload);
    const postCall = fetchMock.mock.calls.find((call) => (call[1] as RequestInit | undefined)?.method === "POST");
    const requestInit = postCall?.[1] as RequestInit;
    const body = JSON.parse(String(requestInit.body));

    expect(body).toEqual({
      action: "saveSession",
      payload,
    });
    expect(requestInit.headers).toEqual({
      "Content-Type": "text/plain;charset=utf-8",
    });
    expect(result).toEqual({ ok: true });
  });

  it("reads words from static JSON when static data mode is enabled", async () => {
    import.meta.env.VITE_STATIC_DATA_META_URL = "/data/languages.json";
    import.meta.env.VITE_STATIC_DATA_WORDS_BASE_PATH = "/data";

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          word_id: "ja-1",
          prompt: "ねこ",
          choices: ["고양이", "개", "새", "물고기"],
          answer: "고양이",
          meaning: "고양이",
          difficulty: "1",
          question_type: "word_to_meaning",
        },
      ],
    });
    vi.stubGlobal("fetch", fetchMock);

    const { apiClient } = await import("./apiClient");
    const result = await apiClient.getWords("ja");

    expect(fetchMock).toHaveBeenCalledWith(
      "/data/ja/words.json",
      expect.objectContaining({
        method: "GET",
      }),
    );
    expect(result).toEqual([
      {
        id: "ja-1",
        prompt: "ねこ",
        choices: ["고양이", "개", "새", "물고기"],
        answer: "고양이",
        meaning: "고양이",
        difficulty: "1",
        questionType: "word_to_meaning",
      },
    ]);
  });

  it("reads meta from static JSON when static data mode is enabled", async () => {
    import.meta.env.VITE_STATIC_DATA_META_URL = "/data/languages.json";
    import.meta.env.VITE_STATIC_DATA_WORDS_BASE_PATH = "/data";

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          language_code: "ja",
          label: "일본어",
          total_words: 94,
        },
      ],
    });
    vi.stubGlobal("fetch", fetchMock);

    const { apiClient } = await import("./apiClient");
    const result = await apiClient.getMeta();

    expect(fetchMock).toHaveBeenCalledWith(
      "/data/languages.json",
      expect.objectContaining({
        method: "GET",
      }),
    );
    expect(result).toEqual([
      {
        languageCode: "ja",
        label: "일본어",
        totalWords: 94,
      },
    ]);
  });

  it("warms up the GAS connection with a GET request", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        data: {
          status: "ok",
        },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { apiClient } = await import("./apiClient");
    await apiClient.warmupConnection();

    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.com/gas",
      expect.objectContaining({
        method: "GET",
        cache: "no-store",
      }),
    );
  });
});
