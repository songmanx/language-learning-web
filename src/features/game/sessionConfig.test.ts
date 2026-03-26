import { describe, expect, it } from "vitest";
import type { ReviewStateRecord, WordItem } from "../../services/apiTypes";
import {
  DEFAULT_SESSION_CONFIG,
  buildSessionWordQueue,
  filterWordsBySessionConfig,
  getAvailableDifficultyFilters,
  getAvailablePartOfSpeechFilters,
  getAvailableQuizModes,
  getSessionConfigLabels,
  getWordPromptMode,
  type SessionConfig,
} from "./sessionConfig";

function createWord(overrides: Partial<WordItem>): WordItem {
  return {
    id: "JA_N_0001",
    prompt: "猫",
    choices: ["고양이", "개", "새", "물고기"],
    answer: "고양이",
    meaning: "고양이",
    difficulty: "1",
    questionType: "word_to_meaning",
    ...overrides,
  };
}

function createReviewState(...items: ReviewStateRecord[]): ReviewStateRecord[] {
  return items;
}

describe("sessionConfig", () => {
  it("prompt 형태에 따라 출제 방식을 구분한다", () => {
    expect(getWordPromptMode(createWord({ prompt: "猫" }))).toBe("kanji_to_meaning");
    expect(getWordPromptMode(createWord({ prompt: "ねこ" }))).toBe("furigana_to_meaning");
    expect(getWordPromptMode(createWord({ prompt: "cat.mp3" }))).toBe("audio_to_meaning");
    expect(getWordPromptMode(createWord({ questionType: "meaning_to_word" }))).toBe("meaning_to_word");
  });

  it("출제 방식과 정확히 일치하는 문제만 필터링한다", () => {
    const words = [
      createWord({ id: "kanji", prompt: "猫" }),
      createWord({ id: "furigana", prompt: "ねこ" }),
      createWord({ id: "audio", prompt: "cat.mp3" }),
      createWord({
        id: "meaning",
        questionType: "meaning_to_word",
        prompt: "ねこ",
        answer: "猫",
        meaning: "고양이",
      }),
    ];

    const pick = (quizMode: SessionConfig["quizMode"]) =>
      filterWordsBySessionConfig(words, { ...DEFAULT_SESSION_CONFIG, quizMode }).map((word) => word.id);

    expect(pick("kanji_to_meaning")).toEqual(["kanji"]);
    expect(pick("furigana_to_meaning")).toEqual(["furigana"]);
    expect(pick("audio_to_meaning")).toEqual(["audio"]);
    expect(pick("meaning_to_word")).toEqual(["meaning"]);
  });

  it("뜻 -> 단어는 같은 의미의 한자/후리가나 변형이 함께 있으면 대표 답 하나만 남긴다", () => {
    const words = [
      createWord({
        id: "JA_N_0001",
        questionType: "meaning_to_word",
        prompt: "고양이",
        answer: "猫",
        meaning: "고양이",
      }),
      createWord({
        id: "JA_N_0001",
        questionType: "meaning_to_word",
        prompt: "고양이",
        answer: "ねこ",
        meaning: "고양이",
      }),
      createWord({
        id: "JA_N_0002",
        questionType: "meaning_to_word",
        prompt: "개",
        answer: "犬",
        meaning: "개",
      }),
    ];

    const filtered = filterWordsBySessionConfig(words, {
      ...DEFAULT_SESSION_CONFIG,
      quizMode: "meaning_to_word",
    });

    expect(filtered).toHaveLength(2);
    expect(filtered.find((word) => word.meaning === "고양이")?.answer).toBe("猫");
  });

  it("현재 필터 조합에서 실제 가능한 방식만 반환한다", () => {
    const words = [
      createWord({ id: "kanji", prompt: "猫" }),
      createWord({ id: "furigana", prompt: "ねこ" }),
      createWord({
        id: "meaning",
        questionType: "meaning_to_word",
        prompt: "ねこ",
        answer: "猫",
        meaning: "고양이",
      }),
    ];

    expect(getAvailableQuizModes(words, { partOfSpeech: "all", difficulty: "all" })).toEqual([
      "kanji_to_meaning",
      "furigana_to_meaning",
      "meaning_to_word",
    ]);
  });

  it("현재 방식과 난이도 기준으로 가능한 품사만 반환한다", () => {
    const words = [
      createWord({ id: "JA_N_0001", prompt: "猫", difficulty: "1" }),
      createWord({ id: "JA_V_0001", prompt: "食べる", answer: "먹다", meaning: "먹다", difficulty: "1" }),
      createWord({ id: "JA_ADV_0001", prompt: "すぐ", answer: "바로", meaning: "바로", difficulty: "2" }),
    ];

    expect(
      getAvailablePartOfSpeechFilters(words, {
        difficulty: "1",
        quizMode: "kanji_to_meaning",
      }),
    ).toEqual(["all", "noun", "verb"]);
  });

  it("현재 방식과 품사 기준으로 가능한 난이도만 반환한다", () => {
    const words = [
      createWord({ id: "JA_N_0001", prompt: "猫", difficulty: "1" }),
      createWord({ id: "JA_N_0002", prompt: "犬", answer: "개", meaning: "개", difficulty: "2" }),
      createWord({ id: "JA_V_0001", prompt: "食べる", answer: "먹다", meaning: "먹다", difficulty: "3" }),
    ];

    expect(
      getAvailableDifficultyFilters(words, {
        partOfSpeech: "noun",
        quizMode: "kanji_to_meaning",
      }),
    ).toEqual(["all", "1", "2"]);
  });

  it("같은 seed면 같은 세션 큐가 만들어진다", () => {
    const words = [
      createWord({ id: "JA_N_0001", prompt: "猫", meaning: "고양이" }),
      createWord({ id: "JA_N_0002", prompt: "犬", answer: "개", meaning: "개" }),
      createWord({ id: "JA_N_0003", prompt: "鳥", answer: "새", meaning: "새", difficulty: "2" }),
      createWord({ id: "JA_N_0004", prompt: "魚", answer: "물고기", meaning: "물고기", difficulty: "2" }),
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

  it("연습 모드는 복습 대상이 먼저 나온다", () => {
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

  it("같은 단어군과 같은 의미가 연속으로 몰리지 않게 재배치한다", () => {
    const queue = buildSessionWordQueue(
      [
        createWord({ id: "JA_N_0001", prompt: "猫", answer: "고양이", meaning: "고양이" }),
        createWord({ id: "JA_N_0001", prompt: "ねこ", answer: "고양이", meaning: "고양이" }),
        createWord({ id: "JA_N_0002", prompt: "犬", answer: "개", meaning: "개" }),
        createWord({ id: "JA_N_0003", prompt: "鳥", answer: "새", meaning: "새" }),
      ],
      DEFAULT_SESSION_CONFIG,
      { mode: "standard", seed: 5 },
    );

    const queueKeys = queue.map((word) => `${word.id}::${word.meaning}`);

    expect(queueKeys[0]).not.toBe(queueKeys[1]);
    expect(queueKeys[1]).not.toBe(queueKeys[2]);
  });

  it("세션 구성 라벨을 읽기 쉬운 한국어로 반환한다", () => {
    expect(
      getSessionConfigLabels({
        partOfSpeech: "noun",
        difficulty: "2",
        quizMode: "audio_to_meaning",
      }),
    ).toEqual({
      partOfSpeech: "명사",
      difficulty: "난이도 2",
      quizMode: "단어(음성) -> 뜻",
    });
  });
});
