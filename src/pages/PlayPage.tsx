import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { SessionResultState } from "../features/game/resultState";
import { buildQuestionRound } from "../features/game/questionRound";
import { buildSaveSessionPayload } from "../features/game/session";
import type { AnswerLog, SaveSessionRequest } from "../services/apiTypes";
import { apiClient } from "../services/apiClient";
import { appLogger } from "../services/logger";
import {
  readDailyStatsSnapshot,
  writeDailyStatsSnapshot,
  writePendingSession,
  writeReviewSnapshot,
} from "../services/sessionRecovery";
import { useAuthStore } from "../stores/authStore";
import { useLanguageStore } from "../stores/languageStore";

type PendingAnswer = AnswerLog;
type PlayMode = "standard" | "practice";

type PlayPageProps = {
  mode?: PlayMode;
};

const MAX_HEARTS = 3;
const TEXT = {
  practiceMode: "\uC5F0\uC2B5 \uBAA8\uB4DC",
  standardMode: "\uAE30\uBCF8 \uD50C\uB808\uC774",
  practiceDescription:
    "\uC800\uC7A5\uB41C \uB2E8\uC5B4 \uD750\uB984\uC73C\uB85C \uAC00\uBCCD\uAC8C \uAC10\uAC01\uC744 \uC62C\uB9AC\uB294 \uC5F0\uC2B5 \uC138\uC158\uC785\uB2C8\uB2E4.",
  standardDescription:
    "\uC810\uC218, \uD558\uD2B8, \uCF64\uBCF4\uB97C \uBC18\uC601\uD558\uB294 \uAE30\uBCF8 \uD50C\uB808\uC774 \uC138\uC158\uC785\uB2C8\uB2E4.",
  savingStart: "\uC138\uC158 \uC800\uC7A5 \uC2DC\uC791",
  savingSuccess: "\uC138\uC158 \uC800\uC7A5 \uC131\uACF5",
  savingFail: "\uC138\uC158 \uC800\uC7A5\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.",
  savingFallback: "\uC138\uC158 \uC800\uC7A5 \uC2E4\uD328, \uC784\uC2DC \uC800\uC7A5\uC73C\uB85C \uC804\uD658",
  pendingSavedMessage:
    "\uC800\uC7A5\uC5D0 \uC2E4\uD328\uD574 \uC774 \uAE30\uAE30\uC5D0 \uC784\uC2DC \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4.",
  answerHandled: "\uBB38\uD56D \uB2F5\uBCC0 \uCC98\uB9AC",
  loadingQuestions: "\uBB38\uC81C\uB97C \uC900\uBE44\uD558\uB294 \uC911\uC785\uB2C8\uB2E4...",
  progress: "\uC9C4\uD589\uB3C4",
  remainingQuestions: "\uBB38\uC81C \uB0A8\uC74C",
  questionType: "\uBB38\uC81C \uC720\uD615",
  heartsLabel: "\uD558\uD2B8",
  scoreLabel: "\uC810\uC218",
  comboLabel: "\uCF64\uBCF4",
} as const;

function calculateAverageAccuracy(correctAnswers: number, totalQuestions: number) {
  if (totalQuestions === 0) {
    return 0;
  }

  return Math.round((correctAnswers / totalQuestions) * 100);
}

