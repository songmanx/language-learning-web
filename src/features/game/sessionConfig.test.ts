import { describe, expect, it } from "vitest";
import {
  DEFAULT_SESSION_CONFIG,
  buildSessionWordQueue,
  filterWordsBySessionConfig,
  getWordPromptMode,
  type SessionConfig,
} from "./sessionConfig";
import type { ReviewStateRecord, WordItem } from "../../services/apiTypes";

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
  it("한자/후리가나/음성 문제 유형을 구분한다", () => {
    expect(getWordPromptMode(createWord({ prompt: "猫" }))).toBe("kanji_to_meaning");
    expect(getWordPromptMode(createWord({ prompt: "ねこ" }))).toBe("furigana_to_meaning");
    expect(getWordPromptMode(createWord({ prompt: "cat.mp3" }))).toBe("audio_to_meaning");
    expect(getWordPromptMode(createWord({ questionType: "meaning_to_word", prompt: "고양이" }))).toBe(
      "meaning_to_word",
    );
  });

  it("출제 방식에 맞는 문제만 남긴다", () => {
    const words = [
      createWord({ id: "kanji", prompt: "猫" }),
      createWord({ id: "furigana", prompt: "ねこ" }),
      createWord({ id: "audio", prompt: "cat.mp3" }),
      createWord({
        id: "meaning",
        questionType: "meaning_to_word",
        prompt: "고양이",
        answer: "ねこ",
        meaning: "고양이",
      }),
    ];

    const pick = (quizMode: SessionConfig["quizMode"]) =>
      filterWordsBySessionConfig(words, { ...DEFAULT_SESSION_CONFIG, quizMode }).map((word) => word.id);

    expect(pick("kanji_to_meaning")).toEqual(["kanji"]);
    expect(pick("furigana_to_meaning")).toEqual(["furigana"]);
    expect(pick("audio_to_meaning")).toEqual(["kanji", "furigana", "audio"]);
    expect(pick("meaning_to_word")).toEqual(["meaning"]);
  });

  it("기본 플레이는 복습 우선순위와 난이도 순서로 큐를 만든다", () => {
    const queue = buildSessionWordQueue(
      [
        createWord({ id: "JA_N_0003", difficulty: "2" }),
        createWord({ id: "JA_N_0001", difficulty: "1" }),
        createWord({ id: "JA_N_0002", difficulty: "1" }),
      ],
      DEFAULT_SESSION_CONFIG,
      {
        mode: "standard",
        reviewState: createReviewState({ wordId: "JA_N_0002", priorityScore: 10, reviewStage: "review", lastResult: "wrong" }),
      },
    );

    expect(queue.map((word) => word.id)).toEqual(["JA_N_0002", "JA_N_0001", "JA_N_0003"]);
  });

  it("연습 모드는 복습 대상 항목을 먼저 연다", () => {
    const queue = buildSessionWordQueue(
      [
        createWord({ id: "JA_N_0003", difficulty: "3" }),
        createWord({ id: "JA_N_0001", difficulty: "1" }),
        createWord({ id: "JA_N_0002", difficulty: "2" }),
      ],
      DEFAULT_SESSION_CONFIG,
      {
        mode: "practice",
        reviewState: createReviewState(
          { wordId: "JA_N_0002", priorityScore: 10, reviewStage: "review", lastResult: "wrong" },
          { wordId: "JA_N_0003", priorityScore: 3, reviewStage: "learning", lastResult: "wrong" },
        ),
      },
    );

    expect(queue.map((word) => word.id)).toEqual(["JA_N_0002", "JA_N_0003", "JA_N_0001"]);
  });
});
