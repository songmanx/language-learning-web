export type ApiErrorCode =
  | "AUTH_FAILED"
  | "META_LOAD_FAILED"
  | "WORDS_LOAD_FAILED"
  | "STATS_LOAD_FAILED"
  | "LEADERBOARD_LOAD_FAILED"
  | "SAVE_FAILED"
  | "UNKNOWN_ERROR";

export type ApiSuccessResponse<T> = {
  ok: true;
  data: T;
};

export type ApiErrorResponse = {
  ok: false;
  error: {
    code: ApiErrorCode;
    message: string;
  };
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export type LoginRequest = {
  loginId: string;
  password: string;
};

export type LoginSession = {
  token: string;
  playerId: string;
  nickname: string;
};

export type LanguageMeta = {
  languageCode: string;
  label: string;
  totalWords: number;
};

export type QuestionType = "word_to_meaning" | "meaning_to_word";
export type SessionMode = "standard" | "practice";

export type WordItem = {
  id: string;
  prompt: string;
  choices: string[];
  answer: string;
  meaning: string;
  difficulty: string;
  questionType: QuestionType;
};

export type AnswerLog = {
  wordId: string;
  questionType: QuestionType;
  shownPrompt: string;
  difficultySnapshot: string;
  responseTimeMs: number;
  selectedAnswer: string;
  correct: boolean;
  comboAfterAnswer: number;
  earnedScore: number;
};

export type ReviewStateRecord = {
  wordId: string;
  priorityScore: number;
  reviewStage: "new" | "learning" | "review";
  lastResult: "correct" | "wrong";
  masteryCount?: number;
};

export type SaveSessionRequest = {
  playerId: string;
  nickname?: string;
  languageCode: string;
  modeType: SessionMode;
  quizType: QuestionType | "mixed";
  totalTimeSec: number;
  score: number;
  heartsLeft: number;
  totalQuestions: number;
  correctAnswers: number;
  answerLog: AnswerLog[];
  reviewState: ReviewStateRecord[];
};

export type LoginResponseDto = {
  session_token: string;
  player_id: string;
  nickname: string;
};

export type LanguageMetaDto = {
  language_code: string;
  label: string;
  total_words: number;
};

export type WordItemDto = {
  word_id: string;
  prompt: string;
  choices: string[];
  answer: string;
  meaning: string;
  difficulty?: string;
  question_type?: QuestionType;
};

export type SaveSessionResponseDto = {
  saved: boolean;
};

export type ClearPlayerProgressResponseDto = {
  cleared: boolean;
};

export type PlayerStatsDto = {
  player_id: string;
  session_count: number;
  practice_session_count: number;
  total_score: number;
  best_score: number;
  total_questions: number;
  correct_answers: number;
  average_accuracy: number;
  last_played_at: string;
};

export type LeaderboardEntryDto = {
  played_at: string;
  total_time_sec: number;
  score: number;
  quiz_mode?: string;
  player_id?: string;
  nickname?: string;
};

export type PlayerStats = {
  playerId: string;
  sessionCount: number;
  practiceSessionCount: number;
  totalScore: number;
  bestScore: number;
  totalQuestions: number;
  correctAnswers: number;
  averageAccuracy: number;
  lastPlayedAt: string;
};

export type LeaderboardRecord = {
  playedAt: string;
  totalTimeSec: number;
  score: number;
  quizMode?: string;
  playerId?: string;
  nickname?: string;
};
