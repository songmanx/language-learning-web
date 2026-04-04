import type { QuestionType, SaveSessionRequest, SessionMode, WordItem } from "../../services/apiTypes";
import { computeReviewState } from "../../utils/reviewState";

type SessionAnswerInput = {
  word: WordItem;
  questionType: QuestionType;
  shownPrompt: string;
  difficultySnapshot: string;
  responseTimeMs: number;
  selectedAnswer: string;
  correct: boolean;
  comboAfterAnswer: number;
  earnedScore: number;
};

function resolveQuizType(answers: SessionAnswerInput[]): QuestionType | "mixed" {
  const questionTypes = Array.from(new Set(answers.map((answer) => answer.questionType)));

  if (questionTypes.length === 1) {
    return questionTypes[0]!;
  }

  return "mixed";
}

export function buildSaveSessionPayload(args: {
  playerId: string;
  nickname?: string;
  languageCode: string;
  modeType: SessionMode;
  totalTimeSec: number;
  score: number;
  heartsLeft: number;
  answers: SessionAnswerInput[];
}): SaveSessionRequest {
  const answerLog = args.answers.map((answer) => ({
    wordId: answer.word.id,
    questionType: answer.questionType,
    shownPrompt: answer.shownPrompt,
    difficultySnapshot: answer.difficultySnapshot,
    responseTimeMs: answer.responseTimeMs,
    selectedAnswer: answer.selectedAnswer,
    correct: answer.correct,
    comboAfterAnswer: answer.comboAfterAnswer,
    earnedScore: answer.earnedScore,
  }));

  return {
    playerId: args.playerId,
    nickname: args.nickname,
    languageCode: args.languageCode,
    modeType: args.modeType,
    quizType: resolveQuizType(args.answers),
    totalTimeSec: args.totalTimeSec,
    score: args.score,
    heartsLeft: args.heartsLeft,
    totalQuestions: args.answers.length,
    correctAnswers: answerLog.filter((answer) => answer.correct).length,
    answerLog,
    reviewState: computeReviewState(answerLog),
  };
}
