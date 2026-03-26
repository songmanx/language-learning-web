import type { WordItem } from "../../services/apiTypes";

export const mockJapaneseWords: WordItem[] = [
  {
    id: "ja-1",
    prompt: "\u306D\u3053",
    choices: ["\uACE0\uC591\uC774", "\uAC1C", "\uC0C8", "\uBB3C\uACE0\uAE30"],
    answer: "\uACE0\uC591\uC774",
    meaning: "\uACE0\uC591\uC774",
    difficulty: "1",
    questionType: "word_to_meaning",
  },
  {
    id: "ja-2",
    prompt: "\u307F\u305A",
    choices: ["\uBD88", "\uD759", "\uBB3C", "\uBC14\uB78C"],
    answer: "\uBB3C",
    meaning: "\uBB3C",
    difficulty: "1",
    questionType: "word_to_meaning",
  },
  {
    id: "ja-3",
    prompt: "\u3042\u3055",
    choices: ["\uBC24", "\uC810\uC2EC", "\uC544\uCE68", "\uC800\uB141"],
    answer: "\uC544\uCE68",
    meaning: "\uC544\uCE68",
    difficulty: "2",
    questionType: "word_to_meaning",
  },
  {
    id: "ja-4",
    prompt: "\u3044\u306C",
    choices: ["\uACE0\uC591\uC774", "\uAC1C", "\uC0C8", "\uBB3C\uACE0\uAE30"],
    answer: "\uAC1C",
    meaning: "\uAC1C",
    difficulty: "1",
    questionType: "meaning_to_word",
  },
];

export const mockEnglishWords: WordItem[] = [
  {
    id: "EN_N_0001",
    prompt: "apple",
    choices: ["사과", "바나나", "포도", "딸기"],
    answer: "사과",
    meaning: "사과",
    difficulty: "1",
    questionType: "word_to_meaning",
  },
  {
    id: "EN_N_0002",
    prompt: "school",
    choices: ["학교", "도서관", "병원", "집"],
    answer: "학교",
    meaning: "학교",
    difficulty: "1",
    questionType: "word_to_meaning",
  },
  {
    id: "EN_V_0003",
    prompt: "먹다",
    choices: ["eat", "run", "sleep", "read"],
    answer: "eat",
    meaning: "먹다",
    difficulty: "2",
    questionType: "meaning_to_word",
  },
];
