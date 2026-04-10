import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { IncorrectAnswerSummary, SessionResultState } from "../features/game/resultState";
import {
  buildSessionWordQueue,
  DEFAULT_SESSION_CONFIG,
  getAvailableDifficultyFilters,
  getAvailablePartOfSpeechFilters,
  filterWordsBySessionConfig,
  getAvailableQuizModes,
  getQuizModeCounts,
  getQuizModeLabel,
  getSupportedQuizModes,
  getReadableSessionConfigLabels as getSessionConfigLabels,
  normalizeGameStyleFilter,
  normalizeQuizModeFilter,
  type DifficultyFilter,
  type GameStyle,
  type PartOfSpeechFilter,
  type QuizModeFilter,
  type SessionConfig,
} from "../features/game/sessionConfig";
import { buildQuestionRound } from "../features/game/questionRound";
import { buildSaveSessionPayload } from "../features/game/session";
import { mergeReviewState } from "../utils/reviewState";
import type { AnswerLog, ReviewStateRecord, SaveSessionRequest, WordItem } from "../services/apiTypes";
import { apiClient } from "../services/apiClient";
import { playAnswerTone, speakPrompt, stopSpeech } from "../services/audioFeedback";
import { appLogger } from "../services/logger";
import {
  readGlobalLeaderboard,
  readLeaderboard,
  readDailyStatsSnapshot,
  readReviewSnapshot,
  writeGlobalLeaderboard,
  writeLeaderboard,
  writeSessionConfigSnapshot,
  writeDailyStatsSnapshot,
  writePendingSession,
  writeReviewSnapshot,
} from "../services/sessionRecovery";
import { useAuthStore } from "../stores/authStore";
import { useLanguageStore } from "../stores/languageStore";

type PendingAnswer = AnswerLog;
type PlayMode = "standard" | "practice" | "review";
type AnswerFeedback = "correct" | "incorrect" | null;
type QuestionVisualPhase = "steady" | "impact" | "enter";
type AnswerSummary = {
  earnedScore: number;
  comboAfter: number;
  heartsLeft: number;
  responseTimeMs: number;
};
type SelfCheckQuestionRound = ReturnType<typeof buildQuestionRound> & {
  secondaryAnswer?: string | null;
};

type PlayPageProps = {
  mode?: PlayMode;
};

