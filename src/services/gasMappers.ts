import {
  type LanguageMeta,
  type LanguageMetaDto,
  type LoginResponseDto,
  type LoginSession,
  type SaveSessionResponseDto,
  type WordItem,
  type WordItemDto,
} from "./apiTypes";

export function mapLoginResponse(dto: LoginResponseDto): LoginSession {
  return {
    token: dto.session_token,
    playerId: dto.player_id,
    nickname: dto.nickname,
  };
}

export function mapLanguageMeta(dto: LanguageMetaDto): LanguageMeta {
  return {
    languageCode: dto.language_code,
    label: dto.label,
    totalWords: dto.total_words,
  };
}

export function mapWordItem(dto: WordItemDto): WordItem {
  return {
    id: dto.word_id,
    prompt: dto.prompt,
    choices: dto.choices,
    answer: dto.answer,
    meaning: dto.meaning,
    difficulty: dto.difficulty ?? "",
    questionType: dto.question_type ?? "word_to_meaning",
  };
}

export function mapSaveSessionResponse(dto: SaveSessionResponseDto) {
  return {
    ok: dto.saved,
  };
}
