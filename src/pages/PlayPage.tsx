import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { SessionResultState } from "../features/game/resultState";
import {
  buildSessionWordQueue,
  DEFAULT_SESSION_CONFIG,
  filterWordsBySessionConfig,
  getSessionConfigLabels,
  type DifficultyFilter,
  type PartOfSpeechFilter,
  type QuizModeFilter,
  type SessionConfig,
} from "../features/game/sessionConfig";
import { buildQuestionRound } from "../features/game/questionRound";
import { buildSaveSessionPayload } from "../features/game/session";
import type { AnswerLog, SaveSessionRequest, WordItem } from "../services/apiTypes";
import { apiClient } from "../services/apiClient";
import { appLogger } from "../services/logger";
import {
  readDailyStatsSnapshot,
  readReviewSnapshot,
  writeSessionConfigSnapshot,
  writeDailyStatsSnapshot,
  writePendingSession,
  writeReviewSnapshot,
} from "../services/sessionRecovery";
import { useAuthStore } from "../stores/authStore";
import { useLanguageStore } from "../stores/languageStore";

type PendingAnswer = AnswerLog;
type PlayMode = "standard" | "practice";
type AnswerFeedback = "correct" | "incorrect" | null;
type QuestionVisualPhase = "steady" | "impact" | "enter";
type AnswerSummary = {
  earnedScore: number;
  comboAfter: number;
  heartsLeft: number;
  responseTimeMs: number;
};

type PlayPageProps = {
  mode?: PlayMode;
};

const MAX_HEARTS = 3;
const NEXT_QUESTION_DELAY_MS = 220;
const QUESTION_ENTER_DELAY_MS = 180;
const CHOICE_MARKERS = ["A", "B", "C", "D"];
const TEXT = {
  practiceMode: "\uC5F0\uC2B5",
  standardMode: "\uAE30\uBCF8",
  savingStart: "\uC138\uC158 \uC800\uC7A5 \uC2DC\uC791",
  savingSuccess: "\uC138\uC158 \uC800\uC7A5 \uC131\uACF5",
  savingFail: "\uC138\uC158 \uC800\uC7A5\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.",
  savingFallback: "\uC138\uC158 \uC800\uC7A5 \uC2E4\uD328, \uC784\uC2DC \uC800\uC7A5\uC73C\uB85C \uC804\uD658",
  pendingSavedMessage:
    "\uC800\uC7A5\uC5D0 \uC2E4\uD328\uD574 \uC774 \uAE30\uAE30\uC5D0 \uC784\uC2DC \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4.",
  answerHandled: "\uBB38\uD56D \uB2F5\uBCC0 \uCC98\uB9AC",
  checkingAnswer: "\uB2F5\uBCC0 \uD655\uC778 \uC911...",
  movingNextQuestion: "\uACE7 \uB2E4\uC74C \uBB38\uC81C\uB85C \uB118\uC5B4\uAC00\uC694.",
  preparingResult: "\uACB0\uACFC\uB97C \uC815\uB9AC\uD558\uACE0 \uC788\uC5B4\uC694.",
  correctFeedbackStatus: "\uC815\uB2F5 \uD53C\uB4DC\uBC31",
  incorrectFeedbackStatus: "\uC624\uB2F5 \uD53C\uB4DC\uBC31",
  finishingFeedbackStatus: "\uACB0\uACFC \uC774\uB3D9 \uC900\uBE44",
  correctAnswer: "\uC815\uB2F5\uC774\uC5D0\uC694!",
  incorrectAnswer: "\uC624\uB2F5\uC774\uC5C8\uC5B4\uC694. \uB2E4\uC74C \uBB38\uC81C\uB85C \uB118\uC5B4\uAC08\uAC8C\uC694.",
  correctAnswerLabel: "\uC815\uB2F5",
  loadingQuestions: "\uBB38\uC81C\uB97C \uC900\uBE44\uD558\uB294 \uC911\uC785\uB2C8\uB2E4...",
  reloadWords: "\uB2E8\uC5B4 \uB2E4\uC2DC \uBD88\uB7EC\uC624\uAE30",
  reloadingWords: "\uB2E8\uC5B4 \uB2E4\uC2DC \uBD88\uB7EC\uC624\uB294 \uC911...",
  moveHome: "\uD648\uC73C\uB85C \uC774\uB3D9",
  missingLanguage:
    "\uC120\uD0DD\uD55C \uC5B8\uC5B4 \uC815\uBCF4\uAC00 \uC5C6\uC5B4 \uD648\uC5D0\uC11C \uB2E4\uC2DC \uC2DC\uC791\uD574 \uC8FC\uC138\uC694.",
  progress: "\uC9C4\uD589\uB3C4",
  sessionProgressLabel: "\uC138\uC158 \uC9C4\uD589",
  remainingQuestions: "\uBB38\uC81C \uB0A8\uC74C",
  finalQuestion: "\uB9C8\uC9C0\uB9C9 \uBB38\uC81C",
  movingResult: "\uACB0\uACFC \uC774\uB3D9 \uC911",
  correctStatusChip: "\uC815\uB2F5 \uD655\uC815",
  incorrectStatusChip: "\uC624\uB2F5 \uD655\uC778",
  finishingStatusChip: "\uC138\uC158 \uB9C8\uBB34\uB9AC",
  heartsLabel: "\uD558\uD2B8",
  scoreLabel: "\uC810\uC218",
  comboLabel: "\uCF64\uBCF4",
  correctHudSummary: "\uC815\uB2F5 \uD750\uB984 \uC720\uC9C0 \uC911",
  incorrectHudSummary: "\uD558\uD2B8 \uC8FC\uC758",
  finishingHudSummary: "\uC138\uC158 \uACB0\uACFC \uC900\uBE44 \uC911",
  rewardCorrect: "\uC815\uB2F5",
  rewardHeartLoss: "\uD558\uD2B8 -1",
  rewardCombo: "\uCF64\uBCF4",
  earnedScoreLabel: "\uD68D\uB4DD \uC810\uC218",
  earnedScoreSummary: "\uD68D\uB4DD",
  comboAfterLabel: "\uD604\uC7AC \uCF64\uBCF4",
  heartsAfterLabel: "\uB0A8\uC740 \uD558\uD2B8",
  responseTimeLabel: "\uBC18\uC751 \uC2DC\uAC04",
  selectedAnswerLabel: "\uC120\uD0DD\uD55C \uB2F5",
  selectedBadge: "\uC120\uD0DD",
  setupTitle: "\uC138\uC158 \uC124\uC815",
  partOfSpeechTitle: "\uD488\uC0AC",
  difficultyTitle: "\uB09C\uC774\uB3C4",
  quizModeTitle: "\uCD9C\uC81C \uBC29\uC2DD",
  setupSummary: "\uC870\uD569",
  setupReset: "\uCD08\uAE30\uD654",
  availableQuestions: "\uC9C4\uC785 \uAC00\uB2A5 \uBB38\uC81C",
  availableWords: "\uD544\uD130 \uC77C\uCE58 \uBB38\uD56D",
  noFilteredWords:
    "\uC120\uD0DD\uD55C \uC870\uD569\uC5D0 \uB9DE\uB294 \uBB38\uC81C\uAC00 \uC5C6\uC5B4 \uC870\uAC74\uC744 \uBC14\uAFD4 \uC8FC\uC138\uC694.",
  resetFilters: "\uC870\uAC74 \uCD08\uAE30\uD654",
  sessionConfigTitle: "\uC138\uC158 \uAD6C\uC131",
  sessionConfigDifficulty: "\uB09C\uC774\uB3C4",
  sessionConfigQuizMode: "\uCD9C\uC81C",
  partOfSpeechAll: "\uC804\uCCB4",
  partOfSpeechNoun: "\uBA85\uC0AC",
  partOfSpeechVerb: "\uB3D9\uC0AC",
  partOfSpeechAdjective: "\uD615\uC6A9\uC0AC",
  partOfSpeechAdverb: "\uBD80\uC0AC",
  partOfSpeechOther: "\uAE30\uD0C0",
  difficultyAll: "\uC804\uCCB4",
  difficulty1: "\uB09C\uC774\uB3C4 1",
  difficulty2: "\uB09C\uC774\uB3C4 2",
  difficulty3: "\uB09C\uC774\uB3C4 3+",
  quizModeKanjiToMeaning: "\uD55C\uC790 \uB73B",
  quizModeFuriganaToMeaning: "\uD6C4\uB9AC \uB73B",
  quizModeAudioToMeaning: "\uC74C\uC131 \uB73B",
  quizModeMeaningToWord: "\uB73B \uB2E8\uC5B4",
  feedbackDeckTitle: "\uD310\uC815 \uCF58\uC194",
  setupEyebrow: "",
  startGame: "\uC2DC\uC791",
  startPractice: "\uC5F0\uC2B5",
  backHomeCompact: "\uD648",
  setupModeLabel: "\uBAA8\uB4DC",
  setupCountLabel: "\uC900\uBE44 \uBB38\uC81C",
  paceCompact: "\uD398\uC774\uC2A4",
} as const;

