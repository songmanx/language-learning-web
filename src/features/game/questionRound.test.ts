import { describe, expect, it } from "vitest";
import { buildQuestionRound } from "./questionRound";

describe("buildQuestionRound", () => {
  it("meaning_to_word 문제는 현재 DTO의 choices를 그대로 사용한다", () => {
    const currentWord = {
      id: "ja-4",
      prompt: "いぬ",
      choices: ["いぬ", "ねこ", "とり", "さかな"],
      answer: "いぬ",
      meaning: "개",
      difficulty: "1",
      questionType: "meaning_to_word" as const,
    };

    const round = buildQuestionRound(currentWord, [
      currentWord,
      {
        id: "ja-1",
        prompt: "ねこ",
        choices: ["고양이", "개", "새", "물고기"],
        answer: "고양이",
        meaning: "고양이",
        difficulty: "1",
        questionType: "word_to_meaning" as const,
      },
    ]);

    expect(round.prompt).toBe("개");
    expect(round.choices).toEqual(["いぬ", "ねこ", "とり", "さかな"]);
    expect(round.choices).not.toContain("고양이");
  });
});
