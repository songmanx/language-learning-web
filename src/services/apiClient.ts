import { mockEnglishWords, mockJapaneseWords } from "../features/game/mockWords";
import {
  type LeaderboardEntryDto,
  type LeaderboardRecord,
  type ApiResponse,
  type ClearPlayerProgressResponseDto,
  type LanguageMeta,
  type LanguageMetaDto,
  type LoginRequest,
  type LoginResponseDto,
  type LoginSession,
  type PlayerStats,
  type PlayerStatsDto,
  type SaveSessionRequest,
  type SaveSessionResponseDto,
  type WordItem,
  type WordItemDto,
} from "./apiTypes";
import {
  mapLeaderboardEntry,
  mapLanguageMeta,
  mapLoginResponse,
  mapPlayerStats,
  mapSaveSessionResponse,
  mapWordItem,
} from "./gasMappers";
import { appLogger } from "./logger";
import { getRuntimeConfig } from "./runtimeConfig";
import {
  readDailyStatsSnapshot,
  readGlobalLeaderboard,
  readLeaderboard,
} from "./sessionRecovery";

export type {
  AnswerLog,
  ApiErrorCode,
  ApiErrorResponse,
  ApiResponse,
  ApiSuccessResponse,
  LeaderboardRecord,
  LanguageMeta,
  LoginRequest,
  LoginSession,
  PlayerStats,
  QuestionType,
  ReviewStateRecord,
  SaveSessionRequest,
  WordItem,
} from "./apiTypes";

type MockFailureMap = Partial<Record<"login" | "getMeta" | "getWords" | "saveSession", string>>;

const runtimeConfig = getRuntimeConfig();
const baseUrl = runtimeConfig.gasBaseUrl;
const useMockApi = runtimeConfig.useMockApi;
const useStaticData = runtimeConfig.useStaticData;
const staticDataMetaUrl = runtimeConfig.staticDataMetaUrl;
const staticDataWordsBasePath = runtimeConfig.staticDataWordsBasePath;
const mockFailures: MockFailureMap = {};
let warmupPromise: Promise<void> | null = null;

function toUserFacingFetchErrorMessage(error: unknown) {
  const rawMessage = error instanceof Error ? error.message : "";

  if (/failed to fetch|load failed|networkerror/i.test(rawMessage)) {
    return "저장 서버에 연결하지 못했습니다. 네트워크 또는 GAS 배포 상태를 확인해 주세요.";
  }

  return rawMessage || "요청 처리 중 오류가 발생했습니다.";
}

function mockDelay<T>(value: T, ms = 150): Promise<T> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(value), ms);
  });
}

function throwIfMockFailure(method: keyof MockFailureMap) {
  const message = mockFailures[method];
  if (!message) {
    return;
  }

  delete mockFailures[method];
  throw new Error(message);
}

function buildMockLoginDto(request: LoginRequest): LoginResponseDto {
  return {
    session_token: `mock-token-${request.loginId}`,
    player_id: `player-${request.loginId}`,
    nickname: request.loginId,
  };
}

function buildMockMetaDto(): LanguageMetaDto[] {
  return [
    {
      language_code: "ja",
      label: "\uC77C\uBCF8\uC5B4",
      total_words: mockJapaneseWords.length,
    },
    {
      language_code: "en",
      label: "\uC601\uC5B4",
      total_words: mockEnglishWords.length,
    },
  ];
}

function buildMockWordsDto(languageCode: string): WordItemDto[] {
  if (languageCode === "ja") {
    return mockJapaneseWords.map((word) => ({
      word_id: word.id,
      prompt: word.prompt,
      choices: word.choices,
      answer: word.answer,
      meaning: word.meaning,
      difficulty: word.difficulty,
      question_type: word.questionType,
    }));
  }

  if (languageCode === "en") {
    return mockEnglishWords.map((word) => ({
      word_id: word.id,
      prompt: word.prompt,
      choices: word.choices,
      answer: word.answer,
      meaning: word.meaning,
      difficulty: word.difficulty,
      question_type: word.questionType,
    }));
  }

  return [];
}

function isApiErrorResponse<T>(response: ApiResponse<T>): response is Extract<ApiResponse<T>, { ok: false }> {
  return response.ok === false;
}

async function readApiResponse<T>(response: Response): Promise<T> {
  let parsedBody: ApiResponse<T> | null = null;

  try {
    parsedBody = (await response.json()) as ApiResponse<T>;
  } catch {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    throw new Error("Invalid API response");
  }

  if (!response.ok) {
    const message = isApiErrorResponse(parsedBody) ? parsedBody.error.message : `HTTP ${response.status}`;
    throw new Error(message);
  }

  if (isApiErrorResponse(parsedBody)) {
    throw new Error(parsedBody.error.message);
  }

  return parsedBody.data;
}

async function postToGas<T>(action: string, payload?: Record<string, unknown>): Promise<T> {
  try {
    if (action === "saveSession") {
      await warmupGasConnection();
    }

    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify({
        action,
        ...payload,
      }),
    });

    return readApiResponse<T>(response);
  } catch (error) {
    throw new Error(toUserFacingFetchErrorMessage(error));
  }
}