export function PlayPage({ mode = "standard" }: PlayPageProps) {
  const navigate = useNavigate();
  const playerId = useAuthStore((state) => state.playerId);
  const selectedLanguage = useLanguageStore((state) => state.selectedLanguage);
  const words = useLanguageStore((state) => state.words);
  const loadWords = useLanguageStore((state) => state.loadWords);
  const loadError = useLanguageStore((state) => state.loadError);
  const clearLoadError = useLanguageStore((state) => state.clearLoadError);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [heartsLeft, setHeartsLeft] = useState(MAX_HEARTS);
  const [answerLog, setAnswerLog] = useState<PendingAnswer[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const [sessionStartedAt] = useState(() => Date.now());
  const [questionStartedAt, setQuestionStartedAt] = useState(() => Date.now());
  const answerLockRef = useRef(false);

  const isPracticeMode = mode === "practice";
  const modeTitle = isPracticeMode ? TEXT.practiceMode : TEXT.standardMode;
  const modeDescription = isPracticeMode ? TEXT.practiceDescription : TEXT.standardDescription;

  useEffect(() => {
    if (words.length === 0 && selectedLanguage) {
      void loadWords(selectedLanguage);
    }
  }, [loadWords, selectedLanguage, words.length]);

  useEffect(() => {
    return () => {
      clearLoadError();
    };
  }, [clearLoadError]);

  const currentWord = words[currentIndex];
  const currentQuestion = useMemo(() => {
    if (!currentWord) {
      return null;
    }

    return buildQuestionRound(currentWord, words);
  }, [currentWord, words]);

  useEffect(() => {
    if (currentWord) {
      answerLockRef.current = false;
      setIsAnswerLocked(false);
      setQuestionStartedAt(Date.now());
    }
  }, [currentWord]);

  const progressLabel = useMemo(
    () => `${Math.min(currentIndex + 1, words.length)} / ${words.length}`,
    [currentIndex, words.length],
  );

  async function finishGame(nextAnswerLog: PendingAnswer[], nextScore: number, nextHeartsLeft: number) {
    if (!playerId || !selectedLanguage) {
      navigate("/home");
      return;
    }

    setIsSaving(true);
    appLogger.info("play", TEXT.savingStart, {
      playerId,
      languageCode: selectedLanguage,
      answers: nextAnswerLog.length,
      score: nextScore,
      heartsLeft: nextHeartsLeft,
      mode,
    });

    const payload: SaveSessionRequest = buildSaveSessionPayload({
      playerId,
      languageCode: selectedLanguage,
      modeType: mode,
      totalTimeSec: Math.max(0, Math.ceil((Date.now() - sessionStartedAt) / 1000)),
      score: nextScore,
      heartsLeft: nextHeartsLeft,
      answers: nextAnswerLog.map((answer, index) => ({
        word: words[index]!,
        questionType: answer.questionType,
        shownPrompt: answer.shownPrompt,
        difficultySnapshot: answer.difficultySnapshot,
        responseTimeMs: answer.responseTimeMs,
        selectedAnswer: answer.selectedAnswer,
        correct: answer.correct,
        comboAfterAnswer: answer.comboAfterAnswer,
        earnedScore: answer.earnedScore,
      })),
    });

    writeReviewSnapshot(playerId, selectedLanguage, payload.reviewState);

    const previousStats = readDailyStatsSnapshot(playerId, selectedLanguage);
    const nextSessionCount = (previousStats?.sessionCount ?? 0) + 1;
    const nextPracticeSessionCount =
      (previousStats?.practiceSessionCount ?? 0) + (isPracticeMode ? 1 : 0);
    const nextTotalScore = (previousStats?.totalScore ?? 0) + payload.score;
    const nextTotalQuestions = (previousStats?.totalQuestions ?? 0) + payload.totalQuestions;
    const nextCorrectAnswers = (previousStats?.correctAnswers ?? 0) + payload.correctAnswers;

    writeDailyStatsSnapshot(playerId, selectedLanguage, {
      sessionCount: nextSessionCount,
      practiceSessionCount: nextPracticeSessionCount,
      totalScore: nextTotalScore,
      bestScore: Math.max(previousStats?.bestScore ?? 0, payload.score),
      totalQuestions: nextTotalQuestions,
      correctAnswers: nextCorrectAnswers,
      averageAccuracy: calculateAverageAccuracy(nextCorrectAnswers, nextTotalQuestions),
      lastPlayedAt: new Date().toISOString(),
    });

    const resultState: SessionResultState = {
      payload,
      saveStatus: "saving",
    };

    navigate("/result", { state: resultState });

    try {
      await apiClient.saveSession(payload);
      appLogger.info("play", TEXT.savingSuccess, {
        playerId,
        languageCode: selectedLanguage,
        score: nextScore,
        mode,
      });
      navigate("/result", {
        replace: true,
        state: {
          payload,
          saveStatus: "saved",
        } satisfies SessionResultState,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : TEXT.savingFail;
      writePendingSession(playerId, selectedLanguage, payload, message);
      appLogger.warning("play", TEXT.savingFallback, {
        playerId,
        languageCode: selectedLanguage,
        message,
        mode,
      });
      navigate("/result", {
        replace: true,
        state: {
          payload,
          saveStatus: "pending",
          message: `${TEXT.pendingSavedMessage} ${message}`,
        } satisfies SessionResultState,
      });
    }
  }

  async function handleAnswer(choice: string) {
    if (!currentWord || !currentQuestion) {
      return;
    }

    if (answerLockRef.current) {
      return;
    }

    answerLockRef.current = true;
    setIsAnswerLocked(true);

    const correct = choice === currentQuestion.answer;
    const nextCombo = correct ? combo + 1 : 0;
    const earnedScore = correct ? 10 + nextCombo * 2 : 0;
    const nextScore = score + earnedScore;
    const nextHeartsLeft = correct ? heartsLeft : heartsLeft - 1;
    const responseTimeMs = Math.max(0, Date.now() - questionStartedAt);

    appLogger.info("play", TEXT.answerHandled, {
      wordId: currentWord.id,
      questionType: currentWord.questionType,
      correct,
      nextCombo,
      nextScore,
      nextHeartsLeft,
      mode,
    });

    const answer: PendingAnswer = {
      wordId: currentWord.id,
      questionType: currentWord.questionType,
      shownPrompt: currentQuestion.prompt,
      difficultySnapshot: currentWord.difficulty,
      responseTimeMs,
      selectedAnswer: choice,
      correct,
      comboAfterAnswer: nextCombo,
      earnedScore,
    };

    const nextAnswerLog = [...answerLog, answer];

    setCombo(nextCombo);
    setScore(nextScore);
    setHeartsLeft(nextHeartsLeft);
    setAnswerLog(nextAnswerLog);

    const reachedLastQuestion = currentIndex >= words.length - 1;
    const noHeartsLeft = nextHeartsLeft <= 0;

    if (reachedLastQuestion || noHeartsLeft) {
      await finishGame(nextAnswerLog, nextScore, nextHeartsLeft);
      return;
    }

    setCurrentIndex((previous) => previous + 1);
  }

  if (!currentWord || !currentQuestion) {
    return (
      <section className="rounded-[2rem] border border-white/10 bg-stone-950/40 p-6">
        <p className="text-sm text-stone-300">{TEXT.loadingQuestions}</p>
      </section>
    );
  }

  return (
    <section className="space-y-4 pb-4">
      {loadError ? (
        <div className="rounded-[1.5rem] border border-amber-300/30 bg-amber-300/10 p-4 text-sm leading-6 text-amber-50">
          {loadError}
        </div>
      ) : null}

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="rounded-[1.5rem] border border-white/10 bg-white/10 px-3 py-4 text-center sm:rounded-2xl sm:p-4">
          <p className="text-[11px] tracking-[0.2em] text-stone-400">{TEXT.heartsLabel}</p>
          <p className="mt-2 text-2xl font-bold text-rose-100">{heartsLeft}</p>
        </div>
        <div className="rounded-[1.5rem] border border-white/10 bg-white/10 px-3 py-4 text-center sm:rounded-2xl sm:p-4">
          <p className="text-[11px] tracking-[0.2em] text-stone-400">{TEXT.scoreLabel}</p>
          <p className="mt-2 text-2xl font-bold">{score}</p>
        </div>
        <div className="rounded-[1.5rem] border border-white/10 bg-white/10 px-3 py-4 text-center sm:rounded-2xl sm:p-4">
          <p className="text-[11px] tracking-[0.2em] text-stone-400">{TEXT.comboLabel}</p>
          <p className="mt-2 text-2xl font-bold">{combo}</p>
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-white/10 bg-stone-950/40 p-5 sm:rounded-[2rem] sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-amber-200">{TEXT.progress} {progressLabel}</p>
          <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-stone-200">
            {words.length - currentIndex - 1}{TEXT.remainingQuestions}
          </span>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-sky-200/20 bg-sky-300/12 px-3 py-1 text-xs font-semibold text-sky-100">
            {modeTitle}
          </span>
          <span className="rounded-full border border-amber-200/20 bg-amber-300/12 px-3 py-1 text-xs font-semibold text-amber-100">
            {TEXT.questionType} {currentQuestion.typeLabel}
          </span>
          <span className="text-xs leading-6 text-stone-400">{modeDescription}</span>
        </div>
        <h2 className="mt-4 text-[2.2rem] font-bold leading-tight sm:text-5xl">{currentQuestion.prompt}</h2>
        <p className="mt-3 text-sm leading-6 text-stone-300">{currentQuestion.instruction}</p>
      </div>

      <div className="grid gap-3">
        {currentQuestion.choices.map((choice, index) => (
          <button
            key={`${currentWord.id}-${choice}-${index}`}
            className="min-h-16 rounded-[1.5rem] border border-white/10 bg-white/10 px-5 py-5 text-left text-[1.02rem] font-medium leading-7 transition hover:border-amber-300/60 hover:bg-white/12"
            type="button"
            onClick={() => void handleAnswer(choice)}
            disabled={isSaving || isAnswerLocked}
          >
            {choice}
          </button>
        ))}
      </div>
    </section>
  );
}

