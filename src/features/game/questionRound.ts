import type { QuestionType, WordItem } from "../../services/apiTypes";
import { inferPartOfSpeech } from "./sessionConfig";

export type QuestionRound = {
  questionType: QuestionType;
  prompt: string;
  choices: string[];
  answer: string;
  instruction: string;
  typeLabel: string;
};

const TARGET_CHOICE_COUNT = 4;

const TEXT = {
  chooseMeaning: "뜻을 골라 주세요.",
  chooseWord: "뜻을 보고 단어를 골라 주세요.",
  typeWordToMeaning: "단어 -> 뜻",
  typeMeaningToWord: "뜻 -> 단어",
} as const;

function normalizeChoice(value: string) {
  return String(value ?? "").trim();
}

function getExpectedAnswer(currentWord: WordItem) {
  return currentWord.questionType === "meaning_to_word" ? normalizeChoice(currentWord.prompt) : normalizeChoice(currentWord.answer);
}

function getRoundPrompt(currentWord: WordItem) {
  return currentWord.questionType === "meaning_to_word" ? currentWord.meaning : currentWord.prompt;
}

function getChoiceValue(word: WordItem, questionType: QuestionType) {
  return normalizeChoice(questionType === "meaning_to_word" ? word.prompt : word.answer || word.meaning);
}

function buildAllowedChoiceSet(currentWord: WordItem, words: WordItem[]) {
  const answer = getExpectedAnswer(currentWord);
  const allowedChoices = new Set<string>([answer]);

  for (const word of words) {
    const candidate = getChoiceValue(word, currentWord.questionType);
    if (candidate) {
      allowedChoices.add(candidate);
    }
  }

  return allowedChoices;
}

function rankFallbackChoices(currentWord: WordItem, words: WordItem[]) {
  const answer = getExpectedAnswer(currentWord);
  const currentPartOfSpeech = inferPartOfSpeech(currentWord.id);

  return words
    .map((word, index) => {
      const value = getChoiceValue(word, currentWord.questionType);
      const score =
        (String(word.difficulty || "").trim() === String(currentWord.difficulty || "").trim() ? 3 : 0) +
        (inferPartOfSpeech(word.id) === currentPartOfSpeech ? 2 : 0) +
        (word.questionType === currentWord.questionType ? 1 : 0);

      return { index, score, value };
    })
    .filter(({ value }) => value && value !== answer)
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .map(({ value }) => value);
}

function buildChoices(currentWord: WordItem, words: WordItem[]) {
  const answer = getExpectedAnswer(currentWord);
  const allowedChoices = buildAllowedChoiceSet(currentWord, words);
  const seedChoices = currentWord.choices
    .map(normalizeChoice)
    .filter((choice) => choice && allowedChoices.has(choice));
  const backupSeedChoices = currentWord.choices.map(normalizeChoice).filter(Boolean);
  const fallbackChoices = rankFallbackChoices(currentWord, words);

  const merged = seedChoices.includes(answer)
    ? [...seedChoices, ...fallbackChoices, ...backupSeedChoices]
    : [answer, ...seedChoices, ...fallbackChoices, ...backupSeedChoices];

  const dedupedChoices: string[] = [];
  const seen = new Set<string>();

  for (const choice of merged) {
    const normalizedChoice = normalizeChoice(choice);
    const key = normalizedChoice.toLocaleLowerCase();

    if (!normalizedChoice || seen.has(key)) {
      continue;
    }

    seen.add(key);
    dedupedChoices.push(normalizedChoice);

    if (dedupedChoices.length === TARGET_CHOICE_COUNT) {
      break;
    }
  }

  if (!dedupedChoices.includes(answer)) {
    dedupedChoices.unshift(answer);
  }

  return dedupedChoices.slice(0, TARGET_CHOICE_COUNT);
}

export function buildQuestionRound(currentWord: WordItem, words: WordItem[]): QuestionRound {
  const isMeaningToWord = currentWord.questionType === "meaning_to_word";

  return {
    questionType: currentWord.questionType,
    prompt: getRoundPrompt(currentWord),
    choices: buildChoices(currentWord, words),
    answer: getExpectedAnswer(currentWord),
    instruction: isMeaningToWord ? TEXT.chooseWord : TEXT.chooseMeaning,
    typeLabel: isMeaningToWord ? TEXT.typeMeaningToWord : TEXT.typeWordToMeaning,
  };
}