const PART_OF_SPEECH_OPTIONS: Array<{ value: PartOfSpeechFilter; label: string }> = [
  { value: "all", label: TEXT.partOfSpeechAll },
  { value: "noun", label: TEXT.partOfSpeechNoun },
  { value: "verb", label: TEXT.partOfSpeechVerb },
  { value: "adjective", label: TEXT.partOfSpeechAdjective },
  { value: "adverb", label: TEXT.partOfSpeechAdverb },
  { value: "other", label: TEXT.partOfSpeechOther },
];

const DIFFICULTY_OPTIONS: Array<{ value: DifficultyFilter; label: string }> = [
  { value: "all", label: TEXT.difficultyAll },
  { value: "1", label: TEXT.difficulty1 },
  { value: "2", label: TEXT.difficulty2 },
  { value: "3", label: TEXT.difficulty3 },
];

const QUIZ_MODE_OPTIONS: Array<{ value: QuizModeFilter; label: string }> = [
  { value: "kanji_to_meaning", label: TEXT.quizModeKanjiToMeaning },
  { value: "furigana_to_meaning", label: TEXT.quizModeFuriganaToMeaning },
  { value: "audio_to_meaning", label: TEXT.quizModeAudioToMeaning },
  { value: "meaning_to_word", label: TEXT.quizModeMeaningToWord },
];

function calculateAverageAccuracy(correctAnswers: number, totalQuestions: number) {
  if (totalQuestions === 0) {
    return 0;
  }

  return Math.round((correctAnswers / totalQuestions) * 100);
}

function formatResponseTime(responseTimeMs: number) {
  if (responseTimeMs < 1000) {
    return `${Math.round(responseTimeMs / 10) * 10}ms`;
  }

  return `${(responseTimeMs / 1000).toFixed(1)}s`;
}

