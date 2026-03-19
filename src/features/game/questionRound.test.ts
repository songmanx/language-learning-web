import { describe, expect, it } from "vitest";
import { buildQuestionRound } from "./questionRound";
import type { WordItem } from "../../services/apiTypes";

function createWord(overrides: Partial<WordItem>): WordItem {
  return {
    id: "JA_N_0001",
    prompt: "ねこ",
    choices: ["고양이", "개", "새", "물고기"],
    answer: "고양이",
    meaning: "고양이",
    difficulty: "1",
    questionType: "word_to_meaning",
    ...overrides,
  };
}

describe("buildQuestionRound", () => {
  it("word_to_meaning 문제에서는 잘못된 seed choice를 걸러내고 같은 난이도/품사 distractor로 보강한다", () => {
    const currentWord = createWord({
      choices: ["고양이", "   ", "ねこ", "개"],
    });
    const words = [
      currentWord,
      createWord({ id: "JA_N_0002", prompt: "いぬ", answer: "개", meaning: "개" }),
      createWord({ id: "JA_N_0003", prompt: "とり", answer: "새", meaning: "새" }),
      createWord({ id: "JA_N_0004", prompt: "さかな", answer: "물고기", meaning: "물고기" }),
      createWord({ id: "JA_V_0001", prompt: "たべる", answer: "먹다", meaning: "먹다", difficulty: "2" }),
    ];

    const round = buildQuestionRound(currentWord, words);

    expect(round.prompt).toBe("ねこ");
    expect(round.answer).toBe("고양이");
    expect(round.choices).toEqual(["고양이", "개", "새", "물고기"]);
    expect(round.choices).not.toContain("ねこ");
  });

  it("meaning_to_word 문제에서는 프롬프트 풀 기준으로 단어 보기를 다시 구성한다", () => {
    const currentWord = createWord({
      id: "JA_N_0002",
      prompt: "いぬ",
      answer: "いぬ",
      meaning: "개",
      questionType: "meaning_to_word",
      choices: ["개", "いぬ", "새", " "],
    });
    const words = [
      createWord({ id: "JA_N_0001", prompt: "ねこ", answer: "고양이", meaning: "고양이" }),
      currentWord,
      createWord({ id: "JA_N_0003", prompt: "とり", answer: "새", meaning: "새" }),
      createWord({ id: "JA_N_0004", prompt: "さかな", answer: "물고기", meaning: "물고기" }),
      createWord({ id: "JA_V_0001", prompt: "たべる", answer: "먹다", meaning: "먹다", questionType: "meaning_to_word" }),
    ];

    const round = buildQuestionRound(currentWord, words);

    expect(round.prompt).toBe("개");
    expect(round.answer).toBe("いぬ");
    expect(round.choices).toEqual(["いぬ", "ねこ", "とり", "さかな"]);
    expect(round.choices).not.toContain("개");
  });

  it("후보가 중복될 때는 답을 유지한 채 유니크 choice만 남긴다", () => {
    const currentWord = createWord({
      choices: ["고양이", "고양이", "개", "개"],
    });
    const words = [
      currentWord,
      createWord({ id: "JA_N_0002", prompt: "いぬ", answer: "개", meaning: "개" }),
      createWord({ id: "JA_N_0003", prompt: "とり", answer: "새", meaning: "새" }),
    ];

    const round = buildQuestionRound(currentWord, words);

    expect(round.choices[0]).toBe("고양이");
    expect(new Set(round.choices).size).toBe(round.choices.length);
    expect(round.choices).toEqual(["고양이", "개", "새"]);
  });
});