async function readStaticJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(`Static data request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

async function warmupGasConnection() {
  if (useMockApi || !baseUrl) {
    return;
  }

  if (!warmupPromise) {
    warmupPromise = fetch(baseUrl, {
      method: "GET",
      cache: "no-store",
    })
      .then(() => undefined)
      .catch(() => undefined);
  }

  await warmupPromise;
}

export function setMockGasFailure(method: keyof MockFailureMap, message: string) {
  mockFailures[method] = message;
}

export function clearMockGasFailures() {
  Object.keys(mockFailures).forEach((key) => {
    delete mockFailures[key as keyof MockFailureMap];
  });
}

export const apiClient = {
  baseUrl,
  useMockApi,
  useStaticData,
  readDataMode: runtimeConfig.readDataMode,
  warmupConnection: warmupGasConnection,
  async login(request: LoginRequest): Promise<LoginSession> {
    if (!useMockApi) {
      const dto = await postToGas<LoginResponseDto>("login", request);
      return mapLoginResponse(dto);
    }

    throwIfMockFailure("login");
    const dto = await mockDelay(buildMockLoginDto(request));
    return mapLoginResponse(dto);
  },
  async getMeta(): Promise<LanguageMeta[]> {
    if (useStaticData) {
      const dto = await readStaticJson<LanguageMetaDto[]>(staticDataMetaUrl);
      return dto.map(mapLanguageMeta);
    }

    if (!useMockApi) {
      const dto = await postToGas<LanguageMetaDto[]>("getMeta");
      return dto.map(mapLanguageMeta);
    }

    throwIfMockFailure("getMeta");
    const dto = await mockDelay(buildMockMetaDto());
    return dto.map(mapLanguageMeta);
  },
  async getWords(languageCode: string): Promise<WordItem[]> {
    if (useStaticData) {
      const dto = await readStaticJson<WordItemDto[]>(`${staticDataWordsBasePath}/${languageCode}/words.json`);
      return dto.map(mapWordItem);
    }

    if (!useMockApi) {
      const dto = await postToGas<WordItemDto[]>("getWords", { languageCode });
      return dto.map(mapWordItem);
    }

    throwIfMockFailure("getWords");
    const dto = await mockDelay(buildMockWordsDto(languageCode));
    return dto.map(mapWordItem);
  },
  async saveSession(payload: SaveSessionRequest): Promise<{ ok: boolean }> {
    if (!useMockApi) {
      const dto = await postToGas<SaveSessionResponseDto>("saveSession", { payload });
      return mapSaveSessionResponse(dto);
    }

    throwIfMockFailure("saveSession");
    appLogger.info("apiClient", "saveSession placeholder 호출", {
      playerId: payload.playerId,
      languageCode: payload.languageCode,
      totalQuestions: payload.totalQuestions,
      score: payload.score,
    });
    const dto: SaveSessionResponseDto = await mockDelay({ saved: true }, 100);
    return mapSaveSessionResponse(dto);
  },
  async getPlayerStats(playerId: string, languageCode: string): Promise<PlayerStats | null> {
    if (!useMockApi) {
      const dto = await postToGas<PlayerStatsDto | null>("getPlayerStats", { playerId, languageCode });
      return dto ? mapPlayerStats(dto) : null;
    }

    const snapshot = readDailyStatsSnapshot(playerId, languageCode);
    if (!snapshot) {
      return mockDelay(null);
    }

    return mockDelay({
      playerId,
      sessionCount: snapshot.sessionCount,
      practiceSessionCount: snapshot.practiceSessionCount,
      totalScore: snapshot.totalScore,
      bestScore: snapshot.bestScore,
      totalQuestions: snapshot.totalQuestions,
      correctAnswers: snapshot.correctAnswers,
      averageAccuracy: snapshot.averageAccuracy,
      lastPlayedAt: snapshot.lastPlayedAt,
    });
  },
  async getLeaderboard(playerId: string, languageCode: string): Promise<LeaderboardRecord[]> {
    if (!useMockApi) {
      const dto = await postToGas<LeaderboardEntryDto[]>("getLeaderboard", { playerId, languageCode });
      return dto.map(mapLeaderboardEntry);
    }

    return mockDelay(
      readLeaderboard(playerId, languageCode).map((entry) => ({
        playedAt: entry.playedAt,
        totalTimeSec: entry.totalTimeSec,
        score: entry.score,
        quizMode: entry.quizMode,
        playerId: entry.playerId,
        nickname: entry.nickname,
      })),
    );
  },
  async getOverallLeaderboard(languageCode: string): Promise<LeaderboardRecord[]> {
    if (!useMockApi) {
      const dto = await postToGas<LeaderboardEntryDto[]>("getOverallLeaderboard", { languageCode });
      return dto.map(mapLeaderboardEntry);
    }

    return mockDelay(
      readGlobalLeaderboard(languageCode).map((entry) => ({
        playedAt: entry.playedAt,
        totalTimeSec: entry.totalTimeSec,
        score: entry.score,
        quizMode: entry.quizMode,
        playerId: entry.playerId,
        nickname: entry.nickname,
      })),
    );
  },
  async clearPlayerProgress(playerId: string, languageCode: string): Promise<void> {
    if (!useMockApi) {
      await postToGas<ClearPlayerProgressResponseDto>("clearPlayerProgress", { playerId, languageCode });
      return;
    }

    return Promise.resolve();
  },
};
