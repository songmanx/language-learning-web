import type { QuestionType, WordItem } from "../../services/apiTypes";
import { getWordPromptMode, inferPartOfSpeech } from "./sessionConfig";

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
  chooseMeaning: "뜻을 고르세요",
  chooseWord: "뜻을 보고 단어를 고르세요",
  typeWordToMeaning: "단어 -> 뜻",
  typeMeaningToWord: "뜻 -> 단어",
} as const;

type WordLike = WordItem &
  Partial<{
    word_id: string;
    question_type: QuestionType;
  }>;

function normalizeChoice(value: string) {
  return String(value ?? "").trim();
}

function getWordId(word: WordLike) {
  return String(word.id ?? word.word_id ?? "").trim();
}

function getQuestionType(word: WordLike): QuestionType {
  return (word.questionType ?? word.question_type ?? "word_to_meaning") as QuestionType;
}

function containsKanji(text: string) {
  return /[\u3400-\u4DBF\u4E00-\u9FFF]/u.test(String(text ?? ""));
}

function containsKana(text: string) {
  return /[\u3040-\u30FF]/u.test(String(text ?? ""));
}

function containsHangul(text: string) {
  return /[\uac00-\ud7a3]/u.test(String(text ?? ""));
}

function getScriptType(text: string) {
  if (containsKanji(text)) {
    return "kanji";
  }

  if (containsKana(text)) {
    return "kana";
  }

  return "other";
}

function buildChoiceKey(value: string) {
  return normalizeChoice(value).toLocaleLowerCase();
}

function getExpectedAnswer(currentWord: WordItem) {
  return normalizeChoice(currentWord.answer || currentWord.prompt);
}

function getRoundPrompt(currentWord: WordItem) {
  return getQuestionType(currentWord) === "meaning_to_word"
    ? normalizeChoice(currentWord.meaning)
    : normalizeChoice(currentWord.prompt);
}

function getChoiceValue(word: WordItem, questionType: QuestionType) {
  return normalizeChoice(questionType === "meaning_to_word" ? word.answer || word.prompt : word.answer || word.meaning);
}

function isUsableChoiceValue(value: string, questionType: QuestionType) {
  if (questionType === "word_to_meaning") {
    return containsHangul(value);
  }

  return true;
}

function getMeaningKey(word: WordItem) {
  return normalizeChoice(word.meaning).toLocaleLowerCase();
}

function getFamilyKey(word: WordItem) {
  return `${getWordId(word)}::${getMeaningKey(word)}`.toLocaleLowerCase();
}

function shouldUseWordAsDistractor(currentWord: WordItem, candidateWord: WordItem) {
  if (getFamilyKey(currentWord) === getFamilyKey(candidateWord)) {
    return false;
  }

  if (getQuestionType(candidateWord) !== getQuestionType(currentWord)) {
    return false;
  }

  if (getQuestionType(currentWord) === "word_to_meaning" && getWordPromptMode(candidateWord) !== getWordPromptMode(currentWord)) {
    return false;
  }

  return true;
}

function rankChoiceCandidates(currentWord: WordItem, words: WordItem[]) {
  const answer = getExpectedAnswer(currentWord);
  const prompt = getRoundPrompt(currentWord);
  const answerKey = buildChoiceKey(answer);
  const promptKey = buildChoiceKey(prompt);
  const currentPartOfSpeech = inferPartOfSpeech(getWordId(currentWord));
  const currentDifficulty = String(currentWord.difficulty || "").trim();
  const currentPromptMode = getWordPromptMode(currentWord);
  const answerScriptType = getScriptType(answer);

  return words
    .map((word, index) => {
      const value = getChoiceValue(word, getQuestionType(currentWord));
      const valueKey = buildChoiceKey(value);

      if (!value || !isUsableChoiceValue(value, getQuestionType(currentWord)) || valueKey === answerKey || valueKey === promptKey) {
        return { index, value: "", score: -1 };
      }

      if (!shouldUseWordAsDistractor(currentWord, word)) {
        return { index, value, score: -1 };
      }

      let score = 0;

      if (String(word.difficulty || "").trim() === currentDifficulty) {
        score += 5;
      }

      if (inferPartOfSpeech(getWordId(word)) === currentPartOfSpeech) {
        score += 4;
      }

      if (getWordPromptMode(word) === currentPromptMode) {
        score += 3;
      }

      if (getQuestionType(currentWord) === "meaning_to_word") {
        const choiceScriptType = getScriptType(value);

        if (choiceScriptType === answerScriptType) {
          score += 6;
        } else if (answerScriptType !== "other" && choiceScriptType !== "other") {
          score -= 2;
        }
      }

      return { index, value, score };
    })
    .filter(({ score, value }) => score >= 0 && value)
    .sort((left, right) => right.score - left.score || left.index - right.index);
}