const MAX_HEARTS = 10;
const DISPLAY_HEARTS = 5;
const QUESTION_LIMIT = 20;
const TIME_LIMIT_MS = 10_000;
const NEXT_QUESTION_DELAY_MS = 180;
const QUESTION_ENTER_DELAY_MS = 180;
const CHOICE_MARKERS = ["A", "B", "C", "D"];
const TEXT = {
  gameStyleTitle: "\uAC8C\uC784 \uBC29\uC2DD",
  gameStyleMultipleChoice: "\u0034\uC9C0\uC120\uB2E4\uD615",
  gameStyleSelfCheck: "\uBB38\uB2F5\uD615",
  practiceMode: "\uC5F0\uC2B5",
  reviewMode: "\uBCF5\uC2B5",
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
  revealAnswer: "\uB2F5 \uD45C\uC2DC",
  selfCheckInstruction: "\uB2F5\uC744 \uD655\uC778\uD55C \uB4A4 \uC2A4\uC2A4\uB85C O/X\uB97C \uB20C\uB7EC \uC8FC\uC138\uC694.",
  selfCheckCorrect: "O",
  selfCheckIncorrect: "X",
  selfCheckCorrectLabel: "\uB9DE\uC558\uC5B4\uC694",
  selfCheckIncorrectLabel: "\uD2C0\uB838\uC5B4\uC694",
  selfCheckAnswerTitle: "\uC815\uB2F5 \uD655\uC778",
  selfCheckCorrectCount: "\uC815\uB2F5 \uC218",
  loadingQuestions: "\uBB38\uC81C\uB97C \uC900\uBE44\uD558\uB294 \uC911\uC785\uB2C8\uB2E4...",
  reloadWords: "\uB2E8\uC5B4 \uB2E4\uC2DC \uBD88\uB7EC\uC624\uAE30",
  reloadingWords: "\uB2E8\uC5B4 \uB2E4\uC2DC \uBD88\uB7EC\uC624\uB294 \uC911...",
  moveHome: "\uD648\uC73C\uB85C \uC774\uB3D9",
  missingLanguage:
    "\uC120\uD0DD\uD55C \uC5B8\uC5B4 \uC815\uBCF4\uAC00 \uC5C6\uC5B4 \uD648\uC5D0\uC11C \uB2E4\uC2DC \uC2DC\uC791\uD574 \uC8FC\uC138\uC694.",
  progress: "\uC9C4\uD589\uB3C4",
  sessionProgressLabel: "\uC138\uC158 \uC9C4\uD589",
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
  setupTitle: "\uC124\uC815",
  partOfSpeechTitle: "\uD488\uC0AC",
  difficultyTitle: "\uB09C\uC774\uB3C4",
  quizModeTitle: "\uCD9C\uC81C \uBC29\uC2DD",
  setupSummary: "\uC870\uD569",
  setupReset: "\uCD08\uAE30\uD654",
  availableQuestions: "\uC9C4\uC785 \uAC00\uB2A5 \uBB38\uC81C",
  availableWords: "\uD544\uD130 \uC77C\uCE58 \uBB38\uD56D",
  noFilteredWords:
    "\uC120\uD0DD\uD55C \uC870\uD569\uC5D0 \uB9DE\uB294 \uBB38\uC81C\uAC00 \uC5C6\uC5B4 \uC870\uAC74\uC744 \uBC14\uAFD4 \uC8FC\uC138\uC694.",
  noReviewWords:
    "\uBCF5\uC2B5\uD560 \uBB38\uC81C\uAC00 \uC544\uC9C1 \uC5C6\uC2B5\uB2C8\uB2E4. \uBA3C\uC800 \uAE30\uBCF8 \uD50C\uB808\uC774\uC5D0\uC11C \uD2C0\uB9B0 \uBB38\uC81C\uB97C \uB9CC\uB4E4\uC5B4 \uC8FC\uC138\uC694.",
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
  comingSoon: "\uC900\uBE44 \uC911",
  noAudioData: "\uB370\uC774\uD130 \uC5C6\uC74C",
  audioPromptTitle: "\uC74C\uC131 \uBB38\uC81C",
  audioPromptHint: "\uC74C\uC131\uC744 \uB4E3\uACE0 \uB73B\uC744 \uACE0\uB974\uC138\uC694.",
  replayAudio: "\uB2E4\uC2DC \uB4E3\uAE30",
  feedbackDeckTitle: "\uD310\uC815 \uCF58\uC194",
  setupEyebrow: "",
  startGame: "\uAC8C\uC784 \uC2DC\uC791",
  startPractice: "\uC5F0\uC2B5 \uC2DC\uC791",
  startReview: "\uBCF5\uC2B5 \uC2DC\uC791",
  stopPractice: "\uC5F0\uC2B5 \uC911\uB2E8",
  stopReview: "\uBCF5\uC2B5 \uC911\uB2E8",
  backHomeCompact: "\uD648",
  setupModeLabel: "\uBAA8\uB4DC",
  setupCountLabel: "\uBB38\uC81C",
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

const GAME_STYLE_OPTIONS: Array<{ value: GameStyle; label: string }> = [
  { value: "multiple_choice", label: TEXT.gameStyleMultipleChoice },
  { value: "self_check", label: TEXT.gameStyleSelfCheck },
];

function normalizeSessionConfig(config?: SessionConfig | null): SessionConfig {
  return {
    gameStyle: normalizeGameStyleFilter(config?.gameStyle),
    partOfSpeech: config?.partOfSpeech ?? DEFAULT_SESSION_CONFIG.partOfSpeech,
    difficulty: config?.difficulty ?? DEFAULT_SESSION_CONFIG.difficulty,
    quizMode: normalizeQuizModeFilter(config?.quizMode),
  };
}

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

function isFailedStandardRun(mode: PlayMode, heartsLeft: number, totalQuestions: number) {
  return mode === "standard" && heartsLeft <= 0 && totalQuestions < QUESTION_LIMIT;
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
  const nickname = useAuthStore((state) => state.nickname);
  const selectedLanguage = useLanguageStore((state) => state.selectedLanguage);
  const words = useLanguageStore((state) => state.words);
  const loadWords = useLanguageStore((state) => state.loadWords);
  const loadError = useLanguageStore((state) => state.loadError);
  const isLoading = useLanguageStore((state) => state.isLoading);
  const clearLoadError = useLanguageStore((state) => state.clearLoadError);
  const incomingState = (location.state as { sessionConfig?: SessionConfig; autoStart?: boolean } | null) ?? null;
  const incomingSessionConfig = incomingState?.sessionConfig;
  const incomingAutoStart = incomingState?.autoStart === true;

  const [sessionConfig, setSessionConfig] = useState<SessionConfig>(
    normalizeSessionConfig(incomingSessionConfig ?? DEFAULT_SESSION_CONFIG),
  );
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
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [answerSummary, setAnswerSummary] = useState<AnswerSummary | null>(null);
  const [sessionStartedAt, setSessionStartedAt] = useState(() => Date.now());
  const [questionStartedAt, setQuestionStartedAt] = useState(() => Date.now());
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isSessionStarted, setIsSessionStarted] = useState(false);
  const [questionVisualPhase, setQuestionVisualPhase] = useState<QuestionVisualPhase>("steady");
  const [queueSeed, setQueueSeed] = useState(() => Date.now());
  const answerLockRef = useRef(false);
  const questionPhaseTimeoutRef = useRef<number | null>(null);
  const answerTimeoutRef = useRef<number | null>(null);
  const answerTickerRef = useRef<number | null>(null);
  const autoStartConsumedRef = useRef(false);
  const sessionIdRef = useRef(`session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
  const latestStateRef = useRef({
    isSessionStarted: false,
    isSaving: false,
    currentIndex: 0,
    score: 0,
    heartsLeft: MAX_HEARTS,
    answerCount: 0,
    mode,
    selectedLanguage: selectedLanguage ?? null,
    playerId: playerId ?? null,
    sessionConfig: normalizeSessionConfig(incomingSessionConfig ?? DEFAULT_SESSION_CONFIG),
  });

  const isPracticeMode = mode === "practice";
  const isReviewMode = mode === "review";
  const isNonStandardMode = isPracticeMode || isReviewMode;
  const isSelfCheckMode = sessionConfig.gameStyle === "self_check";
  const isUntimedMode = isNonStandardMode || isSelfCheckMode;
  const isAudioQuizMode = !isSelfCheckMode && sessionConfig.quizMode === "audio_to_meaning";
  const supportedQuizModes = useMemo(
    () => getSupportedQuizModes(selectedLanguage, sessionConfig.gameStyle),
    [selectedLanguage, sessionConfig.gameStyle],
  );
  const quizModeOptions = useMemo(
    () =>
      supportedQuizModes.map((value) => ({
        value,
        label: getQuizModeLabel(value, selectedLanguage),
      })),
    [selectedLanguage, supportedQuizModes],
  );
  const modeTitle = isReviewMode ? TEXT.reviewMode : isPracticeMode ? TEXT.practiceMode : TEXT.standardMode;
  const reviewSnapshot = useMemo(() => {
    if (!playerId || !selectedLanguage) {
      return null;
    }

    return readReviewSnapshot(playerId, selectedLanguage);
  }, [playerId, selectedLanguage]);

  useEffect(() => {
    if (incomingSessionConfig) {
      setSessionConfig(normalizeSessionConfig(incomingSessionConfig));
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
      setIsAnswerRevealed(false);
      setAnswerSummary(null);
      setSessionStartedAt(Date.now());
      setQuestionStartedAt(Date.now());
      setIsSessionStarted(false);
      setQuestionVisualPhase("steady");
    }
  }, [incomingSessionConfig]);

  useEffect(() => {
    autoStartConsumedRef.current = false;
  }, [incomingAutoStart, incomingSessionConfig]);

  useEffect(() => {
    latestStateRef.current = {
      isSessionStarted,
      isSaving,
      currentIndex,
      score,
      heartsLeft,
      answerCount: answerLog.length,
      mode,
      selectedLanguage: selectedLanguage ?? null,
      playerId: playerId ?? null,
      sessionConfig,
    };
  }, [
    answerLog.length,
    currentIndex,
    heartsLeft,
    isSaving,
    isSessionStarted,
    mode,
    playerId,
    score,
    selectedLanguage,
    sessionConfig,
  ]);

  useEffect(() => {
    if (supportedQuizModes.includes(sessionConfig.quizMode)) {
      return;
    }

    setSessionConfig((previous) => ({
      ...previous,
      quizMode: supportedQuizModes[0] ?? DEFAULT_SESSION_CONFIG.quizMode,
    }));
  }, [sessionConfig.quizMode, supportedQuizModes]);

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

  const reviewWordIds = useMemo(
    () =>
      new Set(
        (reviewSnapshot?.reviewState ?? [])
          .filter((item) => (item.masteryCount ?? 0) < 5)
          .map((item) => item.wordId),
      ),
    [reviewSnapshot?.reviewState],
  );
  const sourceWords = useMemo(() => {
    if (!isReviewMode) {
      return words;
    }

    return words.filter((word) => reviewWordIds.has(word.id));
  }, [isReviewMode, reviewWordIds, words]);
  const filteredWords = useMemo(
    () => filterWordsBySessionConfig(sourceWords, sessionConfig),
    [sessionConfig, sourceWords],
  );
  const configuredWords = useMemo(
    () => buildPlayQueue(filteredWords, sessionConfig, mode, reviewSnapshot?.reviewState, queueSeed),
    [filteredWords, mode, queueSeed, reviewSnapshot?.reviewState, sessionConfig],
  );
  const availableQuizModes = useMemo(
    () =>
      getAvailableQuizModes(sourceWords, {
        gameStyle: sessionConfig.gameStyle,
        partOfSpeech: sessionConfig.partOfSpeech,
        difficulty: sessionConfig.difficulty,
      }),
    [sessionConfig.difficulty, sessionConfig.gameStyle, sessionConfig.partOfSpeech, sourceWords],
  );
  const quizModeCounts = useMemo(
    () =>
      getQuizModeCounts(sourceWords, {
        gameStyle: sessionConfig.gameStyle,
        partOfSpeech: sessionConfig.partOfSpeech,
        difficulty: sessionConfig.difficulty,
      }),
    [sessionConfig.difficulty, sessionConfig.gameStyle, sessionConfig.partOfSpeech, sourceWords],
  );
  const availablePartOfSpeechFilters = useMemo(
    () =>
      getAvailablePartOfSpeechFilters(sourceWords, {
        difficulty: sessionConfig.difficulty,
        gameStyle: sessionConfig.gameStyle,
        quizMode: sessionConfig.quizMode,
      }),
    [sessionConfig.difficulty, sessionConfig.gameStyle, sessionConfig.quizMode, sourceWords],
  );
  const availableDifficultyFilters = useMemo(
    () =>
      getAvailableDifficultyFilters(sourceWords, {
        gameStyle: sessionConfig.gameStyle,
        partOfSpeech: sessionConfig.partOfSpeech,
        quizMode: sessionConfig.quizMode,
      }),
    [sessionConfig.gameStyle, sessionConfig.partOfSpeech, sessionConfig.quizMode, sourceWords],
  );
  const sessionConfigLabels = useMemo(
    () => ({
      ...getSessionConfigLabels(sessionConfig, selectedLanguage),
      quizMode: getQuizModeLabel(sessionConfig.quizMode, selectedLanguage),
    }),
    [selectedLanguage, sessionConfig],
  );
  const currentWord = configuredWords[currentIndex];
  const currentQuestion = useMemo<SelfCheckQuestionRound | ReturnType<typeof buildQuestionRound> | null>(() => {
    if (!currentWord) {
      return null;
    }

    return isSelfCheckMode
      ? buildSelfCheckRound(currentWord, sourceWords, sessionConfig.quizMode)
      : buildQuestionRound(currentWord, configuredWords);
  }, [configuredWords, currentWord, isSelfCheckMode, sessionConfig.quizMode, sourceWords]);

  useEffect(() => {
    if (currentWord) {
      if (questionPhaseTimeoutRef.current) {
        window.clearTimeout(questionPhaseTimeoutRef.current);
      }
      if (answerTimeoutRef.current) {
        window.clearTimeout(answerTimeoutRef.current);
      }
      if (answerTickerRef.current) {
        window.clearInterval(answerTickerRef.current);
      }
      answerLockRef.current = false;
      setIsAnswerLocked(false);
      setIsFinishingSession(false);
      setAnswerFeedback(null);
      setSelectedChoice(null);
      setIsAnswerRevealed(false);
      setAnswerSummary(null);
      setQuestionStartedAt(Date.now());
      setElapsedMs(0);
      setQuestionVisualPhase("enter");
      questionPhaseTimeoutRef.current = window.setTimeout(() => {
        setQuestionVisualPhase("steady");
        questionPhaseTimeoutRef.current = null;
      }, QUESTION_ENTER_DELAY_MS);
    }
  }, [currentWord]);

  useEffect(() => {
    return () => {
      stopSpeech();
      if (questionPhaseTimeoutRef.current) {
        window.clearTimeout(questionPhaseTimeoutRef.current);
      }
      if (answerTimeoutRef.current) {
        window.clearTimeout(answerTimeoutRef.current);
      }
      if (answerTickerRef.current) {
        window.clearInterval(answerTickerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isAudioQuizMode || !isSessionStarted || !currentQuestion || isAnswerLocked || isSaving) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      speakPrompt(currentQuestion.prompt, selectedLanguage === "en" ? "en" : "ja");
    }, 120);

    return () => {
      window.clearTimeout(timeoutId);
      stopSpeech();
    };
  }, [currentQuestion, isAnswerLocked, isAudioQuizMode, isSaving, isSessionStarted]);

  useEffect(() => {
    if (isUntimedMode || !isSessionStarted || !currentWord || !currentQuestion || isSaving || isAnswerLocked) {
      return;
    }

    const startedAt = Date.now();
    setQuestionStartedAt(startedAt);
    setElapsedMs(0);

    answerTickerRef.current = window.setInterval(() => {
      setElapsedMs(Math.min(Date.now() - startedAt, TIME_LIMIT_MS));
    }, 80);

    answerTimeoutRef.current = window.setTimeout(() => {
      setElapsedMs(TIME_LIMIT_MS);
      if (!answerLockRef.current) {
        void submitAnswer(null, true);
      }
    }, TIME_LIMIT_MS);

    return () => {
      if (answerTickerRef.current) {
        window.clearInterval(answerTickerRef.current);
        answerTickerRef.current = null;
      }
      if (answerTimeoutRef.current) {
        window.clearTimeout(answerTimeoutRef.current);
        answerTimeoutRef.current = null;
      }
    };
  }, [currentQuestion, currentWord, isAnswerLocked, isSaving, isSessionStarted, isUntimedMode]);

  useEffect(() => {
    if (!playerId || !selectedLanguage) {
      return;
    }

    writeSessionConfigSnapshot(playerId, selectedLanguage, sessionConfig);
  }, [playerId, selectedLanguage, sessionConfig]);

  useEffect(() => {
    if (!isSessionStarted) {
      return;
    }

    if (!playerId || !selectedLanguage) {
      appLogger.warning("play", "세션 중 필수 상태가 사라짐", {
        mode,
        currentIndex,
        playerId,
        selectedLanguage,
        path: location.pathname,
      });
    }
  }, [currentIndex, isSessionStarted, location.pathname, mode, playerId, selectedLanguage]);

  useEffect(() => {
    if (availablePartOfSpeechFilters.length === 0) {
      return;
    }

    if (!availablePartOfSpeechFilters.includes(sessionConfig.partOfSpeech)) {
      setSessionConfig((previous) => ({
        ...previous,
        partOfSpeech: availablePartOfSpeechFilters[0],
      }));
      setQueueSeed(Date.now());
      setIsSessionStarted(false);
    }
  }, [availablePartOfSpeechFilters, sessionConfig.partOfSpeech]);

  useEffect(() => {
    if (availableDifficultyFilters.length === 0) {
      return;
    }

    if (!availableDifficultyFilters.includes(sessionConfig.difficulty)) {
      setSessionConfig((previous) => ({
        ...previous,
        difficulty: availableDifficultyFilters[0],
      }));
      setQueueSeed(Date.now());
      setIsSessionStarted(false);
    }
  }, [availableDifficultyFilters, sessionConfig.difficulty]);

  useEffect(() => {
    if (availableQuizModes.length === 0) {
      return;
    }

    if (!availableQuizModes.includes(sessionConfig.quizMode)) {
      setSessionConfig((previous) => ({
        ...previous,
        quizMode: availableQuizModes[0],
      }));
      setQueueSeed(Date.now());
      setIsSessionStarted(false);
    }
  }, [availableQuizModes, sessionConfig.quizMode]);

  function resetSessionProgress() {
    const nextSeed = Date.now();
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
      setIsAnswerRevealed(false);
      setAnswerSummary(null);
    setSessionStartedAt(Date.now());
    setQuestionStartedAt(Date.now());
    setElapsedMs(0);
    setIsSessionStarted(false);
    setQuestionVisualPhase("steady");
    setQueueSeed(nextSeed);
  }

  function updateSessionConfig(partial: Partial<SessionConfig>) {
    setSessionConfig((previous) => ({ ...previous, ...partial }));
    resetSessionProgress();
  }

  function startSession() {
    sessionIdRef.current = `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const nextSeed = Date.now();
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
    setIsAnswerRevealed(false);
    setAnswerSummary(null);
    setSessionStartedAt(Date.now());
    setQuestionStartedAt(Date.now());
    setElapsedMs(0);
    setIsSessionStarted(true);
    setQuestionVisualPhase("steady");
    setQueueSeed(nextSeed);
    appLogger.info("play", "세션 시작", {
      sessionId: sessionIdRef.current,
      mode,
      playerId,
      languageCode: selectedLanguage,
      sessionConfig,
      queueSize: configuredWords.length,
    });
  }

  useEffect(() => {
    if (!incomingAutoStart || autoStartConsumedRef.current || isSessionStarted || configuredWords.length === 0) {
      return;
    }

    autoStartConsumedRef.current = true;
    startSession();
  }, [configuredWords.length, incomingAutoStart, isSessionStarted]);

  const progressLabel = useMemo(
    () => `${Math.min(currentIndex + 1, configuredWords.length)} / ${configuredWords.length}`,
    [configuredWords.length, currentIndex],
  );
  const remainingCount = configuredWords.length - currentIndex - 1;
  const progressDotCount = 20;
  const filledProgressCount = Math.min(currentIndex + 1, progressDotCount);
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
  const responseTimeText = answerSummary ? formatResponseTime(answerSummary.responseTimeMs) : formatResponseTime(elapsedMs);
  const scoreSummaryLabel = String(score);
  const selfCheckCorrectCount = answerLog.filter((answer) => answer.correct).length;
  const focusTone = getStatusTone(answerFeedback, isFinishingSession);
  const pacePercent = Math.min(elapsedMs / TIME_LIMIT_MS, 1) * 100;
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
      appLogger.warning("play", "세션 종료 중 필수 상태 부족으로 홈 이동", {
        mode,
        currentIndex,
        playerId,
        selectedLanguage,
      });
      navigate("/home");
      return;
    }

    setIsSaving(true);
    appLogger.info("play", TEXT.savingStart, {
      sessionId: sessionIdRef.current,
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
      nickname: nickname ?? playerId,
      languageCode: selectedLanguage,
      modeType: isReviewMode ? "practice" : mode,
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
    const incorrectAnswers = buildIncorrectAnswerSummaries(nextAnswerLog, configuredWords);

    const mergedReviewState = mergeReviewState(reviewSnapshot?.reviewState ?? [], nextAnswerLog, mode);
    writeReviewSnapshot(playerId, selectedLanguage, mergedReviewState);
    const shouldSkipSessionSave = isSelfCheckMode;
    const shouldSkipLeaderboard = isFailedStandardRun(mode, payload.heartsLeft, payload.totalQuestions);

    if (!isNonStandardMode && !shouldSkipSessionSave) {
      const previousStats = readDailyStatsSnapshot(playerId, selectedLanguage);
      const nextSessionCount = (previousStats?.sessionCount ?? 0) + 1;
      const nextTotalScore = (previousStats?.totalScore ?? 0) + payload.score;
      const nextTotalQuestions = (previousStats?.totalQuestions ?? 0) + payload.totalQuestions;
      const nextCorrectAnswers = (previousStats?.correctAnswers ?? 0) + payload.correctAnswers;

      writeDailyStatsSnapshot(playerId, selectedLanguage, {
        sessionCount: nextSessionCount,
        practiceSessionCount: previousStats?.practiceSessionCount ?? 0,
        totalScore: nextTotalScore,
        bestScore: Math.max(previousStats?.bestScore ?? 0, payload.score),
        totalQuestions: nextTotalQuestions,
        correctAnswers: nextCorrectAnswers,
        averageAccuracy: calculateAverageAccuracy(nextCorrectAnswers, nextTotalQuestions),
        lastPlayedAt: new Date().toISOString(),
      });

      if (!shouldSkipLeaderboard) {
        const leaderboard = readLeaderboard(playerId, selectedLanguage);
        const nextLeaderboard = [
          ...leaderboard,
          {
            playedAt: new Date().toISOString(),
            totalTimeSec: payload.totalTimeSec,
            score: payload.score,
            quizMode: sessionConfig.quizMode,
            playerId,
            nickname: nickname ?? playerId,
          },
        ]
          .sort((left, right) => {
            if (right.score !== left.score) {
              return right.score - left.score;
            }

            return left.totalTimeSec - right.totalTimeSec;
          })
          .slice(0, 10);

        writeLeaderboard(playerId, selectedLanguage, nextLeaderboard);

        const globalLeaderboard = readGlobalLeaderboard(selectedLanguage);
        const nextGlobalLeaderboard = [
          ...globalLeaderboard,
          {
            playedAt: new Date().toISOString(),
            totalTimeSec: payload.totalTimeSec,
            score: payload.score,
            quizMode: sessionConfig.quizMode,
            playerId,
            nickname: nickname ?? playerId,
          },
        ].sort((left, right) => {
          if (right.score !== left.score) {
            return right.score - left.score;
          }

          return left.totalTimeSec - right.totalTimeSec;
        });

        writeGlobalLeaderboard(selectedLanguage, nextGlobalLeaderboard);
      }
    }

    const resultState: SessionResultState = {
      payload,
      saveStatus: "saving",
      sessionConfig,
      displayMode: mode,
      incorrectAnswers,
    };

    navigate("/result", { state: resultState });

    if (shouldSkipSessionSave) {
      appLogger.info("play", "문답형 세션 종료", {
        sessionId: sessionIdRef.current,
        playerId,
        languageCode: selectedLanguage,
        answers: nextAnswerLog.length,
        incorrectAnswers: incorrectAnswers.length,
        sessionConfig,
      });
      navigate("/result", {
        replace: true,
        state: {
          payload,
          saveStatus: "saved",
          sessionConfig,
          displayMode: mode,
          incorrectAnswers,
        } satisfies SessionResultState,
      });
      return;
    }

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
          displayMode: mode,
          incorrectAnswers,
        } satisfies SessionResultState,
      });
    } catch (error) {
      const rawMessage = error instanceof Error ? error.message : TEXT.savingFail;
      const message = /failed to fetch|load failed|networkerror/i.test(rawMessage)
        ? "저장 서버에 연결하지 못했습니다. 네트워크 또는 GAS 배포 상태를 확인해 주세요."
        : rawMessage;
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
          displayMode: mode,
          incorrectAnswers,
        } satisfies SessionResultState,
      });
    }
  }

  async function submitAnswer(choice: string | null, isTimeout = false) {
    if (!currentWord || !currentQuestion) {
      return;
    }

    if (answerLockRef.current) {
      return;
    }

    answerLockRef.current = true;
    stopSpeech();
    setIsAnswerLocked(true);
    if (answerTimeoutRef.current) {
      window.clearTimeout(answerTimeoutRef.current);
      answerTimeoutRef.current = null;
    }
    if (answerTickerRef.current) {
      window.clearInterval(answerTickerRef.current);
      answerTickerRef.current = null;
    }
    setSelectedChoice(choice);
    setQuestionVisualPhase("impact");

    const correct = choice === currentQuestion.answer;
    playAnswerTone(correct);
    setAnswerFeedback(correct ? "correct" : "incorrect");
    const nextCombo = correct ? combo + 1 : 0;
    const earnedScore = correct ? 10 + nextCombo * 2 : 0;
    const nextScore = score + earnedScore;
    const nextHeartsLeft = isUntimedMode ? MAX_HEARTS : correct ? heartsLeft : Math.max(0, heartsLeft - 1);
    const responseTimeMs = isUntimedMode
      ? Math.max(0, Date.now() - questionStartedAt)
      : isTimeout
        ? TIME_LIMIT_MS
        : Math.max(0, Date.now() - questionStartedAt);

    appLogger.info("play", TEXT.answerHandled, {
      sessionId: sessionIdRef.current,
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
      selectedAnswer: choice ?? "__timeout__",
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
    const noHeartsLeft = !isUntimedMode && nextHeartsLeft <= 0;

    if (reachedLastQuestion || noHeartsLeft) {
      setIsFinishingSession(true);
      await finishGame(nextAnswerLog, nextScore, nextHeartsLeft);
      return;
    }

    await wait(NEXT_QUESTION_DELAY_MS);
    setCurrentIndex((previous) => previous + 1);
  }

  async function handleAnswer(choice: string) {
    await submitAnswer(choice, false);
  }

  async function handleSelfCheckAnswer(correct: boolean) {
    if (!currentWord || !currentQuestion || answerLockRef.current) {
      return;
    }

    answerLockRef.current = true;
    stopSpeech();
    setIsAnswerLocked(true);
    setSelectedChoice(correct ? "__self_check_o__" : "__self_check_x__");
    setQuestionVisualPhase("impact");
    playAnswerTone(correct);
    setAnswerFeedback(correct ? "correct" : "incorrect");

    const responseTimeMs = Math.max(0, Date.now() - questionStartedAt);
    const answer: PendingAnswer = {
      wordId: currentWord.id,
      questionType: currentQuestion.questionType,
      shownPrompt: currentQuestion.prompt,
      difficultySnapshot: currentWord.difficulty,
      responseTimeMs,
      selectedAnswer: correct ? "__self_check_o__" : "__self_check_x__",
      correct,
      comboAfterAnswer: 0,
      earnedScore: 0,
    };
    const nextAnswerLog = [...answerLog, answer];

    setCombo(0);
    setScore(0);
    setHeartsLeft(MAX_HEARTS);
    setAnswerLog(nextAnswerLog);
    setAnswerSummary(null);

    const reachedLastQuestion = currentIndex >= configuredWords.length - 1;

    if (reachedLastQuestion) {
      setIsFinishingSession(true);
      await finishGame(nextAnswerLog, 0, MAX_HEARTS);
      return;
    }

    await wait(NEXT_QUESTION_DELAY_MS);
    setCurrentIndex((previous) => previous + 1);
  }

  useEffect(() => {
    function logPageExit(trigger: "beforeunload" | "pagehide") {
      const state = latestStateRef.current;

      if (!state.isSessionStarted || state.isSaving) {
        return;
      }

      appLogger.warning("play", "브라우저 이탈 감지", {
        trigger,
        sessionId: sessionIdRef.current,
        mode: state.mode,
        playerId: state.playerId,
        languageCode: state.selectedLanguage,
        currentIndex: state.currentIndex,
        answerCount: state.answerCount,
        score: state.score,
        heartsLeft: state.heartsLeft,
        sessionConfig: state.sessionConfig,
      });
    }

    function handleBeforeUnload() {
      logPageExit("beforeunload");
    }

    function handlePageHide() {
      logPageExit("pagehide");
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, []);

  useEffect(() => {
    return () => {
      const state = latestStateRef.current;

      if (!state.isSessionStarted || state.isSaving) {
        return;
      }

      appLogger.warning("play", "플레이 화면이 세션 중 종료됨", {
        sessionId: sessionIdRef.current,
        mode: state.mode,
        playerId: state.playerId,
        languageCode: state.selectedLanguage,
        currentIndex: state.currentIndex,
        answerCount: state.answerCount,
        score: state.score,
        heartsLeft: state.heartsLeft,
        sessionConfig: state.sessionConfig,
      });
    };
  }, []);

  async function handleStopPractice() {
    if (!isNonStandardMode) {
      return;
    }

    setIsFinishingSession(true);
    await finishGame(answerLog, score, MAX_HEARTS);
  }

  if (sourceWords.length > 0 && configuredWords.length === 0) {
    return (
      <section className="space-y-4 pb-4">
          <SessionSetupPanel
            sessionConfig={sessionConfig}
            sessionConfigLabels={sessionConfigLabels}
            quizModeOptions={quizModeOptions}
            availableQuizModes={availableQuizModes}
            quizModeCounts={quizModeCounts}
            availablePartOfSpeechFilters={availablePartOfSpeechFilters}
            availableDifficultyFilters={availableDifficultyFilters}
            configuredWordsCount={configuredWords.length}
            totalWordsCount={filteredWords.length}
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
    const emptyStateMessage = loadError
      ?? (!selectedLanguage
        ? TEXT.missingLanguage
        : isReviewMode && sourceWords.length === 0
          ? TEXT.noReviewWords
          : TEXT.loadingQuestions);
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
          startLabel={isReviewMode ? TEXT.startReview : isPracticeMode ? TEXT.startPractice : TEXT.startGame}
          sessionConfig={sessionConfig}
          sessionConfigLabels={sessionConfigLabels}
          gameStyleOptions={GAME_STYLE_OPTIONS}
          quizModeOptions={quizModeOptions}
          availableQuizModes={availableQuizModes}
          quizModeCounts={quizModeCounts}
          availablePartOfSpeechFilters={availablePartOfSpeechFilters}
          availableDifficultyFilters={availableDifficultyFilters}
          configuredWordsCount={configuredWords.length}
          totalWordsCount={filteredWords.length}
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
      className={`space-y-2.5 overflow-hidden rounded-[1.55rem] border border-white/10 bg-gradient-to-br ${focusTone.shell} p-3 pb-3.5 shadow-[0_20px_96px_rgba(0,0,0,0.32)] sm:p-3.5 lg:p-4`}
    >
      <div className="space-y-2">
        <div className="overflow-hidden rounded-[1.35rem] border border-white/10 bg-stone-950/65">
          <div className="space-y-1.5 px-3 py-2 sm:px-3.5">
            {remainingCount === 0 && isFinishingSession ? (
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
                <span className="rounded-full border border-amber-200/20 bg-amber-300/12 px-3 py-1 text-amber-100">
                  {TEXT.movingResult}
                </span>
              </div>
            ) : null}
            <div className={`grid gap-1.5 ${isUntimedMode ? "grid-cols-1" : "grid-cols-2"}`}>
              {!isUntimedMode ? <HeartHudCard current={heartsLeft} /> : null}
              {isSelfCheckMode ? (
                <HudStatCard
                  label={TEXT.selfCheckCorrectCount}
                  value={`${selfCheckCorrectCount} / ${answerLog.length}`}
                  accentClassName="text-emerald-100"
                />
              ) : (
                <HudStatCard label={TEXT.scoreLabel} value={scoreSummaryLabel} accentClassName="text-sky-100" />
              )}
            </div>
            {!isUntimedMode ? <PaceMeter elapsedMs={elapsedMs} pacePercent={pacePercent} /> : null}
            <div className={`rounded-[0.8rem] border px-2.5 py-1.25 transition duration-300 ${focusTone.panel}`} aria-live="polite">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <span className="rounded-full border border-white/10 bg-gradient-to-r from-amber-300/12 via-white/8 to-sky-300/12 px-3 py-1 text-[11px] font-semibold text-stone-100 sm:text-[12px]">
                    {modeTitle} / {sessionConfigLabels.gameStyle} / {sessionConfigLabels.quizMode}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {!isNonStandardMode ? (
            <div className="px-3 pb-2.5 sm:px-3.5">
              <div
                className="grid gap-1"
                role="progressbar"
                aria-label={TEXT.sessionProgressLabel}
                aria-valuemin={1}
                aria-valuemax={progressDotCount}
                aria-valuenow={filledProgressCount}
                aria-valuetext={progressLabel}
                style={{ gridTemplateColumns: `repeat(${progressDotCount}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: progressDotCount }).map((_, index) => {
                  const isFilled = index < filledProgressCount;
                  const isActive = index === Math.max(0, Math.min(progressDotCount - 1, filledProgressCount - 1));

                  return (
                    <span
                      key={`progress-${index}`}
                      className={`h-2 w-2 rounded-full border transition duration-300 ${
                        isFilled
                          ? `${focusTone.progress} border-white/10 shadow-[0_0_16px_rgba(251,191,36,0.2)]`
                          : "border-white/14 bg-transparent"
                      } ${isActive ? "scale-110 ring-2 ring-white/12" : ""}`}
                    />
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        <div className="pointer-events-none flex items-center justify-center">
          <div className="flex w-full max-w-[8rem] items-center gap-1.5">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/16 to-white/35" />
            <span className={`h-2.5 w-2.5 rounded-full border border-white/20 ${focusTone.panel}`} />
            <span className="h-px flex-1 bg-gradient-to-l from-transparent via-white/16 to-white/35" />
          </div>
        </div>

        <div
          className={`overflow-hidden rounded-[1.55rem] border bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.14),_rgba(255,255,255,0.03)_35%,_rgba(12,10,9,0.92)_78%)] shadow-[0_18px_64px_rgba(0,0,0,0.28)] transition duration-300 ${questionCardStateClassName} ${
            answerFeedback === "correct"
              ? "border-emerald-300/30 shadow-[0_24px_88px_rgba(16,185,129,0.18)]"
              : answerFeedback === "incorrect"
                ? "border-rose-300/30 shadow-[0_24px_88px_rgba(244,63,94,0.16)]"
                : "border-white/10"
          }`}
        >
          <div className={`h-1 w-full ${focusTone.progress}`} />
          <div className="border-b border-white/10 bg-gradient-to-r from-amber-200/10 via-white/6 to-transparent px-3 py-1.75 sm:px-3.5">
            {isAudioQuizMode ? (
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                    {TEXT.audioPromptTitle}
                  </p>
                  <h2 className="text-[1.12rem] font-black leading-tight tracking-[-0.045em] text-white drop-shadow-[0_6px_24px_rgba(0,0,0,0.28)] sm:text-[1.35rem]">
                    {TEXT.audioPromptHint}
                  </h2>
                </div>
                <button
                  className="min-h-11 shrink-0 rounded-2xl border border-amber-200/20 bg-amber-200/10 px-4 py-2 text-sm font-semibold text-amber-50 transition hover:bg-amber-200/16"
                  type="button"
                  onClick={() => speakPrompt(currentQuestion.prompt, selectedLanguage === "en" ? "en" : "ja")}
                  disabled={isSaving}
                >
                  {TEXT.replayAudio}
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                  {TEXT.difficultyTitle} {sessionConfigLabels.difficulty}
                </p>
                  <h2
                    className={`font-black leading-tight tracking-[-0.045em] text-white drop-shadow-[0_6px_24px_rgba(0,0,0,0.28)] ${
                      isSelfCheckMode ? "text-[2.3rem] sm:text-[3rem]" : "text-[1.28rem] sm:text-[1.75rem]"
                    }`}
                  >
                    {currentQuestion.prompt}
                  </h2>
                </div>
              )}
            </div>

          <div className="px-3 py-1.75 sm:px-3.5 sm:py-2">
            {isSelfCheckMode ? (
              <div className="space-y-3">
                <p className="text-sm leading-6 text-stone-300">{TEXT.selfCheckInstruction}</p>
                <div className="space-y-3">
                  <div className="min-h-[9.75rem]">
                    {isAnswerRevealed ? (
                      <div className="rounded-[1.35rem] border border-emerald-200/20 bg-emerald-300/10 px-4 py-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-100/80">
                          {TEXT.selfCheckAnswerTitle}
                        </p>
                        <p className="mt-2 text-[2rem] font-black leading-tight text-emerald-50 sm:text-[2.35rem]">
                          {currentQuestion.answer}
                        </p>
                        {"secondaryAnswer" in currentQuestion && currentQuestion.secondaryAnswer ? (
                          <p className="mt-2 text-[1.08rem] font-semibold leading-tight text-emerald-100/82 sm:text-[1.28rem]">
                            {currentQuestion.secondaryAnswer}
                          </p>
                        ) : null}
                      </div>
                    ) : (
                      <div
                        className="min-h-[9.75rem] rounded-[1.35rem] border border-dashed border-white/10 bg-white/5"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <div className="min-h-[4.5rem]">
                    {!isAnswerRevealed ? (
                      <button
                        className="flex min-h-16 w-full items-center justify-center rounded-[1.4rem] border border-amber-200/20 bg-amber-300/12 px-4 py-4 text-[1.05rem] font-black text-amber-50 shadow-[0_18px_40px_rgba(251,191,36,0.12)] transition hover:bg-amber-300/18"
                        type="button"
                        onClick={() => setIsAnswerRevealed(true)}
                        disabled={isSaving}
                      >
                        {TEXT.revealAnswer}
                      </button>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          className="flex min-h-16 items-center justify-center rounded-[1.35rem] border border-emerald-200/25 bg-emerald-300/14 px-4 py-4 text-[1.1rem] font-black text-emerald-50 transition hover:bg-emerald-300/20"
                          type="button"
                          onClick={() => void handleSelfCheckAnswer(true)}
                          disabled={isSaving || isAnswerLocked}
                        >
                          {TEXT.selfCheckCorrect} / {TEXT.selfCheckCorrectLabel}
                        </button>
                        <button
                          className="flex min-h-16 items-center justify-center rounded-[1.35rem] border border-rose-200/25 bg-rose-300/14 px-4 py-4 text-[1.1rem] font-black text-rose-50 transition hover:bg-rose-300/20"
                          type="button"
                          onClick={() => void handleSelfCheckAnswer(false)}
                          disabled={isSaving || isAnswerLocked}
                        >
                          {TEXT.selfCheckIncorrect} / {TEXT.selfCheckIncorrectLabel}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className={`grid gap-1.5 transition duration-300 ${choicesStateClassName}`}>
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
            )}
          </div>
        </div>

        {isNonStandardMode ? (
          <button
            className="w-full rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-sm font-semibold text-stone-100 transition hover:bg-white/10"
            type="button"
            onClick={() => void handleStopPractice()}
          >
            {isReviewMode ? TEXT.stopReview : TEXT.stopPractice}
          </button>
        ) : null}

      </div>
    </section>
  );
}

function getSelfCheckSiblingWords(currentWord: WordItem, sourceWords: WordItem[]) {
  return sourceWords.filter(
    (word) => word.id === currentWord.id && String(word.meaning ?? "").trim() === String(currentWord.meaning ?? "").trim(),
  );
}

function getKanjiPrompt(words: WordItem[]) {
  return (
    words.find(
      (word) =>
        word.questionType === "word_to_meaning" &&
        /[\u3400-\u4DBF\u4E00-\u9FFF]/u.test(String(word.prompt ?? "").trim()),
    )?.prompt ?? null
  );
}

function getKanaPrompt(words: WordItem[]) {
  return (
    words.find(
      (word) =>
        word.questionType === "word_to_meaning" &&
        /[\u3040-\u30FF]/u.test(String(word.prompt ?? "").trim()) &&
        !/[\u3400-\u4DBF\u4E00-\u9FFF]/u.test(String(word.prompt ?? "").trim()),
    )?.prompt ?? null
  );
}

function getMeaningAnswer(words: WordItem[], currentWord: WordItem) {
  return (
    words.find((word) => word.questionType === "word_to_meaning")?.answer ??
    words.find((word) => String(word.meaning ?? "").trim())?.meaning ??
    currentWord.meaning ??
    currentWord.answer ??
    ""
  )
    .trim() || null;
}

function buildSelfCheckRound(currentWord: WordItem, sourceWords: WordItem[], quizMode: QuizModeFilter): SelfCheckQuestionRound {
  const siblingWords = getSelfCheckSiblingWords(currentWord, sourceWords);
  const kanjiPrompt = getKanjiPrompt(siblingWords);
  const kanaPrompt = getKanaPrompt(siblingWords);
  const meaningAnswer = getMeaningAnswer(siblingWords, currentWord);
  const meaningPrompt = String(currentWord.meaning ?? meaningAnswer ?? currentWord.prompt ?? "").trim() || currentWord.prompt;

  const baseRound = {
    questionType: currentWord.questionType,
    choices: [],
    instruction: TEXT.selfCheckInstruction,
    typeLabel: getQuizModeLabel(quizMode),
  } satisfies Pick<SelfCheckQuestionRound, "questionType" | "choices" | "instruction" | "typeLabel">;

  if (quizMode === "kanji_to_furigana") {
    return {
      ...baseRound,
      prompt: kanjiPrompt ?? currentWord.prompt,
      answer: kanaPrompt ?? String(currentWord.answer ?? "").trim(),
      secondaryAnswer: meaningAnswer,
    };
  }

  if (quizMode === "kanji_to_meaning") {
    return {
      ...baseRound,
      prompt: kanjiPrompt ?? currentWord.prompt,
      answer: meaningAnswer ?? String(currentWord.answer ?? "").trim(),
      secondaryAnswer: kanaPrompt,
    };
  }

  if (quizMode === "furigana_to_meaning") {
    return {
      ...baseRound,
      prompt: kanaPrompt ?? currentWord.prompt,
      answer: meaningAnswer ?? String(currentWord.answer ?? "").trim(),
      secondaryAnswer: kanjiPrompt,
    };
  }

  if (quizMode === "meaning_to_kanji") {
    return {
      ...baseRound,
      prompt: meaningPrompt,
      answer: kanjiPrompt ?? String(currentWord.answer ?? "").trim(),
      secondaryAnswer: kanaPrompt,
    };
  }

  if (quizMode === "meaning_to_furigana") {
    return {
      ...baseRound,
      prompt: meaningPrompt,
      answer: kanaPrompt ?? String(currentWord.answer ?? "").trim(),
      secondaryAnswer: kanjiPrompt,
    };
  }

  const questionRound = buildQuestionRound(currentWord, sourceWords);
  return { ...questionRound, ...baseRound, secondaryAnswer: null };
}

function buildIncorrectAnswerSummaries(
  answers: PendingAnswer[],
  configuredWords: WordItem[],
): IncorrectAnswerSummary[] {
  return answers
    .filter((answer) => !answer.correct)
    .map((answer) => {
      const matchedWord = findWordForAnswer(configuredWords, answer);

      return {
        shownPrompt: answer.shownPrompt,
        correctAnswer: matchedWord?.answer ?? "-",
      };
    });
}

function buildPlayQueue(words: WordItem[], sessionConfig: SessionConfig, mode: PlayMode, reviewState: ReviewStateRecord[] | undefined, seed: number) {
  const baseQueue = buildSessionWordQueue(words, sessionConfig, {
    mode,
    reviewState,
    seed,
  });

  if (mode === "practice" || mode === "review") {
    return baseQueue;
  }

  if (baseQueue.length <= QUESTION_LIMIT) {
    const toppedUp = [...baseQueue];

    if (baseQueue.length === 0) {
      return toppedUp;
    }

    let refillIndex = 0;
    while (toppedUp.length < QUESTION_LIMIT) {
      toppedUp.push(baseQueue[refillIndex % baseQueue.length]!);
      refillIndex += 1;
    }

    return toppedUp;
  }

  return baseQueue.slice(0, QUESTION_LIMIT);
}

function formatHeartValue(value: number) {
  return `${(value / 2).toFixed(value % 2 === 0 ? 0 : 1)}`;
}

type SessionSetupPanelProps = {
  sessionConfig: SessionConfig;
  sessionConfigLabels: ReturnType<typeof getSessionConfigLabels>;
  quizModeOptions: Array<{ value: QuizModeFilter; label: string }>;
  availableQuizModes: QuizModeFilter[];
  quizModeCounts: Record<QuizModeFilter, number>;
  availablePartOfSpeechFilters: PartOfSpeechFilter[];
  availableDifficultyFilters: DifficultyFilter[];
  configuredWordsCount: number;
  totalWordsCount: number;
  isDisabled: boolean;
  onReset: () => void;
  onUpdate: (partial: Partial<SessionConfig>) => void;
};

function SessionSetupPanel({
  sessionConfig,
  sessionConfigLabels,
  quizModeOptions,
  availableQuizModes,
  quizModeCounts,
  availablePartOfSpeechFilters,
  availableDifficultyFilters,
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
            disabledValues={PART_OF_SPEECH_OPTIONS.filter(
              (option) => !availablePartOfSpeechFilters.includes(option.value),
            ).map((option) => option.value)}
            onSelect={(value) => onUpdate({ partOfSpeech: value as PartOfSpeechFilter })}
          />
          <SetupOptionGroup
            title={TEXT.difficultyTitle}
            options={DIFFICULTY_OPTIONS}
            currentValue={sessionConfig.difficulty}
            isDisabled={isDisabled}
            disabledValues={DIFFICULTY_OPTIONS.filter(
              (option) => !availableDifficultyFilters.includes(option.value),
            ).map((option) => option.value)}
            onSelect={(value) => onUpdate({ difficulty: value as DifficultyFilter })}
          />
          <SetupOptionGroup
            title={TEXT.quizModeTitle}
            options={quizModeOptions}
            currentValue={sessionConfig.quizMode}
            isDisabled={isDisabled}
            badges={{
              audio_to_meaning: quizModeCounts.audio_to_meaning === 0 ? TEXT.noAudioData : undefined,
            }}
            disabledValues={quizModeOptions.filter((option) => !availableQuizModes.includes(option.value)).map(
              (option) => option.value,
            )}
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
  gameStyleOptions: Array<{ value: GameStyle; label: string }>;
  quizModeOptions: Array<{ value: QuizModeFilter; label: string }>;
  availableQuizModes: QuizModeFilter[];
  quizModeCounts: Record<QuizModeFilter, number>;
  availablePartOfSpeechFilters: PartOfSpeechFilter[];
  availableDifficultyFilters: DifficultyFilter[];
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
  gameStyleOptions,
  quizModeOptions,
  availableQuizModes,
  quizModeCounts,
  availablePartOfSpeechFilters,
  availableDifficultyFilters,
  configuredWordsCount,
  totalWordsCount,
  onReset,
  onStart,
  onMoveHome,
  onUpdate,
}: SessionStartScreenProps) {
  return (
    <section className="overflow-hidden rounded-[0.68rem] border border-white/10 bg-gradient-to-br from-[#5a5137] via-[#1f1d19] to-[#111213] p-px">
      <div className="rounded-[0.58rem] border border-white/10 bg-black/25 p-1">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            {TEXT.setupEyebrow ? (
              <p className="text-[7px] font-semibold uppercase tracking-[0.1em] text-amber-200/70">{TEXT.setupEyebrow}</p>
            ) : null}
            <h2 className="leading-none text-[1.18rem] font-black tracking-[-0.04em] text-white sm:text-[1.3rem]">{modeTitle}</h2>
          </div>
          <div className="flex flex-wrap gap-1">
            <button
              className="min-h-11 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-[14px] font-semibold text-stone-100 transition hover:bg-white/10"
              type="button"
              onClick={onReset}
            >
              {TEXT.setupReset}
            </button>
            <button
              className="min-h-11 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-[14px] font-semibold text-stone-100 transition hover:bg-white/10"
              type="button"
              onClick={onMoveHome}
            >
              {TEXT.backHomeCompact}
            </button>
          </div>
        </div>

        <div className="mt-1 space-y-0.5">
          <div className="grid gap-1 rounded-[0.6rem] border border-white/10 bg-white/[0.04] p-[0.65rem]">
            <SetupOptionGroup
              title={TEXT.gameStyleTitle}
              options={gameStyleOptions}
              currentValue={sessionConfig.gameStyle ?? DEFAULT_SESSION_CONFIG.gameStyle ?? "multiple_choice"}
              isDisabled={false}
              onSelect={(value) => onUpdate({ gameStyle: value as GameStyle })}
            />
            <SetupOptionGroup
              title={TEXT.partOfSpeechTitle}
            options={PART_OF_SPEECH_OPTIONS}
            currentValue={sessionConfig.partOfSpeech}
            isDisabled={false}
            disabledValues={PART_OF_SPEECH_OPTIONS.filter(
              (option) => !availablePartOfSpeechFilters.includes(option.value),
            ).map((option) => option.value)}
            onSelect={(value) => onUpdate({ partOfSpeech: value as PartOfSpeechFilter })}
          />
          <SetupOptionGroup
            title={TEXT.difficultyTitle}
            options={DIFFICULTY_OPTIONS}
            currentValue={sessionConfig.difficulty}
            isDisabled={false}
            disabledValues={DIFFICULTY_OPTIONS.filter(
              (option) => !availableDifficultyFilters.includes(option.value),
            ).map((option) => option.value)}
            onSelect={(value) => onUpdate({ difficulty: value as DifficultyFilter })}
          />
            <SetupOptionGroup
              title={TEXT.quizModeTitle}
              options={quizModeOptions}
              currentValue={sessionConfig.quizMode}
              isDisabled={false}
              badges={{
                audio_to_meaning: quizModeCounts.audio_to_meaning === 0 ? TEXT.noAudioData : undefined,
              }}
              disabledValues={quizModeOptions.filter((option) => !availableQuizModes.includes(option.value)).map(
                (option) => option.value,
              )}
              onSelect={(value) => onUpdate({ quizMode: value as QuizModeFilter })}
            />
          </div>

          <div className="rounded-[0.6rem] border border-white/10 bg-stone-950/60 p-0.5">
            <div className="flex items-end justify-between gap-2 rounded-[0.52rem] border border-white/10 bg-white/[0.04] px-2.5 py-1.5">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-stone-300">{TEXT.setupCountLabel}</p>
                <p className="text-[1.22rem] font-black tracking-[-0.05em] text-white sm:text-[1.32rem]">
                  {configuredWordsCount}
                  <span className="ml-1 text-[12px] font-medium text-stone-300">/ {totalWordsCount}</span>
                </p>
                <p className="mt-px text-[12px] font-medium leading-4 text-stone-400">
                  {sessionConfigLabels.gameStyle} / {sessionConfigLabels.partOfSpeech} / {sessionConfigLabels.quizMode}
                </p>
              </div>
              <button
                className="min-h-13 rounded-2xl bg-amber-300 px-6 py-3 text-[18px] font-black text-stone-950 shadow-[0_14px_30px_rgba(251,191,36,0.24)]"
                type="button"
                onClick={onStart}
              >
                {startLabel}
              </button>
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
  badges?: Record<string, string | undefined>;
  disabledValues?: string[];
  onSelect: (value: string) => void;
};

function SetupOptionGroup({
  title,
  options,
  currentValue,
  isDisabled,
  badges = {},
  disabledValues = [],
  onSelect,
}: SetupOptionGroupProps) {
  const gridClassName = options.length >= 5 ? "grid-cols-3" : "grid-cols-2";
  const isQuizModeGroup = title === TEXT.quizModeTitle;

  return (
    <div className="rounded-[0.52rem] border border-white/10 bg-white/5 p-1.25">
      <p className="text-[13px] font-semibold text-stone-100">{title}</p>
      <div className={`mt-1 grid ${gridClassName} gap-1`}>
        {options.map((option) => {
          const isSelected = currentValue === option.value;
          const isOptionDisabled = isDisabled || disabledValues.includes(option.value);
          return (
            <button
              key={option.value}
              className={`min-h-10 rounded-[0.42rem] border px-2 py-1.25 text-center text-[14px] font-semibold leading-tight transition ${
                isSelected
                  ? isQuizModeGroup
                    ? "border-amber-200/40 bg-gradient-to-br from-amber-200/18 via-white/[0.1] to-sky-300/12 text-amber-50 shadow-[0_10px_26px_rgba(251,191,36,0.16)]"
                    : "border-amber-300/30 bg-amber-300/12 text-amber-100"
                  : isOptionDisabled
                    ? "border-white/8 bg-white/[0.03] text-stone-500 opacity-45"
                    : isQuizModeGroup
                      ? "border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.05] to-transparent text-stone-200 hover:border-white/20 hover:bg-white/10"
                      : "border-white/10 bg-white/5 text-stone-300 hover:border-white/20 hover:bg-white/10"
              }`}
              type="button"
              onClick={() => onSelect(option.value)}
              disabled={isOptionDisabled}
              aria-pressed={isSelected}
              aria-disabled={isOptionDisabled}
            >
              <span className="flex items-center justify-center gap-1">
                {isQuizModeGroup ? (
                  <span className="inline-flex items-center gap-1.5">
                    {option.label.split(" → ").map((segment, index, parts) => (
                      <span key={`${option.value}-${segment}-${index}`} className="inline-flex items-center gap-1.5">
                        <span className={index === 0 ? "text-stone-100" : "text-stone-50"}>{segment}</span>
                        {index < parts.length - 1 ? (
                          <span className="rounded-full border border-amber-200/20 bg-amber-200/10 px-1.5 py-0.5 text-[11px] text-amber-200/90 drop-shadow-[0_0_10px_rgba(251,191,36,0.22)]">
                            →
                          </span>
                        ) : null}
                      </span>
                    ))}
                  </span>
                ) : (
                  <span>{option.label}</span>
                )}
                {badges[option.value] ? (
                  <span className="rounded-full border border-white/10 bg-black/20 px-1.5 py-0.5 text-[11px] font-semibold text-stone-400">
                    {badges[option.value]}
                  </span>
                ) : null}
              </span>
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

function HeartHudCard({ current }: { current: number }) {
  return (
    <div className="rounded-[0.95rem] border border-white/10 bg-gradient-to-b from-white/[0.12] via-white/[0.05] to-white/[0.02] px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_20px_rgba(0,0,0,0.14)]">
      <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400">{TEXT.heartsLabel}</p>
      <div className="mt-1 flex gap-0.5">
        {Array.from({ length: DISPLAY_HEARTS }).map((_, index) => {
          const filled = Math.max(0, Math.min(2, current - index * 2));

          return <HeartIcon key={`heart-${index}`} fillLevel={filled} />;
        })}
      </div>
    </div>
  );
}

function PaceMeter({ elapsedMs, pacePercent }: { elapsedMs: number; pacePercent: number }) {
  return (
    <div className="rounded-[0.95rem] border border-white/10 bg-gradient-to-b from-white/[0.12] via-white/[0.05] to-white/[0.02] px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_20px_rgba(0,0,0,0.14)]">
      <div className="mb-1 flex items-center justify-between gap-3">
        <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400">{TEXT.paceCompact}</p>
        <span className="text-[9px] font-semibold text-stone-300">{(elapsedMs / 1000).toFixed(1)}s</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-amber-200 to-rose-300 transition-all duration-100 ease-linear"
          style={{ width: `${pacePercent}%` }}
        />
      </div>
    </div>
  );
}

function HudStatCard({ label, value, accentClassName = "text-stone-100" }: HudStatCardProps) {
  return (
    <div className="rounded-[0.95rem] border border-white/10 bg-gradient-to-b from-white/[0.12] via-white/[0.05] to-white/[0.02] px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_20px_rgba(0,0,0,0.14)]">
      <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400">{label}</p>
      <p className={`mt-0.5 text-[16px] font-bold drop-shadow-[0_3px_12px_rgba(0,0,0,0.18)] sm:text-[17px] ${accentClassName}`}>{value}</p>
    </div>
  );
}

function HeartIcon({ fillLevel }: { fillLevel: 0 | 1 | 2 | number }) {
  return (
    <span className="relative inline-flex h-5 w-5 items-center justify-center text-[18px] leading-none">
      <span className="text-white/18">♥</span>
      {fillLevel > 0 ? (
        <span
          className="absolute inset-0 overflow-hidden text-rose-300 drop-shadow-[0_0_8px_rgba(251,113,133,0.32)]"
          style={{ width: `${fillLevel === 2 ? 100 : 50}%` }}
        >
          ♥
        </span>
      ) : null}
    </span>
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
      className={`relative min-h-12 overflow-hidden rounded-[1.2rem] border bg-gradient-to-b from-white/[0.1] via-white/[0.04] to-white/[0.02] px-3.5 py-1.75 text-left text-[15px] font-medium leading-5 shadow-[0_10px_24px_rgba(0,0,0,0.12)] transition duration-300 ease-out disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
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


