import { describe, expect, it } from "vitest";
import type { WordItem } from "../../services/apiTypes";
import { buildQuestionRound } from "./questionRound";

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
  it("word_to_meaning에서는 같은 타입의 한국어 보기를 우선 고른다", () => {
    const currentWord = createWord({
      id: "JA_N_0001",
      prompt: "ねこ",
      choices: ["고양이", "   ", "새", "개"],
    });
    const words = [
      currentWord,
      createWord({ id: "JA_N_0002", prompt: "いぬ", answer: "개", meaning: "개" }),
      createWord({ id: "JA_N_0003", prompt: "とり", answer: "새", meaning: "새" }),
      createWord({ id: "JA_N_0004", prompt: "さかな", answer: "물고기", meaning: "물고기" }),
      createWord({ id: "JA_V_0001", prompt: "먹다", answer: "먹다", meaning: "먹다", difficulty: "2" }),
    ];

    const round = buildQuestionRound(currentWord, words);

    expect(round.prompt).toBe("ねこ");
    expect(round.answer).toBe("고양이");
    expect(round.choices).toContain("고양이");
    expect(round.choices).toEqual(expect.arrayContaining(["개", "새", "물고기"]));
    expect(round.choices).not.toContain("ねこ");
  });

  it("word_to_meaning에서는 일본어 보기를 제외한다", () => {
    const currentWord = createWord({
      id: "JA_IA_0002",
      prompt: "やさしい",
      answer: "상냥하다",
      meaning: "상냥하다",
      choices: ["상냥하다", "차갑다", "따뜻하다", "やさしい"],
    });
    const words = [
      currentWord,
      createWord({ id: "JA_IA_0003", prompt: "つめたい", answer: "차갑다", meaning: "차갑다" }),
      createWord({ id: "JA_IA_0004", prompt: "あたたかい", answer: "따뜻하다", meaning: "따뜻하다" }),
      createWord({ id: "JA_IA_0005", prompt: "うれしい", answer: "기쁘다", meaning: "기쁘다" }),
      createWord({ id: "JA_IA_0006", prompt: "やさしい", answer: "やさしい", meaning: "やさしい" }),
    ];

    const round = buildQuestionRound(currentWord, words);

    expect(round.choices).toContain("상냥하다");
    expect(round.choices).toContain("차갑다");
    expect(round.choices).toContain("따뜻하다");
    expect(round.choices).toContain("기쁘다");
    expect(round.choices).not.toContain("やさしい");
  });

  it("meaning_to_word에서는 같은 단어군을 오답 보기로 다시 쓰지 않는다", () => {
    const currentWord = createWord({
      id: "JA_N_0002",
      prompt: "いぬ",
      answer: "개",
      meaning: "개",
      questionType: "meaning_to_word",
      choices: ["개", "고양이", "새", " "],
    });
    const words = [
      createWord({ id: "JA_N_0001", prompt: "ねこ", answer: "고양이", meaning: "고양이", questionType: "meaning_to_word" }),
      currentWord,
      createWord({ id: "JA_N_0003", prompt: "とり", answer: "새", meaning: "새", questionType: "meaning_to_word" }),
      createWord({ id: "JA_N_0004", prompt: "さかな", answer: "물고기", meaning: "물고기", questionType: "meaning_to_word" }),
      createWord({ id: "JA_N_0002", prompt: "개", answer: "개", meaning: "개", questionType: "word_to_meaning" }),
    ];

    const round = buildQuestionRound(currentWord, words);

    expect(round.prompt).toBe("개");
    expect(round.answer).toBe("개");
    expect(round.choices).toContain("개");
    expect(round.choices).toEqual(expect.arrayContaining(["고양이", "새", "물고기"]));
    expect(round.choices).not.toContain("いぬ");
  });

  it("정답 위치는 고정되지 않는다", () => {
    const currentWord = createWord({
      id: "JA_N_0009",
      prompt: "いぬ",
      choices: ["고양이", "개", "새", "물고기"],
      answer: "개",
      meaning: "개",
    });
    const words = [
      currentWord,
      createWord({ id: "JA_N_0001", prompt: "ねこ", answer: "고양이", meaning: "고양이" }),
      createWord({ id: "JA_N_0003", prompt: "とり", answer: "새", meaning: "새" }),
      createWord({ id: "JA_N_0004", prompt: "さかな", answer: "물고기", meaning: "물고기" }),
    ];
    const anotherWord = createWord({
      id: "JA_N_0011",
      prompt: "とり",
      choices: ["고양이", "개", "새", "물고기"],
      answer: "새",
      meaning: "새",
    });

    const round = buildQuestionRound(currentWord, words);
    const anotherRound = buildQuestionRound(
      anotherWord,
      [
        createWord({ id: "JA_N_0001", prompt: "ねこ", answer: "고양이", meaning: "고양이" }),
        createWord({ id: "JA_N_0002", prompt: "いぬ", answer: "개", meaning: "개" }),
        anotherWord,
        createWord({ id: "JA_N_0004", prompt: "さかな", answer: "물고기", meaning: "물고기" }),
      ],
    );

    expect(round.choices).toContain("개");
    expect(new Set(round.choices).size).toBe(round.choices.length);
    expect(anotherRound.choices).toContain("새");
    expect(new Set(anotherRound.choices).size).toBe(anotherRound.choices.length);
    expect(round.choices).not.toEqual(anotherRound.choices);
  });

  it("meaning_to_word에서는 정답 표기와 같은 계열 보기를 우선 고른다", () => {
    const currentWord = createWord({
      id: "JA_N_0010",
      prompt: "카드",
      answer: "カード",
      meaning: "카드",
      questionType: "meaning_to_word",
      choices: ["舟", "本", "車", "カード"],
    });
    const words = [
      currentWord,
      createWord({ id: "JA_N_0002", prompt: "책", answer: "本", meaning: "책", questionType: "meaning_to_word" }),
      createWord({ id: "JA_N_0003", prompt: "배", answer: "舟", meaning: "배", questionType: "meaning_to_word" }),
      createWord({ id: "JA_N_0004", prompt: "차", answer: "車", meaning: "차", questionType: "meaning_to_word" }),
      createWord({ id: "JA_N_0005", prompt: "고양이", answer: "ねこ", meaning: "고양이", questionType: "meaning_to_word" }),
    ];

    const round = buildQuestionRound(currentWord, words);

    expect(round.choices).toContain("カード");
    expect(round.choices.some((choice) => ["本", "舟", "車", "ねこ"].includes(choice))).toBe(true);
    expect(round.choices).not.toContain("카드");
  });

  it("길이가 비슷한 보기만 몰지 않고 같은 품질 후보를 공평하게 섞는다", () => {
    const currentWord = createWord({
      id: "JA_N_0200",
      prompt: "かぎ",
      answer: "열쇠",
      meaning: "열쇠",
      choices: ["문", "집", "산", "물"],
    });
    const words = [
      currentWord,
      createWord({ id: "JA_N_0201", prompt: "いえ", answer: "집", meaning: "집", difficulty: "1" }),
      createWord({ id: "JA_N_0202", prompt: "みず", answer: "물", meaning: "물", difficulty: "1" }),
      createWord({ id: "JA_N_0203", prompt: "でんしゃ", answer: "기차", meaning: "기차", difficulty: "1" }),
      createWord({ id: "JA_N_0204", prompt: "としょかん", answer: "도서관", meaning: "도서관", difficulty: "1" }),
      createWord({ id: "JA_N_0205", prompt: "ひこうじょう", answer: "공항", meaning: "공항", difficulty: "1" }),
    ];

    const round = buildQuestionRound(currentWord, words);

    expect(round.choices).toContain("열쇠");
    expect(round.choices.some((choice) => ["기차", "도서관", "공항"].includes(choice))).toBe(true);
  });
});
