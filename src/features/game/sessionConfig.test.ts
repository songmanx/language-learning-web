import { describe, expect, it } from "vitest";
import type { ReviewStateRecord, WordItem } from "../../services/apiTypes";
import {
  DEFAULT_SESSION_CONFIG,
  buildSessionWordQueue,
  filterWordsBySessionConfig,
  getAvailableDifficultyFilters,
  getAvailablePartOfSpeechFilters,
  getAvailableQuizModes,
  getQuizModeCounts,
  getSessionConfigLabels,
  getWordPromptMode,
  type SessionConfig,
} from "./sessionConfig";

function createWord(overrides: Partial<WordItem>): WordItem {
  return {
    id: "JA_N_0001",
    prompt: "\u732B",
    choices: ["\uACE0\uC591\uC774", "\uAC00\uBC29", "\uC0C8", "\uBB3C\uACE0\uAE30"],
    answer: "\uACE0\uC591\uC774",
    meaning: "\uACE0\uC591\uC774",
    difficulty: "1",
    questionType: "word_to_meaning",
    ...overrides,
  };
}

function createReviewState(...items: ReviewStateRecord[]): ReviewStateRecord[] {
  return items;
}

describe("sessionConfig", () => {
  it("distinguishes quiz modes from prompt and answer shape", () => {
    expect(getWordPromptMode(createWord({ prompt: "\u732B", answer: "\uACE0\uC591\uC774" }))).toBe("kanji_to_meaning");
    expect(getWordPromptMode(createWord({ prompt: "\u306D\u3053", answer: "\uACE0\uC591\uC774" }))).toBe("furigana_to_meaning");
    expect(getWordPromptMode(createWord({ prompt: "cat.mp3", answer: "\uACE0\uC591\uC774" }))).toBe("audio_to_meaning");
    expect(getWordPromptMode(createWord({ questionType: "meaning_to_word", answer: "\u732B" }))).toBe("meaning_to_kanji");
    expect(getWordPromptMode(createWord({ questionType: "meaning_to_word", answer: "\u306D\u3053" }))).toBe("meaning_to_furigana");
    expect(
      getWordPromptMode(
        createWord({
          id: "EN_N_0001",
          prompt: "cat",
          answer: "\uACE0\uC591\uC774",
        }),
      ),
    ).toBe("kanji_to_meaning");
    expect(
      getWordPromptMode(
        createWord({
          id: "EN_N_0001",
          questionType: "meaning_to_word",
          prompt: "cat",
          answer: "cat",
          meaning: "\uACE0\uC591\uC774",
        }),
      ),
    ).toBe("meaning_to_kanji");
  });

  it("filters words by the exact selected quiz mode", () => {
    const words = [
      createWord({ id: "kanji", prompt: "\u732B", answer: "\uACE0\uC591\uC774" }),
      createWord({ id: "furigana", prompt: "\u306D\u3053", answer: "\uACE0\uC591\uC774" }),
      createWord({ id: "audio", prompt: "cat.mp3", answer: "\uACE0\uC591\uC774" }),
      createWord({
        id: "meaning-kanji",
        questionType: "meaning_to_word",
        prompt: "cat",
        answer: "\u732B",
        meaning: "cat",
      }),
      createWord({
        id: "meaning-furigana",
        questionType: "meaning_to_word",
        prompt: "cat",
        answer: "\u306D\u3053",
        meaning: "cat",
      }),
    ];

    const pick = (quizMode: SessionConfig["quizMode"]) =>
      filterWordsBySessionConfig(words, { ...DEFAULT_SESSION_CONFIG, quizMode }).map((word) => word.id);

    expect(pick("kanji_to_meaning")).toEqual(["kanji"]);
    expect(pick("furigana_to_meaning")).toEqual(["furigana"]);
    expect(pick("audio_to_meaning")).toEqual(["furigana"]);
    expect(pick("meaning_to_kanji")).toEqual(["meaning-kanji"]);
    expect(pick("meaning_to_furigana")).toEqual(["meaning-furigana"]);
  });

  it("keeps only one representative answer for the same meaning in meaning to kanji mode", () => {
    const words = [
      createWord({
        id: "JA_N_0001",
        questionType: "meaning_to_word",
        prompt: "cat",
        answer: "\u732B",
        meaning: "cat",
      }),
      createWord({
        id: "JA_N_0001",
        questionType: "meaning_to_word",
        prompt: "cat",
        answer: "\u306D\u3053",
        meaning: "cat",
      }),
      createWord({
        id: "JA_N_0002",
        questionType: "meaning_to_word",
        prompt: "bag",
        answer: "\u9784",
        meaning: "bag",
      }),
    ];

    const filtered = filterWordsBySessionConfig(words, {
      ...DEFAULT_SESSION_CONFIG,
      quizMode: "meaning_to_kanji",
    });

    expect(filtered).toHaveLength(2);
    expect(filtered.find((word) => word.meaning === "cat")?.answer).toBe("\u732B");
  });

  it("returns only quiz modes that are actually available for the current filters", () => {
    const words = [
      createWord({ id: "kanji", prompt: "\u732B", answer: "\uACE0\uC591\uC774", meaning: "cat" }),
      createWord({ id: "furigana", prompt: "\u306D\u3053", answer: "\uACE0\uC591\uC774", meaning: "cat" }),
      createWord({
        id: "meaning",
        questionType: "meaning_to_word",
        prompt: "cat",
        answer: "\u732B",
        meaning: "cat",
      }),
    ];

    expect(getAvailableQuizModes(words, { partOfSpeech: "all", difficulty: "all" })).toEqual([
      "kanji_to_meaning",
      "furigana_to_meaning",
      "meaning_to_kanji",
      "audio_to_meaning",
    ]);
  });

  it("returns quiz mode counts for the current base filters", () => {
    const words = [
      createWord({ id: "kanji", prompt: "\u732B", answer: "\uACE0\uC591\uC774", meaning: "cat" }),
      createWord({ id: "furigana", prompt: "\u306D\u3053", answer: "\uACE0\uC591\uC774", meaning: "cat" }),
      createWord({
        id: "meaning-kanji",
        questionType: "meaning_to_word",
        prompt: "cat",
        answer: "\u732B",
        meaning: "cat",
      }),
      createWord({
        id: "meaning-furigana",
        questionType: "meaning_to_word",
        prompt: "cat",
        answer: "\u306D\u3053",
        meaning: "cat",
      }),
    ];

    expect(getQuizModeCounts(words, { partOfSpeech: "all", difficulty: "all" })).toEqual({
      kanji_to_meaning: 1,
      furigana_to_meaning: 1,
      meaning_to_kanji: 1,
      meaning_to_furigana: 1,
      audio_to_meaning: 1,
    });
  });

  it("returns only available parts of speech for the current mode and difficulty", () => {
    const words = [
      createWord({ id: "JA_N_0001", prompt: "\u732B", answer: "\uACE0\uC591\uC774", meaning: "cat", difficulty: "1" }),
      createWord({ id: "JA_V_0001", prompt: "\u98DF\u3079\u308B", answer: "\uBA39\uB2E4", meaning: "\uBA39\uB2E4", difficulty: "1" }),
      createWord({ id: "JA_ADV_0001", prompt: "\u3059\u3050", answer: "\uBC14\uB85C", meaning: "\uBC14\uB85C", difficulty: "2" }),
    ];

    expect(
      getAvailablePartOfSpeechFilters(words, {
        difficulty: "1",
        quizMode: "kanji_to_meaning",
      }),
    ).toEqual(["all", "noun", "verb"]);
  });

  it("returns only available difficulties for the current mode and part of speech", () => {
    const words = [
      createWord({ id: "JA_N_0001", prompt: "\u732B", answer: "\uACE0\uC591\uC774", meaning: "cat", difficulty: "1" }),
      createWord({ id: "JA_N_0002", prompt: "\u72AC", answer: "\uAC1C", meaning: "dog", difficulty: "2" }),
      createWord({ id: "JA_V_0001", prompt: "\u98DF\u3079\u308B", answer: "\uBA39\uB2E4", meaning: "eat", difficulty: "3" }),
    ];

    expect(
      getAvailableDifficultyFilters(words, {
        partOfSpeech: "noun",
        quizMode: "kanji_to_meaning",
      }),
    ).toEqual(["all", "1", "2"]);
  });

  it("builds the same session queue with the same seed", () => {
    const words = [
      createWord({ id: "JA_N_0001", prompt: "\u732B", answer: "\uACE0\uC591\uC774", meaning: "cat" }),
      createWord({ id: "JA_N_0002", prompt: "\u72AC", answer: "\uAC1C", meaning: "dog" }),
      createWord({ id: "JA_N_0003", prompt: "\u9CE5", answer: "\uC0C8", meaning: "bird", difficulty: "2" }),
      createWord({ id: "JA_N_0004", prompt: "\u9B5A", answer: "\uBB3C\uACE0\uAE30", meaning: "fish", difficulty: "2" }),
    ];

    const reviewState = createReviewState({
      wordId: "JA_N_0002",
      priorityScore: 10,
      reviewStage: "review",
      lastResult: "wrong",
    });

    const queueA = buildSessionWordQueue(words, DEFAULT_SESSION_CONFIG, {
      mode: "standard",
      seed: 7,
      reviewState,
    });
    const queueB = buildSessionWordQueue(words, DEFAULT_SESSION_CONFIG, {
      mode: "standard",
      seed: 7,
      reviewState,
    });

    expect(queueA.map((word) => word.id)).toEqual(queueB.map((word) => word.id));
    expect(queueA.map((word) => word.id)).toContain("JA_N_0002");
  });

  it("prioritizes high-review words first in practice mode", () => {
    const queue = buildSessionWordQueue(
      [
        createWord({ id: "JA_N_0003", difficulty: "3" }),
        createWord({ id: "JA_N_0001", difficulty: "1" }),
        createWord({ id: "JA_N_0002", difficulty: "2" }),
      ],
      DEFAULT_SESSION_CONFIG,
      {
        mode: "practice",
        seed: 11,
        reviewState: createReviewState(
          { wordId: "JA_N_0002", priorityScore: 10, reviewStage: "review", lastResult: "wrong" },
          { wordId: "JA_N_0003", priorityScore: 3, reviewStage: "learning", lastResult: "wrong" },
        ),
      },
    );

    expect(queue.slice(0, 2).map((word) => word.id)).toEqual(expect.arrayContaining(["JA_N_0002", "JA_N_0003"]));
  });

  it("avoids consecutive crowding of the same family and meaning", () => {
    const queue = buildSessionWordQueue(
      [
        createWord({ id: "JA_N_0001", prompt: "\u732B", answer: "\uACE0\uC591\uC774", meaning: "cat" }),
        createWord({ id: "JA_N_0001", prompt: "\u306D\u3053", answer: "\uACE0\uC591\uC774", meaning: "cat" }),
        createWord({ id: "JA_N_0002", prompt: "\u72AC", answer: "\uAC1C", meaning: "dog" }),
        createWord({ id: "JA_N_0003", prompt: "\u9CE5", answer: "\uC0C8", meaning: "bird" }),
      ],
      DEFAULT_SESSION_CONFIG,
      { mode: "standard", seed: 5 },
    );

    const queueKeys = queue.map((word) => `${word.id}::${word.meaning}`);

    expect(queueKeys[0]).not.toBe(queueKeys[1]);
    expect(queueKeys[1]).not.toBe(queueKeys[2]);
  });

  it("returns readable session config labels", () => {
    expect(
      getSessionConfigLabels({
        partOfSpeech: "noun",
        difficulty: "2",
        quizMode: "audio_to_meaning",
      }),
    ).toEqual({
      partOfSpeech: "\uBA85\uC0AC",
      difficulty: "\uB09C\uC774\uB3C4 2",
      quizMode: "\uC74C\uC131 \u2192 \uB73B",
    });
  });

  it("returns english-friendly quiz mode labels", () => {
    expect(
      getSessionConfigLabels(
        {
          partOfSpeech: "noun",
          difficulty: "1",
          quizMode: "kanji_to_meaning",
        },
        "en",
      ),
    ).toEqual({
      partOfSpeech: "\uBA85\uC0AC",
      difficulty: "\uB09C\uC774\uB3C4 1",
      quizMode: "\uB2E8\uC5B4 \u2192 \uB73B",
    });
  });
});