function buildChoiceSeed(currentWord: WordItem) {
  const source = `${getWordId(currentWord)}::${getQuestionType(currentWord)}::${getRoundPrompt(currentWord)}::${getExpectedAnswer(currentWord)}`;
  let hash = 0;

  for (const char of source) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }

  return hash;
}

function buildCandidateSeed(seed: number, value: string, index: number) {
  const source = `${seed}::${index}::${value}`;
  let hash = 0;

  for (const char of source) {
    hash = (hash * 33 + char.charCodeAt(0)) >>> 0;
  }

  return hash;
}

function shuffleChoices(choices: string[], seed: number) {
  const next = [...choices];
  let state = seed || 1;

  for (let index = next.length - 1; index > 0; index -= 1) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const swapIndex = state % (index + 1);
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }

  return next;
}

function orderCandidatesByScore(
  candidates: Array<{ index: number; value: string; score: number }>,
  seed: number,
) {
  const grouped = new Map<number, Array<{ index: number; value: string; score: number }>>();

  for (const candidate of candidates) {
    const bucket = grouped.get(candidate.score) ?? [];
    bucket.push(candidate);
    grouped.set(candidate.score, bucket);
  }

  return [...grouped.entries()]
    .sort((left, right) => right[0] - left[0])
    .flatMap(([, bucket]) =>
      [...bucket]
        .sort(
          (left, right) =>
            buildCandidateSeed(seed, left.value, left.index) - buildCandidateSeed(seed, right.value, right.index),
        )
        .map(({ value }) => value),
    );
}

function buildChoices(currentWord: WordItem, words: WordItem[]) {
  const answer = getExpectedAnswer(currentWord);
  const prompt = getRoundPrompt(currentWord);
  const seed = buildChoiceSeed(currentWord);
  const rankedCandidates = orderCandidatesByScore(rankChoiceCandidates(currentWord, words), seed);
  const seedChoices = currentWord.choices
    .map(normalizeChoice)
    .filter((choice) => choice && isUsableChoiceValue(choice, getQuestionType(currentWord)));
  const merged = [answer, ...rankedCandidates, ...seedChoices];
  const dedupedChoices: string[] = [];
  const seen = new Set<string>();

  for (const choice of merged) {
    const normalizedChoice = normalizeChoice(choice);
    const key = buildChoiceKey(normalizedChoice);

    if (!normalizedChoice || key === buildChoiceKey(prompt) || seen.has(key)) {
      continue;
    }

    seen.add(key);
    dedupedChoices.push(normalizedChoice);

    if (dedupedChoices.length === TARGET_CHOICE_COUNT) {
      break;
    }
  }

  if (!dedupedChoices.some((choice) => buildChoiceKey(choice) === buildChoiceKey(answer))) {
    dedupedChoices.unshift(answer);
  }

  return shuffleChoices(dedupedChoices.slice(0, TARGET_CHOICE_COUNT), seed);
}

export function buildQuestionRound(currentWord: WordItem, words: WordItem[]): QuestionRound {
  const questionType = getQuestionType(currentWord);
  const isMeaningToWord = questionType === "meaning_to_word";

  return {
    questionType,
    prompt: getRoundPrompt(currentWord),
    choices: buildChoices(currentWord, words),
    answer: getExpectedAnswer(currentWord),
    instruction: isMeaningToWord ? TEXT.chooseWord : TEXT.chooseMeaning,
    typeLabel: isMeaningToWord ? TEXT.typeMeaningToWord : TEXT.typeWordToMeaning,
  };
}
