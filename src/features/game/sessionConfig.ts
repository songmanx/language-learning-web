import type { ReviewStateRecord, SessionMode, WordItem } from "../../services/apiTypes";

export type PartOfSpeechFilter = "all" | "noun" | "verb" | "adjective" | "adverb" | "other";
export type DifficultyFilter = "all" | "1" | "2" | "3";
export type QuizModeFilter =
  | "kanji_to_meaning"
  | "furigana_to_meaning"
  | "audio_to_meaning"
  | "meaning_to_word";

export type SessionConfig = {
  partOfSpeech: PartOfSpeechFilter;
  difficulty: DifficultyFilter;
  quizMode: QuizModeFilter;
};

type SessionQueueOptions = {
  mode?: SessionMode;
  reviewState?: ReviewStateRecord[];
};

export const DEFAULT_SESSION_CONFIG: SessionConfig = {
  partOfSpeech: "all",
  difficulty: "all",
  quizMode: "kanji_to_meaning",
};

export function inferPartOfSpeech(wordId: string): PartOfSpeechFilter {
  const normalized = String(wordId || "").trim().toUpperCase();

  if (normalized.includes("_N_")) return "noun";
  if (normalized.includes("_V_")) return "verb";
  if (normalized.includes("_AI_") || normalized.includes("_NA_") || normalized.includes("_ADJ_")) return "adjective";
  if (normalized.includes("_ADV_")) return "adverb";
  return "other";
}

function containsKanji(text: string) {
  return /[\u3400-\u4DBF\u4E00-\u9FFF]/u.test(text);
}

function containsKana(text: string) {
  return /[\u3040-\u30FF]/u.test(text);
}

export function getWordPromptMode(word: WordItem): QuizModeFilter {
  if (word.questionType === "meaning_to_word") {
    return "meaning_to_word";
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

export function filterWordsBySessionConfig(words: WordItem[], sessionConfig: SessionConfig) {
  return words.filter((word) => {
    const matchesPartOfSpeech =
      sessionConfig.partOfSpeech === "all" || inferPartOfSpeech(word.id) === sessionConfig.partOfSpeech;
    const matchesDifficulty =
      sessionConfig.difficulty === "all" || String(word.difficulty || "").trim() === sessionConfig.difficulty;

    const matchesQuizMode =
      sessionConfig.quizMode === "meaning_to_word"
        ? word.questionType === "meaning_to_word"
        : word.questionType === "word_to_meaning" &&
          (sessionConfig.quizMode === "audio_to_meaning"
            ? true
            : getWordPromptMode(word) === sessionConfig.quizMode);

    return matchesPartOfSpeech && matchesDifficulty && matchesQuizMode;
  });
}

function getDifficultyRank(word: WordItem) {
  const parsed = Number.parseInt(String(word.difficulty || "").trim(), 10);

  if (Number.isNaN(parsed)) {
    return Number.MAX_SAFE_INTEGER;
  }

  return parsed;
}

function buildReviewPriorityMap(reviewState: ReviewStateRecord[] = []) {
  return new Map(reviewState.map((item) => [item.wordId, item.priorityScore]));
}

function getReviewPriority(word: WordItem, reviewPriorityMap: Map<string, number>) {
  return reviewPriorityMap.get(word.id) ?? 0;
}

function sortBySessionPriority(words: WordItem[], reviewPriorityMap: Map<string, number>) {
  return [...words].sort((left, right) => {
    const reviewPriorityDiff = getReviewPriority(right, reviewPriorityMap) - getReviewPriority(left, reviewPriorityMap);

    if (reviewPriorityDiff !== 0) {
      return reviewPriorityDiff;
    }

    const difficultyDiff = getDifficultyRank(left) - getDifficultyRank(right);

    if (difficultyDiff !== 0) {
      return difficultyDiff;
    }

    return left.id.localeCompare(right.id);
  });
}

function sortPracticeReviewFirst(words: WordItem[], reviewPriorityMap: Map<string, number>) {
  return [...words].sort((left, right) => {
    const leftPriority = getReviewPriority(left, reviewPriorityMap);
    const rightPriority = getReviewPriority(right, reviewPriorityMap);
    const leftHasReview = leftPriority > 0 ? 1 : 0;
    const rightHasReview = rightPriority > 0 ? 1 : 0;

    if (rightHasReview !== leftHasReview) {
      return rightHasReview - leftHasReview;
    }

    if (rightPriority !== leftPriority) {
      return rightPriority - leftPriority;
    }

    const difficultyDiff = getDifficultyRank(left) - getDifficultyRank(right);

    if (difficultyDiff !== 0) {
      return difficultyDiff;
    }

    return left.id.localeCompare(right.id);
  });
}

export function buildSessionWordQueue(
  words: WordItem[],
  _sessionConfig: SessionConfig,
  options: SessionQueueOptions = {},
) {
  const reviewPriorityMap = buildReviewPriorityMap(options.reviewState);

  return options.mode === "practice"
    ? sortPracticeReviewFirst(words, reviewPriorityMap)
    : sortBySessionPriority(words, reviewPriorityMap);
}

export function getSessionConfigLabels(sessionConfig: SessionConfig) {
  return {
    partOfSpeech:
      sessionConfig.partOfSpeech === "all"
        ? "전체 품사"
        : sessionConfig.partOfSpeech === "noun"
          ? "명사"
          : sessionConfig.partOfSpeech === "verb"
            ? "동사"
            : sessionConfig.partOfSpeech === "adjective"
              ? "형용사"
              : sessionConfig.partOfSpeech === "adverb"
                ? "부사"
                : "기타",
    difficulty:
      sessionConfig.difficulty === "all"
        ? "전체 난이도"
        : sessionConfig.difficulty === "1"
          ? "난이도 1"
          : sessionConfig.difficulty === "2"
            ? "난이도 2"
            : "난이도 3+",
    quizMode:
      sessionConfig.quizMode === "kanji_to_meaning"
        ? "단어(한자) -> 뜻"
        : sessionConfig.quizMode === "furigana_to_meaning"
          ? "단어(후리가나) -> 뜻"
          : sessionConfig.quizMode === "audio_to_meaning"
            ? "단어(음성) -> 뜻"
            : "뜻 -> 단어",
  };
}
