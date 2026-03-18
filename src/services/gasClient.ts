import { mockJapaneseWords } from "../features/game/mockWords";
import {
  type LanguageMeta,
  type LanguageMetaDto,
  type LoginRequest,
  type LoginResponseDto,
  type LoginSession,
  type SaveSessionRequest,
  type SaveSessionResponseDto,
  type WordItem,
  type WordItemDto,
} from "./apiTypes";
import {
  mapLanguageMeta,
  mapLoginResponse,
  mapSaveSessionResponse,
  mapWordItem,
} from "./gasMappers";
import { appLogger } from "./logger";

export type {
  AnswerLog,
  ApiErrorCode,
  ApiErrorResponse,
  ApiResponse,
  ApiSuccessResponse,
  LanguageMeta,
  LoginRequest,
  LoginSession,
  QuestionType,
  ReviewStateRecord,
  SaveSessionRequest,
  WordItem,
} from "./apiTypes";

type MockFailureMap = Partial<Record<"login" | "getMeta" | "getWords" | "saveSession", string>>;

const baseUrl = import.meta.env.VITE_GAS_BASE_URL ?? "";
const mockFailures: MockFailureMap = {};

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
      label: "일본어",
      total_words: mockJapaneseWords.length,
    },
  ];
}

function buildMockWordsDto(languageCode: string): WordItemDto[] {
  if (languageCode !== "ja") {
    return [];
  }

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

export function setMockGasFailure(method: keyof MockFailureMap, message: string) {
  mockFailures[method] = message;
}

export function clearMockGasFailures() {
  Object.keys(mockFailures).forEach((key) => {
    delete mockFailures[key as keyof MockFailureMap];
  });
}

export const gasClient = {
  baseUrl,
  async login(request: LoginRequest): Promise<LoginSession> {
    throwIfMockFailure("login");
    const dto = await mockDelay(buildMockLoginDto(request));
    return mapLoginResponse(dto);
  },
  async getMeta(): Promise<LanguageMeta[]> {
    throwIfMockFailure("getMeta");
    const dto = await mockDelay(buildMockMetaDto());
    return dto.map(mapLanguageMeta);
  },
  async getWords(languageCode: string): Promise<WordItem[]> {
    throwIfMockFailure("getWords");
    const dto = await mockDelay(buildMockWordsDto(languageCode));
    return dto.map(mapWordItem);
  },
  async saveSession(payload: SaveSessionRequest): Promise<{ ok: boolean }> {
    throwIfMockFailure("saveSession");
    appLogger.info("gasClient", "saveSession placeholder 호출", {
      playerId: payload.playerId,
      languageCode: payload.languageCode,
      totalQuestions: payload.totalQuestions,
      score: payload.score,
    });
    const dto: SaveSessionResponseDto = await mockDelay({ saved: true }, 100);
    return mapSaveSessionResponse(dto);
  },
};

