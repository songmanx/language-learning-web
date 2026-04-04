import {
  type LeaderboardEntryDto,
  type LeaderboardRecord,
  type LanguageMeta,
  type LanguageMetaDto,
  type LoginResponseDto,
  type LoginSession,
  type PlayerStats,
  type PlayerStatsDto,
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

export function mapPlayerStats(dto: PlayerStatsDto): PlayerStats {
  return {
    playerId: dto.player_id,
    sessionCount: dto.session_count,
    practiceSessionCount: dto.practice_session_count,
    totalScore: dto.total_score,
    bestScore: dto.best_score,
    totalQuestions: dto.total_questions,
    correctAnswers: dto.correct_answers,
    averageAccuracy: dto.average_accuracy,
    lastPlayedAt: dto.last_played_at,
  };
}

export function mapLeaderboardEntry(dto: LeaderboardEntryDto): LeaderboardRecord {
  return {
    playedAt: dto.played_at,
    totalTimeSec: dto.total_time_sec,
    score: dto.score,
    quizMode: dto.quiz_mode,
    playerId: dto.player_id,
    nickname: dto.nickname,
  };
}
