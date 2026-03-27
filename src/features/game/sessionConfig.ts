import type { QuestionType, ReviewStateRecord, SessionMode, WordItem } from "../../services/apiTypes";

export type PartOfSpeechFilter = "all" | "noun" | "verb" | "adjective" | "adverb" | "other";
export type DifficultyFilter = "all" | "1" | "2" | "3";
export type QuizModeFilter =
  | "kanji_to_meaning"
  | "furigana_to_meaning"
  | "audio_to_meaning"
  | "meaning_to_kanji"
  | "meaning_to_furigana";
export type SupportedLanguageCode = "ja" | "en";

export type SessionConfig = {
  partOfSpeech: PartOfSpeechFilter;
  difficulty: DifficultyFilter;
  quizMode: QuizModeFilter;
};

type SessionQueueOptions = {
  mode?: SessionMode | "review";
  reviewState?: ReviewStateRecord[];
  seed?: number;
};

type WordLike = WordItem &
  Partial<{
    word_id: string;
    question_type: QuestionType;
  }>;

export const DEFAULT_SESSION_CONFIG: SessionConfig = {
  partOfSpeech: "all",
  difficulty: "all",
  quizMode: "kanji_to_meaning",
};

export const QUIZ_MODE_ORDER: QuizModeFilter[] = [
  "kanji_to_meaning",
  "furigana_to_meaning",
  "meaning_to_kanji",
  "meaning_to_furigana",
  "audio_to_meaning",
];

export function normalizeQuizModeFilter(value?: string | null): QuizModeFilter {
  if (value === "meaning_to_word") {
    return "meaning_to_kanji";
  }

  if (QUIZ_MODE_ORDER.includes(value as QuizModeFilter)) {
    return value as QuizModeFilter;
  }

  return DEFAULT_SESSION_CONFIG.quizMode;
}

export function isMeaningToWordQuizMode(mode: QuizModeFilter) {
  return mode === "meaning_to_kanji" || mode === "meaning_to_furigana";
}

function normalizeText(value: string) {
  return String(value ?? "").trim().toLocaleLowerCase();
}

function getWordId(word: WordLike) {
  return String(word.id ?? word.word_id ?? "").trim();
}

function inferLanguageCodeFromWordId(wordId: string): SupportedLanguageCode {
  return String(wordId || "").trim().toUpperCase().startsWith("EN_") ? "en" : "ja";
}

function getQuestionType(word: WordLike): QuestionType {
  return (word.questionType ?? word.question_type ?? "word_to_meaning") as QuestionType;
}

function containsKanji(text: string) {
  return /[\u3400-\u4DBF\u4E00-\u9FFF]/u.test(text);
}

function containsKana(text: string) {
  return /[\u3040-\u30FF]/u.test(text);
}

function containsHangul(text: string) {
  return /[\uac00-\ud7a3]/u.test(text);
}

function createSeededRandom(seed: number) {
  let state = seed >>> 0;

  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function shuffleWithSeed<T>(items: T[], seed: number) {
  const random = createSeededRandom(seed || 1);
  const next = [...items];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }

  return next;
}

function getDifficultyRank(word: WordItem) {
  const parsed = Number.parseInt(String(word.difficulty || "").trim(), 10);
  return Number.isNaN(parsed) ? Number.MAX_SAFE_INTEGER : parsed;
}

function getMeaningKey(word: WordItem) {
  return normalizeText(word.meaning);
}

function getPromptKey(word: WordItem) {
  return normalizeText(word.prompt);
}

function getFamilyKey(word: WordItem) {
  return `${normalizeText(getWordId(word))}::${getMeaningKey(word)}`;
}

function getMeaningToWordVariantRank(word: WordItem) {
  const answer = String(word.answer ?? "").trim();

  if (containsKanji(answer)) {
    return 2;
  }

  if (containsKana(answer)) {
    return 1;
  }

  return 0;
}

function getMeaningToWordMode(word: WordItem): QuizModeFilter {
  const languageCode = inferLanguageCodeFromWordId(getWordId(word));
  if (languageCode === "en") {
    return "meaning_to_kanji";
  }

  const answer = String(word.answer ?? "").trim();

  if (containsKanji(answer)) {
    return "meaning_to_kanji";
  }

  if (containsKana(answer)) {
    return "meaning_to_furigana";
  }

  return "meaning_to_kanji";
}