function wait(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function findWordForAnswer(configuredWords: WordItem[], answer: PendingAnswer) {
  return (
    configuredWords.find(
      (word) =>
        word.id === answer.wordId &&
        word.questionType === answer.questionType &&
        word.prompt === answer.shownPrompt,
    ) ??
    configuredWords.find((word) => word.id === answer.wordId && word.questionType === answer.questionType) ??
    configuredWords.find((word) => word.id === answer.wordId) ??
    null
  );
}

function getStatusTone(answerFeedback: AnswerFeedback, isFinishingSession: boolean) {
  if (isFinishingSession) {
    return {
      shell: "from-sky-500/18 via-cyan-400/10 to-stone-950",
      panel: "border-sky-200/20 bg-sky-300/10",
      chip: "border-sky-200/20 bg-sky-300/12 text-sky-100",
      progress: "bg-gradient-to-r from-sky-300 via-sky-200 to-cyan-200",
      text: "text-sky-100",
    };
  }

  if (answerFeedback === "correct") {
    return {
      shell: "from-emerald-500/18 via-amber-300/8 to-stone-950",
      panel: "border-emerald-300/20 bg-emerald-300/10",
      chip: "border-emerald-200/20 bg-emerald-300/12 text-emerald-100",
      progress: "bg-gradient-to-r from-emerald-300 via-emerald-200 to-amber-200",
      text: "text-emerald-100",
    };
  }

  if (answerFeedback === "incorrect") {
    return {
      shell: "from-rose-500/18 via-amber-300/8 to-stone-950",
      panel: "border-rose-300/20 bg-rose-300/10",
      chip: "border-rose-200/20 bg-rose-300/12 text-rose-100",
      progress: "bg-gradient-to-r from-rose-300 via-rose-200 to-amber-200",
      text: "text-rose-100",
    };
  }

  return {
    shell: "from-amber-400/18 via-sky-300/8 to-stone-950",
    panel: "border-white/10 bg-stone-950/40",
    chip: "border-white/10 bg-white/10 text-stone-200",
    progress: "bg-gradient-to-r from-amber-300 via-amber-200 to-sky-200",
    text: "text-stone-100",
  };
}

export function PlayPage({ mode = "standard" }: PlayPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const playerId = useAuthStore((state) => state.playerId);
  const selectedLanguage = useLanguageStore((state) => state.selectedLanguage);
  const words = useLanguageStore((state) => state.words);
  const loadWords = useLanguageStore((state) => state.loadWords);
  const loadError = useLanguageStore((state) => state.loadError);
  const isLoading = useLanguageStore((state) => state.isLoading);
  const clearLoadError = useLanguageStore((state) => state.clearLoadError);
  const incomingSessionConfig = (location.state as { sessionConfig?: SessionConfig } | null)?.sessionConfig;

  const [sessionConfig, setSessionConfig] = useState<SessionConfig>(incomingSessionConfig ?? DEFAULT_SESSION_CONFIG);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [heartsLeft, setHeartsLeft] = useState(MAX_HEARTS);
  const [answerLog, setAnswerLog] = useState<PendingAnswer[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const [isFinishingSession, setIsFinishingSession] = useState(false);
  const [answerFeedback, setAnswerFeedback] = useState<AnswerFeedback>(null);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [answerSummary, setAnswerSummary] = useState<AnswerSummary | null>(null);
  const [sessionStartedAt, setSessionStartedAt] = useState(() => Date.now());
  const [questionStartedAt, setQuestionStartedAt] = useState(() => Date.now());
  const [isSessionStarted, setIsSessionStarted] = useState(false);
  const [questionVisualPhase, setQuestionVisualPhase] = useState<QuestionVisualPhase>("steady");
  const answerLockRef = useRef(false);
  const questionPhaseTimeoutRef = useRef<number | null>(null);

  const isPracticeMode = mode === "practice";
  const modeTitle = isPracticeMode ? TEXT.practiceMode : TEXT.standardMode;
  const reviewSnapshot = useMemo(() => {
    if (!playerId || !selectedLanguage) {
      return null;
    }

    return readReviewSnapshot(playerId, selectedLanguage);
  }, [playerId, selectedLanguage]);

  useEffect(() => {
    if (incomingSessionConfig) {
      setSessionConfig(incomingSessionConfig);
      answerLockRef.current = false;
      setCurrentIndex(0);
      setScore(0);
      setCombo(0);
      setHeartsLeft(MAX_HEARTS);
      setAnswerLog([]);
      setIsSaving(false);
      setIsAnswerLocked(false);
      setIsFinishingSession(false);
      setAnswerFeedback(null);
      setSelectedChoice(null);
      setAnswerSummary(null);
      setSessionStartedAt(Date.now());
      setQuestionStartedAt(Date.now());
      setIsSessionStarted(false);
      setQuestionVisualPhase("steady");
    }
  }, [incomingSessionConfig]);

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

  const configuredWords = useMemo(() => {
    const filteredWords = filterWordsBySessionConfig(words, sessionConfig);
    return buildSessionWordQueue(filteredWords, sessionConfig, {
      mode,
      reviewState: reviewSnapshot?.reviewState,
    });
  }, [mode, reviewSnapshot?.reviewState, sessionConfig, words]);
  const sessionConfigLabels = useMemo(() => getSessionConfigLabels(sessionConfig), [sessionConfig]);
  const currentWord = configuredWords[currentIndex];
  const currentQuestion = useMemo(() => {
    if (!currentWord) {
      return null;
    }

    return buildQuestionRound(currentWord, configuredWords);
  }, [configuredWords, currentWord]);

  useEffect(() => {
    if (currentWord) {
      if (questionPhaseTimeoutRef.current) {
        window.clearTimeout(questionPhaseTimeoutRef.current);
      }
      answerLockRef.current = false;
      setIsAnswerLocked(false);
      setIsFinishingSession(false);
      setAnswerFeedback(null);
      setSelectedChoice(null);
      setAnswerSummary(null);
      setQuestionStartedAt(Date.now());
      setQuestionVisualPhase("enter");
      questionPhaseTimeoutRef.current = window.setTimeout(() => {
        setQuestionVisualPhase("steady");
        questionPhaseTimeoutRef.current = null;
      }, QUESTION_ENTER_DELAY_MS);
    }
  }, [currentWord]);

  useEffect(() => {
    return () => {
      if (questionPhaseTimeoutRef.current) {
        window.clearTimeout(questionPhaseTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!playerId || !selectedLanguage) {
      return;
    }

    writeSessionConfigSnapshot(playerId, selectedLanguage, sessionConfig);
  }, [playerId, selectedLanguage, sessionConfig]);

  function resetSessionProgress() {
    answerLockRef.current = false;
    setCurrentIndex(0);
    setScore(0);
    setCombo(0);
    setHeartsLeft(MAX_HEARTS);
    setAnswerLog([]);
    setIsSaving(false);
    setIsAnswerLocked(false);
    setIsFinishingSession(false);
    setAnswerFeedback(null);
    setSelectedChoice(null);
    setAnswerSummary(null);
    setSessionStartedAt(Date.now());
    setQuestionStartedAt(Date.now());
    setIsSessionStarted(false);
    setQuestionVisualPhase("steady");
  }

  function updateSessionConfig(partial: Partial<SessionConfig>) {
    setSessionConfig((previous) => ({ ...previous, ...partial }));
    resetSessionProgress();
  }

  function startSession() {
    answerLockRef.current = false;
    setCurrentIndex(0);
    setScore(0);
    setCombo(0);
    setHeartsLeft(MAX_HEARTS);
    setAnswerLog([]);
    setIsSaving(false);
    setIsAnswerLocked(false);
    setIsFinishingSession(false);
    setAnswerFeedback(null);
    setSelectedChoice(null);
    setAnswerSummary(null);
    setSessionStartedAt(Date.now());
    setQuestionStartedAt(Date.now());
    setIsSessionStarted(true);
    setQuestionVisualPhase("steady");
  }

  const progressLabel = useMemo(
    () => `${Math.min(currentIndex + 1, configuredWords.length)} / ${configuredWords.length}`,
    [configuredWords.length, currentIndex],
  );
  const progressPercent =
    configuredWords.length === 0 ? 0 : ((currentIndex + 1) / configuredWords.length) * 100;
  const remainingCount = configuredWords.length - currentIndex - 1;
  const remainingLabel = isFinishingSession
    ? TEXT.movingResult
    : remainingCount === 0
      ? TEXT.finalQuestion
      : `${remainingCount} ${TEXT.remainingQuestions}`;
  const remainingChipClassName = isFinishingSession
    ? "border-sky-200/20 bg-sky-300/12 text-sky-100"
    : remainingCount === 0
      ? "border-amber-200/20 bg-amber-300/12 text-amber-100"
      : "border-white/10 bg-white/10 text-stone-200";
  const selectedChoiceClassName =
    answerFeedback === "correct"
      ? "border-emerald-300/80 bg-emerald-300/18 text-emerald-50 ring-1 ring-emerald-200/40 shadow-[0_0_0_1px_rgba(110,231,183,0.18),0_18px_40px_rgba(16,185,129,0.18)] -translate-y-0.5 scale-[1.01]"
      : "border-rose-300/80 bg-rose-300/18 text-rose-50 ring-1 ring-rose-200/40 shadow-[0_0_0_1px_rgba(253,164,175,0.18),0_18px_40px_rgba(244,63,94,0.18)] -translate-y-0.5 scale-[1.01]";
  const revealedCorrectChoiceClassName =
    "border-emerald-300/80 bg-emerald-300/14 text-emerald-50 ring-1 ring-emerald-200/35 shadow-[0_0_0_1px_rgba(110,231,183,0.18),0_16px_36px_rgba(16,185,129,0.14)]";
  const idleChoiceClassName =
    isAnswerLocked && !isSaving
      ? "border-white/10 bg-white/5 text-stone-500 opacity-55"
      : "border-white/10 bg-white/10 hover:-translate-y-0.5 hover:scale-[1.01] hover:border-amber-300/60 hover:bg-white/12";
  const responseTimeText = answerSummary ? formatResponseTime(answerSummary.responseTimeMs) : null;
  const scoreSummaryLabel = `${score}${combo > 0 ? ` / ${TEXT.comboLabel} ${combo}` : ""}`;
  const focusTone = getStatusTone(answerFeedback, isFinishingSession);
  const statusRailLabel = `${modeTitle} / ${sessionConfigLabels.quizMode}`;
  const statusRailMeta = `${TEXT.heartsLabel} ${heartsLeft} / ${TEXT.scoreLabel} ${score}`;
  const questionCardStateClassName =
    questionVisualPhase === "impact"
      ? "scale-[0.99] opacity-95"
      : questionVisualPhase === "enter"
        ? "translate-y-1 opacity-70"
        : "translate-y-0 opacity-100";
  const choicesStateClassName =
    questionVisualPhase === "impact"
      ? "translate-y-0.5 opacity-90"
      : questionVisualPhase === "enter"
        ? "translate-y-1 opacity-75"
        : "translate-y-0 opacity-100";

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
      sessionConfig,
    });

    const payload: SaveSessionRequest = buildSaveSessionPayload({
      playerId,
      languageCode: selectedLanguage,
      modeType: mode,
      totalTimeSec: Math.max(0, Math.ceil((Date.now() - sessionStartedAt) / 1000)),
      score: nextScore,
      heartsLeft: nextHeartsLeft,
      answers: nextAnswerLog.map((answer, index) => ({
        word:
          findWordForAnswer(configuredWords, answer) ??
          configuredWords[index] ??
          words[index]!,
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
      sessionConfig,
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
          sessionConfig,
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
          sessionConfig,
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
    setSelectedChoice(choice);
    setQuestionVisualPhase("impact");

    const correct = choice === currentQuestion.answer;
    setAnswerFeedback(correct ? "correct" : "incorrect");
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
      sessionConfig,
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
    setAnswerSummary({
      earnedScore,
      comboAfter: nextCombo,
      heartsLeft: nextHeartsLeft,
      responseTimeMs,
    });

    const reachedLastQuestion = currentIndex >= configuredWords.length - 1;
    const noHeartsLeft = nextHeartsLeft <= 0;

    if (reachedLastQuestion || noHeartsLeft) {
      setIsFinishingSession(true);
      await finishGame(nextAnswerLog, nextScore, nextHeartsLeft);
      return;
    }

    await wait(NEXT_QUESTION_DELAY_MS);
    setCurrentIndex((previous) => previous + 1);
  }

  if (words.length > 0 && configuredWords.length === 0) {
    return (
      <section className="space-y-4 pb-4">
        <SessionSetupPanel
          sessionConfig={sessionConfig}
          sessionConfigLabels={sessionConfigLabels}
          configuredWordsCount={configuredWords.length}
          totalWordsCount={words.length}
          isDisabled={isSaving}
          onReset={() => updateSessionConfig(DEFAULT_SESSION_CONFIG)}
          onUpdate={updateSessionConfig}
        />
        <div className="rounded-[2rem] border border-white/10 bg-stone-950/40 p-6">
          <p className="text-sm leading-6 text-stone-300">{TEXT.noFilteredWords}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              className="min-h-12 rounded-2xl bg-amber-400 px-4 py-3 text-sm font-semibold text-stone-950"
              type="button"
              onClick={() => updateSessionConfig(DEFAULT_SESSION_CONFIG)}
            >
              {TEXT.resetFilters}
            </button>
            <button
              className="min-h-12 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-stone-100"
              type="button"
              onClick={() => navigate("/home")}
            >
              {TEXT.moveHome}
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!currentWord || !currentQuestion) {
    const emptyStateMessage = loadError ?? (!selectedLanguage ? TEXT.missingLanguage : TEXT.loadingQuestions);
    const shouldShowHomeButton = Boolean(loadError) || !selectedLanguage;

    return (
      <section className="rounded-[2rem] border border-white/10 bg-stone-950/40 p-6">
        <p className="text-sm leading-6 text-stone-300">{emptyStateMessage}</p>
        {loadError || !selectedLanguage ? (
          <div className="mt-4 flex flex-wrap gap-3">
            {selectedLanguage ? (
              <button
                className="min-h-12 rounded-2xl bg-amber-400 px-4 py-3 text-sm font-semibold text-stone-950 disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
                onClick={() => void loadWords(selectedLanguage)}
                disabled={isLoading}
              >
                {isLoading ? TEXT.reloadingWords : TEXT.reloadWords}
              </button>
            ) : null}
            {shouldShowHomeButton ? (
              <button
                className="min-h-12 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-stone-100"
                type="button"
                onClick={() => navigate("/home")}
              >
                {TEXT.moveHome}
              </button>
            ) : null}
          </div>
        ) : null}
      </section>
    );
  }

  if (!isSessionStarted) {
    return (
      <section className="space-y-4 pb-4">
        <SessionStartScreen
          modeTitle={modeTitle}
          startLabel={isPracticeMode ? TEXT.startPractice : TEXT.startGame}
          sessionConfig={sessionConfig}
          sessionConfigLabels={sessionConfigLabels}
          configuredWordsCount={configuredWords.length}
          totalWordsCount={words.length}
          onReset={() => updateSessionConfig(DEFAULT_SESSION_CONFIG)}
          onStart={startSession}
          onMoveHome={() => navigate("/home")}
          onUpdate={updateSessionConfig}
        />
      </section>
    );
  }

  return (
    <section
      className={`space-y-4 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br ${focusTone.shell} p-4 pb-5 shadow-[0_24px_120px_rgba(0,0,0,0.35)] sm:p-5 lg:p-6`}
    >
      <div className="space-y-3">
        <div className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-stone-950/65">
          <div className="space-y-2.5 px-4 py-3 sm:px-5">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
              <span className={`rounded-full border px-3 py-1 ${remainingChipClassName}`}>{remainingLabel}</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <HudStatCard label={TEXT.heartsLabel} value={String(heartsLeft)} accentClassName="text-rose-100" />
              <HudStatCard label={TEXT.scoreLabel} value={scoreSummaryLabel} accentClassName="text-sky-100" />
              <HudStatCard
                label={TEXT.paceCompact}
                value={responseTimeText ?? "-"}
                accentClassName={responseTimeText ? "text-emerald-100" : "text-stone-300"}
              />
            </div>
            <div className={`rounded-[0.95rem] border px-3 py-2 transition duration-300 ${focusTone.panel}`} aria-live="polite">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <span className="rounded-full border border-white/10 bg-white/8 px-2.5 py-1 text-[10px] font-semibold text-amber-100">
                    {TEXT.progress} {progressLabel}
                  </span>
                  <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[10px] font-semibold text-stone-200">
                    {sessionConfigLabels.quizMode}
                  </span>
                  <span className={`truncate text-[13px] font-semibold ${focusTone.text}`}>{statusRailLabel}</span>
                </div>
                <span className="text-[10px] text-stone-400">{statusRailMeta}</span>
              </div>
            </div>
          </div>

          <div className="px-4 pb-4 sm:px-5">
            <div
              className="h-2 overflow-hidden rounded-full bg-white/10"
              role="progressbar"
              aria-label={TEXT.sessionProgressLabel}
              aria-valuemin={1}
              aria-valuemax={Math.max(configuredWords.length, 1)}
              aria-valuenow={Math.min(currentIndex + 1, Math.max(configuredWords.length, 1))}
              aria-valuetext={progressLabel}
            >
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${focusTone.progress}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="pointer-events-none flex items-center justify-center">
          <div className="flex w-full max-w-[9rem] items-center gap-2">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/16 to-white/35" />
            <span className={`h-2.5 w-2.5 rounded-full border border-white/20 ${focusTone.panel}`} />
            <span className="h-px flex-1 bg-gradient-to-l from-transparent via-white/16 to-white/35" />
          </div>
        </div>

        <div
          className={`overflow-hidden rounded-[1.9rem] border bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.14),_rgba(255,255,255,0.03)_35%,_rgba(12,10,9,0.92)_78%)] shadow-[0_22px_80px_rgba(0,0,0,0.32)] transition duration-300 ${questionCardStateClassName} ${
            answerFeedback === "correct"
              ? "border-emerald-300/30 shadow-[0_24px_88px_rgba(16,185,129,0.18)]"
              : answerFeedback === "incorrect"
                ? "border-rose-300/30 shadow-[0_24px_88px_rgba(244,63,94,0.16)]"
                : "border-white/10"
          }`}
        >
          <div className={`h-1 w-full ${focusTone.progress}`} />
          <div className="border-b border-white/10 bg-gradient-to-r from-amber-200/10 via-white/6 to-transparent px-4 py-2.5 sm:px-5">
            <div className="space-y-1">
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                {TEXT.difficultyTitle} {sessionConfigLabels.difficulty}
              </p>
              <h2 className="text-[1.28rem] font-black leading-tight tracking-[-0.045em] text-white drop-shadow-[0_6px_24px_rgba(0,0,0,0.28)] sm:text-[1.75rem]">
                {currentQuestion.prompt}
              </h2>
            </div>
          </div>

          <div className="px-4 py-2.5 sm:px-5 sm:py-3">
            <div className={`grid gap-2 transition duration-300 ${choicesStateClassName}`}>
              {currentQuestion.choices.map((choice, index) => (
                <ChoiceCard
                  key={`${currentWord.id}-${choice}-${index}`}
                  marker={CHOICE_MARKERS[index] ?? String(index + 1)}
                  choice={choice}
                  state={
                    selectedChoice === choice
                      ? answerFeedback === "correct"
                        ? "selected-correct"
                        : "selected-wrong"
                      : answerFeedback === "incorrect" && currentQuestion.answer === choice
                        ? "revealed-correct"
                        : isAnswerLocked && !isSaving
                          ? "dimmed"
                          : "idle"
                  }
                  className={
                    selectedChoice === choice
                      ? selectedChoiceClassName
                      : answerFeedback === "incorrect" && currentQuestion.answer === choice
                        ? revealedCorrectChoiceClassName
                        : idleChoiceClassName
                  }
                  isDisabled={isSaving || isAnswerLocked}
                  isSelected={selectedChoice === choice}
                  onClick={() => void handleAnswer(choice)}
                >
                  {isAnswerLocked && selectedChoice === choice ? (
                    <span className="rounded-full border border-current/30 px-2 py-1 text-[11px] font-semibold">
                      {TEXT.selectedBadge}
                    </span>
                  ) : null}
                  {answerFeedback === "incorrect" && currentQuestion.answer === choice ? (
                    <span className="rounded-full border border-current/30 px-2 py-1 text-[11px] font-semibold">
                      {TEXT.correctAnswerLabel}
                    </span>
                  ) : null}
                </ChoiceCard>
              ))}
            </div>
          </div>
        </div>

        <div
          className={`min-h-[2.75rem] rounded-[1rem] border px-3 py-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.14)] transition duration-300 ${focusTone.panel}`}
          aria-live="polite"
        >
          <div className="flex min-h-[1.5rem] flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-stone-500">
              {sessionConfigLabels.quizMode} / {TEXT.progress} {progressLabel}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

type SessionSetupPanelProps = {
  sessionConfig: SessionConfig;
  sessionConfigLabels: ReturnType<typeof getSessionConfigLabels>;
  configuredWordsCount: number;
  totalWordsCount: number;
  isDisabled: boolean;
  onReset: () => void;
  onUpdate: (partial: Partial<SessionConfig>) => void;
};

function SessionSetupPanel({
  sessionConfig,
  sessionConfigLabels,
  configuredWordsCount,
  totalWordsCount,
  isDisabled,
  onReset,
  onUpdate,
}: SessionSetupPanelProps) {
  return (
    <aside className="overflow-hidden rounded-[1.85rem] border border-white/10 bg-stone-950/70">
      <div className="border-b border-white/10 bg-gradient-to-r from-white/8 via-white/5 to-transparent px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-200/80">{TEXT.setupTitle}</p>
          <button
            className="min-h-11 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-stone-100 transition hover:bg-white/10 disabled:opacity-50"
            type="button"
            onClick={onReset}
            disabled={isDisabled}
          >
            {TEXT.setupReset}
          </button>
        </div>
      </div>

      <div className="space-y-4 px-5 py-5">
        <div className="grid gap-4">
          <SetupOptionGroup
            title={TEXT.partOfSpeechTitle}
            options={PART_OF_SPEECH_OPTIONS}
            currentValue={sessionConfig.partOfSpeech}
            isDisabled={isDisabled}
            onSelect={(value) => onUpdate({ partOfSpeech: value as PartOfSpeechFilter })}
          />
          <SetupOptionGroup
            title={TEXT.difficultyTitle}
            options={DIFFICULTY_OPTIONS}
            currentValue={sessionConfig.difficulty}
            isDisabled={isDisabled}
            onSelect={(value) => onUpdate({ difficulty: value as DifficultyFilter })}
          />
          <SetupOptionGroup
            title={TEXT.quizModeTitle}
            options={QUIZ_MODE_OPTIONS}
            currentValue={sessionConfig.quizMode}
            isDisabled={isDisabled}
            onSelect={(value) => onUpdate({ quizMode: value as QuizModeFilter })}
          />
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">{TEXT.sessionConfigTitle}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <ConfigSummaryCard label={TEXT.setupSummary} value={sessionConfigLabels.partOfSpeech} />
            <ConfigSummaryCard label={TEXT.sessionConfigDifficulty} value={sessionConfigLabels.difficulty} />
            <ConfigSummaryCard label={TEXT.sessionConfigQuizMode} value={sessionConfigLabels.quizMode} />
            <ConfigSummaryCard label={TEXT.availableWords} value={`${configuredWordsCount} / ${totalWordsCount}`} />
            <ConfigSummaryCard label={TEXT.availableQuestions} value={String(configuredWordsCount)} />
          </div>
        </div>
      </div>
    </aside>
  );
}

type SessionStartScreenProps = {
  modeTitle: string;
  startLabel: string;
  sessionConfig: SessionConfig;
  sessionConfigLabels: ReturnType<typeof getSessionConfigLabels>;
  configuredWordsCount: number;
  totalWordsCount: number;
  onReset: () => void;
  onStart: () => void;
  onMoveHome: () => void;
  onUpdate: (partial: Partial<SessionConfig>) => void;
};

function SessionStartScreen({
  modeTitle,
  startLabel,
  sessionConfig,
  sessionConfigLabels,
  configuredWordsCount,
  totalWordsCount,
  onReset,
  onStart,
  onMoveHome,
  onUpdate,
}: SessionStartScreenProps) {
  return (
    <section className="overflow-hidden rounded-[1.05rem] border border-white/10 bg-gradient-to-br from-[#5a5137] via-[#1f1d19] to-[#111213] p-[3px]">
      <div className="rounded-[0.9rem] border border-white/10 bg-black/25 p-1">
        <div className="flex flex-wrap items-center justify-between gap-1">
          <div>
            {TEXT.setupEyebrow ? (
              <p className="text-[7px] font-semibold uppercase tracking-[0.1em] text-amber-200/70">{TEXT.setupEyebrow}</p>
            ) : null}
            <h2 className="text-[0.75rem] font-black tracking-[-0.04em] text-white sm:text-[0.86rem]">{modeTitle}</h2>
          </div>
          <div className="flex flex-wrap gap-1">
            <button
              className="min-h-5 rounded-2xl border border-white/10 bg-white/5 px-1.5 py-0.5 text-[8px] font-semibold text-stone-100 transition hover:bg-white/10"
              type="button"
              onClick={onReset}
            >
              {TEXT.setupReset}
            </button>
            <button
              className="min-h-5 rounded-2xl border border-white/10 bg-white/5 px-1.5 py-0.5 text-[8px] font-semibold text-stone-100 transition hover:bg-white/10"
              type="button"
              onClick={onMoveHome}
            >
              {TEXT.backHomeCompact}
            </button>
          </div>
        </div>

        <div className="mt-0.5 space-y-0.5">
          <div className="grid gap-0.5">
            <SetupOptionGroup
              title={TEXT.partOfSpeechTitle}
              options={PART_OF_SPEECH_OPTIONS}
              currentValue={sessionConfig.partOfSpeech}
              isDisabled={false}
              onSelect={(value) => onUpdate({ partOfSpeech: value as PartOfSpeechFilter })}
            />
            <SetupOptionGroup
              title={TEXT.difficultyTitle}
              options={DIFFICULTY_OPTIONS}
              currentValue={sessionConfig.difficulty}
              isDisabled={false}
              onSelect={(value) => onUpdate({ difficulty: value as DifficultyFilter })}
            />
            <SetupOptionGroup
              title={TEXT.quizModeTitle}
              options={QUIZ_MODE_OPTIONS}
              currentValue={sessionConfig.quizMode}
              isDisabled={false}
              onSelect={(value) => onUpdate({ quizMode: value as QuizModeFilter })}
            />
          </div>

          <div className="rounded-[0.75rem] border border-white/10 bg-stone-950/60 p-0.5">
            <div className="flex items-center justify-between gap-1 rounded-[0.65rem] border border-white/10 bg-white/[0.04] px-1.5 py-0.5">
              <div>
                <p className="text-[7px] uppercase tracking-[0.08em] text-stone-500">{TEXT.setupCountLabel}</p>
                <p className="mt-0.5 text-[0.72rem] font-black tracking-[-0.04em] text-white">
                  {configuredWordsCount}
                  <span className="ml-1 text-[9px] font-medium text-stone-400">/ {totalWordsCount}</span>
                </p>
              </div>
              <button
                className="min-h-5 rounded-2xl bg-amber-300 px-1.5 py-0.5 text-[9px] font-bold text-stone-950"
                type="button"
                onClick={onStart}
              >
                {startLabel}
              </button>
            </div>

            <div className="mt-0.5 rounded-[0.65rem] border border-white/10 bg-white/[0.03] px-1.5 py-0.5">
              <p className="truncate text-[7px] text-stone-400">
                {sessionConfigLabels.partOfSpeech} · {sessionConfigLabels.difficulty} · {sessionConfigLabels.quizMode}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

type SetupOptionGroupProps = {
  title: string;
  options: Array<{ value: string; label: string }>;
  currentValue: string;
  isDisabled: boolean;
  onSelect: (value: string) => void;
};

function SetupOptionGroup({ title, options, currentValue, isDisabled, onSelect }: SetupOptionGroupProps) {
  const gridClassName = options.length >= 5 ? "grid-cols-3" : "grid-cols-2";

  return (
    <div className="rounded-[0.72rem] border border-white/10 bg-white/5 p-[3px]">
      <p className="text-[8px] font-semibold text-stone-100">{title}</p>
      <div className={`mt-0.5 grid ${gridClassName} gap-0.5`}>
        {options.map((option) => {
          const isSelected = currentValue === option.value;
          return (
            <button
              key={option.value}
              className={`min-h-4.5 rounded-[0.65rem] border px-1 py-0.5 text-center text-[8px] font-semibold leading-3 transition ${
                isSelected
                  ? "border-amber-300/30 bg-amber-300/12 text-amber-100"
                  : "border-white/10 bg-white/5 text-stone-300 hover:border-white/20 hover:bg-white/10"
              }`}
              type="button"
              onClick={() => onSelect(option.value)}
              disabled={isDisabled}
              aria-pressed={isSelected}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

type ConfigSummaryCardProps = {
  label: string;
  value: string;
};

function ConfigSummaryCard({ label, value }: ConfigSummaryCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-stone-950/40 p-4">
      <p className="text-[11px] tracking-[0.2em] text-stone-400">{label}</p>
      <p className="mt-2 text-sm font-semibold text-stone-100">{value}</p>
    </div>
  );
}

type HudStatCardProps = {
  label: string;
  value: string;
  accentClassName?: string;
};

function HudStatCard({ label, value, accentClassName = "text-stone-100" }: HudStatCardProps) {
  return (
    <div className="rounded-[0.9rem] border border-white/10 bg-gradient-to-b from-white/[0.12] via-white/[0.05] to-white/[0.02] px-2 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_20px_rgba(0,0,0,0.14)]">
      <p className="text-[9px] uppercase tracking-[0.18em] text-stone-500">{label}</p>
      <p className={`mt-0.5 text-[11px] font-semibold drop-shadow-[0_3px_12px_rgba(0,0,0,0.18)] sm:text-[12px] ${accentClassName}`}>{value}</p>
    </div>
  );
}

type ChoiceCardState = "idle" | "selected-correct" | "selected-wrong" | "revealed-correct" | "dimmed";

type ChoiceCardProps = {
  marker: string;
  choice: string;
  className: string;
  state: ChoiceCardState;
  isDisabled: boolean;
  isSelected: boolean;
  onClick: () => void;
  children?: ReactNode;
};

function ChoiceCard({
  marker,
  choice,
  className,
  state,
  isDisabled,
  isSelected,
  onClick,
  children,
}: ChoiceCardProps) {
  const markerClassName =
    state === "selected-correct"
      ? "border-emerald-200/40 bg-emerald-200/18 text-emerald-50 shadow-[0_0_18px_rgba(52,211,153,0.2)]"
      : state === "selected-wrong"
        ? "border-rose-200/40 bg-rose-200/18 text-rose-50 shadow-[0_0_18px_rgba(251,113,133,0.2)]"
        : state === "revealed-correct"
          ? "border-emerald-200/35 bg-emerald-200/14 text-emerald-50"
          : state === "dimmed"
            ? "border-white/5 bg-black/20 text-stone-500"
            : "border-white/10 bg-black/20 text-stone-200";
  const textClassName =
    state === "dimmed"
      ? "text-stone-500"
      : state === "selected-correct" || state === "revealed-correct"
        ? "text-emerald-50"
        : state === "selected-wrong"
          ? "text-rose-50"
          : "text-stone-100";

  return (
    <button
      className={`relative min-h-14 overflow-hidden rounded-[1.3rem] border bg-gradient-to-b from-white/[0.1] via-white/[0.04] to-white/[0.02] px-3.5 py-2 text-left text-[15px] font-medium leading-5 shadow-[0_12px_28px_rgba(0,0,0,0.14)] transition duration-300 ease-out disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      aria-pressed={isSelected}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
      />
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-2 left-2 w-1 rounded-full ${
          state === "selected-correct"
            ? "bg-emerald-300/80 shadow-[0_0_16px_rgba(52,211,153,0.35)]"
            : state === "selected-wrong"
              ? "bg-rose-300/80 shadow-[0_0_16px_rgba(251,113,133,0.35)]"
              : state === "revealed-correct"
                ? "bg-emerald-300/70"
                : "bg-white/10"
        }`}
      />
      <span className="flex items-start gap-4">
        <span
          className={`flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-[0.95rem] border text-[12px] font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] ${markerClassName}`}
        >
          {marker}
        </span>
        <span className="flex min-w-0 flex-1 items-center justify-between gap-3">
          <span className={`drop-shadow-[0_2px_10px_rgba(0,0,0,0.16)] ${textClassName}`}>{choice}</span>
          <span className="flex shrink-0 gap-2">{children}</span>
        </span>
      </span>
    </button>
  );
}


