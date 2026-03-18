import type { QuestionType, WordItem } from "../../services/apiTypes";

export type QuestionRound = {
  questionType: QuestionType;
  prompt: string;
  choices: string[];
  answer: string;
  instruction: string;
  typeLabel: string;
};

const TEXT = {
  chooseMeaning: "\uB73B\uC744 \uACE8\uB77C \uC8FC\uC138\uC694.",
  chooseWord: "\uB73B\uC744 \uBCF4\uACE0 \uB2E8\uC5B4\uB97C \uACE8\uB77C \uC8FC\uC138\uC694.",
  typeWordToMeaning: "\uB2E8\uC5B4 -> \uB73B",
  typeMeaningToWord: "\uB73B -> \uB2E8\uC5B4",
} as const;

export function buildQuestionRound(currentWord: WordItem, words: WordItem[]): QuestionRound {
  if (currentWord.questionType === "meaning_to_word") {
    return {
      questionType: currentWord.questionType,
      prompt: currentWord.meaning,
      choices: currentWord.choices,
      answer: currentWord.prompt,
      instruction: TEXT.chooseWord,
      typeLabel: TEXT.typeMeaningToWord,
    };
  }

  return {
    questionType: currentWord.questionType,
    prompt: currentWord.prompt,
    choices: currentWord.choices,
    answer: currentWord.answer,
    instruction: TEXT.chooseMeaning,
    typeLabel: TEXT.typeWordToMeaning,
  };
}