function buildReviewPriorityMap(reviewState: ReviewStateRecord[] = []) {
  return new Map(reviewState.map((item) => [item.wordId, item.priorityScore]));
}

function getReviewPriority(word: WordItem, reviewPriorityMap: Map<string, number>) {
  return reviewPriorityMap.get(getWordId(word)) ?? 0;
}

export function inferPartOfSpeech(wordId: string): PartOfSpeechFilter {
  const normalized = String(wordId || "").trim().toUpperCase();

  if (normalized.includes("_N_")) return "noun";
  if (normalized.includes("_V_")) return "verb";
  if (
    normalized.includes("_A_") ||
    normalized.includes("_AI_") ||
    normalized.includes("_NA_") ||
    normalized.includes("_ADJ_")
  ) {
    return "adjective";
  }
  if (normalized.includes("_AD_") || normalized.includes("_ADV_")) return "adverb";
  return "other";
}

export function getWordPromptMode(word: WordItem): QuizModeFilter {
  const languageCode = inferLanguageCodeFromWordId(getWordId(word));

  if (getQuestionType(word) === "meaning_to_word") {
    return getMeaningToWordMode(word);
  }

  if (languageCode === "en") {
    return "kanji_to_meaning";
  }

  const prompt = String(word.prompt ?? "").trim();

  if (containsKanji(prompt)) {
    return "kanji_to_meaning";
  }

  if (containsKana(prompt)) {
    return "furigana_to_meaning";
  }

  return "audio_to_meaning";
}

function isAudioCompatibleWord(word: WordItem) {
  if (getQuestionType(word) !== "word_to_meaning") {
    return false;
  }

  const languageCode = inferLanguageCodeFromWordId(getWordId(word));
  if (languageCode === "en") {
    return normalizeText(word.prompt).length > 0;
  }

  return getWordPromptMode(word) === "furigana_to_meaning";
}

export function getSupportedQuizModes(languageCode?: string | null): QuizModeFilter[] {
  if (languageCode === "en") {
    return ["kanji_to_meaning", "meaning_to_kanji", "audio_to_meaning"];
  }

  return QUIZ_MODE_ORDER;
}

function wordMatchesQuizMode(word: WordItem, quizMode: QuizModeFilter) {
  if (quizMode === "audio_to_meaning") {
    return isAudioCompatibleWord(word);
  }

  return getWordPromptMode(word) === quizMode;
}

function matchesBaseFilters(word: WordItem, sessionConfig: Pick<SessionConfig, "partOfSpeech" | "difficulty">) {
  if (getQuestionType(word) === "word_to_meaning" && !containsHangul(String(word.answer || word.meaning || "").trim())) {
    return false;
  }

  const matchesPartOfSpeech =
    sessionConfig.partOfSpeech === "all" || inferPartOfSpeech(getWordId(word)) === sessionConfig.partOfSpeech;
  const matchesDifficulty =
    sessionConfig.difficulty === "all" || String(word.difficulty || "").trim() === sessionConfig.difficulty;

  return matchesPartOfSpeech && matchesDifficulty;
}

export function getAvailableQuizModes(
  words: WordItem[],
  sessionConfig: Pick<SessionConfig, "partOfSpeech" | "difficulty">,
) {
  const counts = getQuizModeCounts(words, sessionConfig);

  return QUIZ_MODE_ORDER.filter((mode) => counts[mode] > 0);
}

export function getQuizModeCounts(
  words: WordItem[],
  sessionConfig: Pick<SessionConfig, "partOfSpeech" | "difficulty">,
) {
  const counts = QUIZ_MODE_ORDER.reduce(
    (accumulator, mode) => {
      accumulator[mode] = 0;
      return accumulator;
    },
    {} as Record<QuizModeFilter, number>,
  );

  for (const word of words) {
    if (!matchesBaseFilters(word, sessionConfig)) {
      continue;
    }

    const promptMode = getWordPromptMode(word);
    counts[promptMode] += 1;

    if (isAudioCompatibleWord(word)) {
      counts.audio_to_meaning += 1;
    }
  }

  return counts;
}

export function getAvailablePartOfSpeechFilters(
  words: WordItem[],
  sessionConfig: Pick<SessionConfig, "difficulty" | "quizMode">,
) {
  const available = new Set<PartOfSpeechFilter>(["all"]);

  for (const word of words) {
    const matchesDifficulty =
      sessionConfig.difficulty === "all" || String(word.difficulty || "").trim() === sessionConfig.difficulty;
    const matchesQuizMode = wordMatchesQuizMode(word, sessionConfig.quizMode);

    if (!matchesDifficulty || !matchesQuizMode) {
      continue;
    }

    available.add(inferPartOfSpeech(getWordId(word)));
  }

  return ["all", "noun", "verb", "adjective", "adverb", "other"].filter((value) =>
    available.has(value as PartOfSpeechFilter),
  ) as PartOfSpeechFilter[];
}

