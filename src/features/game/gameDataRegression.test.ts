import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { mapWordItem } from "../../services/gasMappers";
import type { WordItemDto } from "../../services/apiTypes";
import {
  DEFAULT_SESSION_CONFIG,
  filterWordsBySessionConfig,
  getAvailableDifficultyFilters,
  getAvailablePartOfSpeechFilters,
  getAvailableQuizModes,
} from "./sessionConfig";
import { buildQuestionRound } from "./questionRound";

function loadJapaneseWords() {
  const filePath = path.resolve(process.cwd(), "public/data/ja/words.json");
  const raw = JSON.parse(fs.readFileSync(filePath, "utf8")) as WordItemDto[];
  return raw.map(mapWordItem);
}

describe("game data regression", () => {
  const words = loadJapaneseWords();

  it("실데이터 라운드는 정답 누락, 보기 중복, 보기 부족이 없어야 한다", () => {
    for (const word of words) {
      const round = buildQuestionRound(word, words);
      const choiceKeys = new Set(round.choices.map((choice) => choice.trim().toLocaleLowerCase()));

      expect(round.choices).toHaveLength(4);
      expect(choiceKeys.size).toBe(round.choices.length);
      expect(round.choices).toContain(round.answer);
      expect(round.choices.map((choice) => choice.trim().toLocaleLowerCase())).not.toContain(
        round.prompt.trim().toLocaleLowerCase(),
      );

      if (round.questionType === "meaning_to_word") {
        expect(round.choices.some((choice) => /[\uac00-\ud7a3]/u.test(choice))).toBe(false);
      }

    }
  });

  it("실제 플레이에 들어가는 word_to_meaning 문제는 한국어 뜻 보기만 사용해야 한다", () => {
    const playableWordToMeaning = [
      ...filterWordsBySessionConfig(words, {
        ...DEFAULT_SESSION_CONFIG,
        quizMode: "kanji_to_meaning",
      }),
      ...filterWordsBySessionConfig(words, {
        ...DEFAULT_SESSION_CONFIG,
        quizMode: "furigana_to_meaning",
      }),
      ...filterWordsBySessionConfig(words, {
        ...DEFAULT_SESSION_CONFIG,
        quizMode: "audio_to_meaning",
      }),
    ];

    for (const word of playableWordToMeaning.filter((item) => item.questionType === "word_to_meaning")) {
      const round = buildQuestionRound(word, words);

      expect(round.answer).toMatch(/[\uac00-\ud7a3]/u);
      expect(round.choices.every((choice) => /[\uac00-\ud7a3]/u.test(choice))).toBe(true);
    }
  });

  it("실데이터에서 제공 가능한 출제 방식과 품사/난이도 조합은 실제 문제를 남겨야 한다", () => {
    const quizModes = getAvailableQuizModes(words, {
      partOfSpeech: "all",
      difficulty: "all",
    });

    for (const quizMode of quizModes) {
      const filteredByMode = filterWordsBySessionConfig(words, {
        ...DEFAULT_SESSION_CONFIG,
        quizMode,
      });

      expect(filteredByMode.length).toBeGreaterThan(0);

      const availablePartOfSpeechFilters = getAvailablePartOfSpeechFilters(words, {
        difficulty: "all",
        quizMode,
      });

      for (const partOfSpeech of availablePartOfSpeechFilters.filter((value) => value !== "all")) {
        const availableDifficultyFilters = getAvailableDifficultyFilters(words, {
          partOfSpeech,
          quizMode,
        });

        for (const difficulty of availableDifficultyFilters.filter((value) => value !== "all")) {
          const filtered = filterWordsBySessionConfig(words, {
            partOfSpeech,
            difficulty,
            quizMode,
          });

          expect(filtered.length).toBeGreaterThan(0);
        }
      }
    }
  });
});