export function getAvailableDifficultyFilters(
  words: WordItem[],
  sessionConfig: Pick<SessionConfig, "partOfSpeech" | "quizMode">,
) {
  const available = new Set<DifficultyFilter>(["all"]);

  for (const word of words) {
    const matchesPartOfSpeech =
      sessionConfig.partOfSpeech === "all" || inferPartOfSpeech(getWordId(word)) === sessionConfig.partOfSpeech;
    const matchesQuizMode = wordMatchesQuizMode(word, sessionConfig.quizMode);

    if (!matchesPartOfSpeech || !matchesQuizMode) {
      continue;
    }

    const difficulty = String(word.difficulty || "").trim() as DifficultyFilter;
    if (difficulty === "1" || difficulty === "2" || difficulty === "3") {
      available.add(difficulty);
    }
  }

  return ["all", "1", "2", "3"].filter((value) => available.has(value as DifficultyFilter)) as DifficultyFilter[];
}

export function filterWordsBySessionConfig(words: WordItem[], sessionConfig: SessionConfig) {
  const filtered = words.filter((word) => {
    if (!matchesBaseFilters(word, sessionConfig)) {
      return false;
    }

    return wordMatchesQuizMode(word, sessionConfig.quizMode);
  });

  if (!isMeaningToWordQuizMode(sessionConfig.quizMode)) {
    return filtered;
  }

  const deduped = new Map<string, WordItem>();

  for (const word of filtered) {
    const familyKey = getFamilyKey(word);
    const current = deduped.get(familyKey);

    if (!current) {
      deduped.set(familyKey, word);
      continue;
    }

    const nextRank = getMeaningToWordVariantRank(word);
    const currentRank = getMeaningToWordVariantRank(current);

    if (nextRank > currentRank) {
      deduped.set(familyKey, word);
      continue;
    }

    if (nextRank === currentRank && normalizeText(word.answer).localeCompare(normalizeText(current.answer)) < 0) {
      deduped.set(familyKey, word);
    }
  }

  return [...deduped.values()];
}

function countRecentConflict(candidate: WordItem, recentWords: WordItem[]) {
  const candidateFamily = getFamilyKey(candidate);
  const candidateMeaning = getMeaningKey(candidate);
  const candidatePrompt = getPromptKey(candidate);

  return recentWords.reduce((score, recentWord, index) => {
    const recencyWeight = recentWords.length - index;
    let nextScore = score;

    if (getFamilyKey(recentWord) === candidateFamily) {
      nextScore += 6 * recencyWeight;
    }

    if (getMeaningKey(recentWord) === candidateMeaning) {
      nextScore += 4 * recencyWeight;
    }

    if (getPromptKey(recentWord) === candidatePrompt) {
      nextScore += 3 * recencyWeight;
    }

    if (recentWord.questionType === candidate.questionType) {
      nextScore += 1 * recencyWeight;
    }

    if (getWordPromptMode(recentWord) === getWordPromptMode(candidate)) {
      nextScore += 1;
    }

    return nextScore;
  }, 0);
}

function diversifyQueue(words: WordItem[], seed: number) {
  const remaining = shuffleWithSeed(words, seed);
  const result: WordItem[] = [];

  while (remaining.length > 0) {
    const recentWords = result.slice(-3);
    let pickedIndex = 0;
    let bestScore = Number.POSITIVE_INFINITY;

    remaining.forEach((word, index) => {
      const score = countRecentConflict(word, recentWords);

      if (score < bestScore) {
        bestScore = score;
        pickedIndex = index;
      }
    });

    result.push(remaining[pickedIndex]);
    remaining.splice(pickedIndex, 1);
  }

  return result;
}

function sortStandardQueue(words: WordItem[], reviewPriorityMap: Map<string, number>, seed: number) {
  const shuffled = shuffleWithSeed(words, seed);

  const prioritized = [...shuffled].sort((left, right) => {
    const reviewDiff = getReviewPriority(right, reviewPriorityMap) - getReviewPriority(left, reviewPriorityMap);
    if (reviewDiff !== 0) {
      return reviewDiff;
    }

    const difficultyDiff = getDifficultyRank(left) - getDifficultyRank(right);
    if (difficultyDiff !== 0) {
      return difficultyDiff;
    }

    return 0;
  });

  return diversifyQueue(prioritized, seed + 101);
}

function sortPracticeQueue(words: WordItem[], reviewPriorityMap: Map<string, number>, seed: number) {
  const reviewWords = words.filter((word) => getReviewPriority(word, reviewPriorityMap) > 0);
  const freshWords = words.filter((word) => getReviewPriority(word, reviewPriorityMap) === 0);

  const sortChunk = (chunk: WordItem[], chunkSeed: number) => {
    const shuffled = shuffleWithSeed(chunk, chunkSeed);
    const prioritized = [...shuffled].sort((left, right) => {
      const reviewDiff = getReviewPriority(right, reviewPriorityMap) - getReviewPriority(left, reviewPriorityMap);
      if (reviewDiff !== 0) {
        return reviewDiff;
      }

      return getDifficultyRank(left) - getDifficultyRank(right);
    });

    return diversifyQueue(prioritized, chunkSeed + 13);
  };

  return [...sortChunk(reviewWords, seed + 11), ...sortChunk(freshWords, seed + 29)];
}

export function buildSessionWordQueue(
  words: WordItem[],
  _sessionConfig: SessionConfig,
  options: SessionQueueOptions = {},
) {
  const reviewPriorityMap = buildReviewPriorityMap(options.reviewState);
  const seed = options.seed ?? Date.now();

  return options.mode === "practice" || options.mode === "review"
    ? sortPracticeQueue(words, reviewPriorityMap, seed)
    : sortStandardQueue(words, reviewPriorityMap, seed);
}

export function getQuizModeLabel(mode: QuizModeFilter, languageCode: string | null = "ja") {
  if (languageCode === "en") {
    if (mode === "kanji_to_meaning") {
      return "\uB2E8\uC5B4 \u2192 \uB73B";
    }

    if (mode === "furigana_to_meaning") {
      return "\uC2A4\uD3A0\uB9C1 \u2192 \uB73B";
    }

    if (mode === "meaning_to_kanji") {
      return "\uB73B \u2192 \uB2E8\uC5B4";
    }

    if (mode === "meaning_to_furigana") {
      return "\uB73B \u2192 \uC2A4\uD3A0\uB9C1";
    }

    return "\uC74C\uC131 \u2192 \uB73B";
  }

  if (mode === "kanji_to_meaning") {
    return "\uD55C\uC790 \u2192 \uB73B";
  }

  if (mode === "furigana_to_meaning") {
    return "\uD6C4\uB9AC\uAC00\uB098 \u2192 \uB73B";
  }

  if (mode === "meaning_to_kanji") {
    return "\uB73B \u2192 \uD55C\uC790";
  }

  if (mode === "meaning_to_furigana") {
    return "\uB73B \u2192 \uD6C4\uB9AC\uAC00\uB098";
  }

  return "\uC74C\uC131 \u2192 \uB73B";
}

export function getSessionConfigLabels(sessionConfig: SessionConfig, languageCode: string | null = "ja") {
  return {
    partOfSpeech:
      sessionConfig.partOfSpeech === "all"
        ? "\uC804\uCCB4"
        : sessionConfig.partOfSpeech === "noun"
          ? "\uBA85\uC0AC"
          : sessionConfig.partOfSpeech === "verb"
            ? "\uB3D9\uC0AC"
            : sessionConfig.partOfSpeech === "adjective"
              ? "\uD615\uC6A9\uC0AC"
              : sessionConfig.partOfSpeech === "adverb"
                ? "\uBD80\uC0AC"
                : "\uAE30\uD0C0",
    difficulty:
      sessionConfig.difficulty === "all"
        ? "\uC804\uCCB4"
        : sessionConfig.difficulty === "1"
          ? "\uB09C\uC774\uB3C4 1"
          : sessionConfig.difficulty === "2"
            ? "\uB09C\uC774\uB3C4 2"
            : "\uB09C\uC774\uB3C4 3+",
    quizMode: getQuizModeLabel(sessionConfig.quizMode, languageCode),
  };
}

export function getReadableSessionConfigLabels(sessionConfig: SessionConfig, languageCode: string | null = "ja") {
  return getSessionConfigLabels(sessionConfig, languageCode);
}
