import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PlayPage } from "./PlayPage";
import { ResultPage } from "./ResultPage";
import { clearMockGasFailures, setMockGasFailure } from "../services/apiClient";
import { readPendingSession } from "../services/sessionRecovery";
import { useAuthStore } from "../stores/authStore";
import { useLanguageStore } from "../stores/languageStore";
import type { WordItem } from "../services/apiTypes";

const START_GAME = "\uAC8C\uC784 \uC2DC\uC791";
const RESET = "\uCD08\uAE30\uD654";
const RESULT_SUMMARY = "\uACB0\uACFC \uC694\uC57D";
const MODE_KANJI = "\uD55C\uC790 \u2192 \uB73B";
const MODE_MEANING_KANJI = "\uB73B \u2192 \uD55C\uC790";
const AUDIO = "\uC74C\uC131 \u2192 \uB73B";
const NO_AUDIO_DATA = "\uB370\uC774\uD130 \uC5C6\uC74C";
const JAPANESE = "\uC77C\uBCF8\uC5B4";
const DIFFICULTY_3 = "\uB09C\uC774\uB3C4 3+";
const NOUN = "\uBA85\uC0AC";
const RELOAD_MESSAGE = "\uB2E8\uC5B4\uB97C \uB2E4\uC2DC \uBD88\uB7EC\uC640 \uC8FC\uC138\uC694";
const RELOAD_BUTTON = "\uB2E8\uC5B4 \uB2E4\uC2DC \uBD88\uB7EC\uC624\uAE30";
const REPLAY_AUDIO = "\uB2E4\uC2DC \uB4E3\uAE30";

function createWordToMeaningWords(count: number): WordItem[] {
  return Array.from({ length: count }, (_, index) => {
    const answer = `\uB73B${index + 1}`;
    return {
      id: `JA_N_${String(index + 1).padStart(4, "0")}`,
      prompt: `\u5358\u8A9E${index + 1}`,
      choices: [answer, `\uC624\uB2F5A${index + 1}`, `\uC624\uB2F5B${index + 1}`, `\uC624\uB2F5C${index + 1}`],
      answer,
      meaning: answer,
      difficulty: index < 7 ? "1" : index < 14 ? "2" : "3",
      questionType: "word_to_meaning",
    };
  });
}

function createMixedWords(): WordItem[] {
  return [
    {
      id: "JA_N_0001",
      prompt: "\u732B",
      choices: ["cat", "bag", "fish", "persimmon"],
      answer: "cat",
      meaning: "cat",
      difficulty: "1",
      questionType: "word_to_meaning",
    },
    {
      id: "JA_N_0002",
      prompt: "\u9784",
      choices: ["bag", "cat", "fish", "book"],
      answer: "bag",
      meaning: "bag",
      difficulty: "1",
      questionType: "word_to_meaning",
    },
    {
      id: "JA_N_0003",
      prompt: "cat",
      choices: ["\u732B", "\u72AC", "\u9CE5", "\u9B5A"],
      answer: "\u732B",
      meaning: "cat",
      difficulty: "2",
      questionType: "meaning_to_word",
    },
    {
      id: "JA_N_0004",
      prompt: "cat",
      choices: ["\u306D\u3053", "\u3044\u306C", "\u3068\u308A", "\u3055\u304B\u306A"],
      answer: "\u306D\u3053",
      meaning: "cat",
      difficulty: "2",
      questionType: "meaning_to_word",
    },
  ];
}

function createAudioReadyWords(): WordItem[] {
  return [
    {
      id: "JA_N_0001",
      prompt: "\u306D\u3053",
      choices: ["\uACE0\uC591\uC774", "\uAC1C", "\uC0C8", "\uBB3C\uACE0\uAE30"],
      answer: "\uACE0\uC591\uC774",
      meaning: "\uACE0\uC591\uC774",
      difficulty: "1",
      questionType: "word_to_meaning",
    },
    {
      id: "JA_N_0002",
      prompt: "\u3044\u306C",
      choices: ["\uAC1C", "\uACE0\uC591\uC774", "\uC0C8", "\uBB3C\uACE0\uAE30"],
      answer: "\uAC1C",
      meaning: "\uAC1C",
      difficulty: "1",
      questionType: "word_to_meaning",
    },
  ];
}

function createFilterCountWords(): WordItem[] {
  return [
    {
      id: "JA_N_0001",
      prompt: "\u732B",
      choices: ["\uACE0\uC591\uC774", "\uAC1C", "\uC0C8", "\uBB3C\uACE0\uAE30"],
      answer: "\uACE0\uC591\uC774",
      meaning: "\uACE0\uC591\uC774",
      difficulty: "1",
      questionType: "word_to_meaning",
    },
    {
      id: "JA_N_0002",
      prompt: "\u72AC",
      choices: ["\uAC1C", "\uACE0\uC591\uC774", "\uC0C8", "\uBB3C\uACE0\uAE30"],
      answer: "\uAC1C",
      meaning: "\uAC1C",
      difficulty: "1",
      questionType: "word_to_meaning",
    },
    {
      id: "JA_V_0003",
      prompt: "\u98DF\u3079\u308B",
      choices: ["\uBA39\uB2E4", "\uBCF4\uB2E4", "\uC790\uB2E4", "\uAC77\uB2E4"],
      answer: "\uBA39\uB2E4",
      meaning: "\uBA39\uB2E4",
      difficulty: "2",
      questionType: "word_to_meaning",
    },
  ];
}

function renderPlayFlow(initialEntry = "/play") {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/play" element={<PlayPage />} />
        <Route path="/practice" element={<PlayPage mode="practice" />} />
        <Route path="/result" element={<ResultPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

async function startStandardSession() {
  const user = userEvent.setup();
  renderPlayFlow();
  await user.click(screen.getByRole("button", { name: START_GAME }));
  return user;
}

async function answerAllQuestions(
  user: ReturnType<typeof userEvent.setup>,
  words: WordItem[],
  totalQuestions: number,
) {
  const answerByPrompt = new Map(words.map((word) => [word.prompt, word.answer]));

  for (let index = 0; index < totalQuestions; index += 1) {
    const prompt = (await screen.findByRole("heading", { level: 2 })).textContent ?? "";
    const answer = answerByPrompt.get(prompt);

    expect(answer).toBeTruthy();
    const answerButton = screen
      .getAllByRole("button")
      .find((button) => button.textContent?.trim().endsWith(answer ?? ""));

    expect(answerButton).toBeTruthy();
    await user.click(answerButton!);

    if (index < totalQuestions - 1) {
      await waitFor(() => {
        expect(screen.getByRole("heading", { level: 2 }).textContent).not.toBe(prompt);
      });
    }
  }
}

describe("PlayPage", () => {
  beforeEach(() => {
    window.localStorage.clear();
    clearMockGasFailures();
    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      value: {
        cancel: vi.fn(),
        speak: vi.fn(),
        getVoices: vi.fn(() => []),
      },
    });
    useAuthStore.setState({
      isLoggedIn: true,
      token: "mock-token",
      playerId: "player-demo",
      nickname: "demo",
    });
    useLanguageStore.setState({
      selectedLanguage: "ja",
      availableLanguages: [{ languageCode: "ja", label: JAPANESE, totalWords: 20 }],
      words: createWordToMeaningWords(20),
      isLoading: false,
      loadError: null,
    });
  });

  it("shows setup first", () => {
    renderPlayFlow();

    expect(screen.getByRole("button", { name: START_GAME })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: MODE_KANJI })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "\uB2E8\uC5B41" })).not.toBeInTheDocument();
  });

  it("shows quiz after starting", async () => {
    await startStandardSession();

    expect(await screen.findByRole("heading", { level: 2 })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: RESET })).not.toBeInTheDocument();
  });

  it("starts the selected meaning to kanji mode", async () => {
    const user = userEvent.setup();
    useLanguageStore.setState({
      selectedLanguage: "ja",
      availableLanguages: [{ languageCode: "ja", label: JAPANESE, totalWords: 4 }],
      words: createMixedWords(),
      isLoading: false,
      loadError: null,
    });

    renderPlayFlow();
    await user.click(screen.getByRole("button", { name: MODE_MEANING_KANJI }));
    await user.click(screen.getByRole("button", { name: START_GAME }));

    expect(await screen.findByRole("heading", { name: "cat" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /猫/ })).toBeInTheDocument();
  });

  it("shows audio mode as unavailable when no real data exists", () => {
    renderPlayFlow();

    const audioButton = screen
      .getAllByRole("button")
      .find((button) => (button.textContent ?? "").includes("\uC74C\uC131"));

    expect(audioButton).toBeTruthy();
    expect(audioButton).toBeDisabled();
    expect(audioButton?.textContent ?? "").toContain(NO_AUDIO_DATA);
  });

  it("starts audio mode from furigana words and shows the replay button", async () => {
    const user = userEvent.setup();
    useLanguageStore.setState({
      selectedLanguage: "ja",
      availableLanguages: [{ languageCode: "ja", label: JAPANESE, totalWords: 2 }],
      words: createAudioReadyWords(),
      isLoading: false,
      loadError: null,
    });

    renderPlayFlow();
    await user.click(screen.getByRole("button", { name: AUDIO }));
    await user.click(screen.getByRole("button", { name: START_GAME }));

    expect(await screen.findByRole("button", { name: REPLAY_AUDIO })).toBeInTheDocument();
    expect(screen.getByText("\uC74C\uC131 \uBB38\uC81C")).toBeInTheDocument();
  });

  it("disables unavailable difficulty", async () => {
    const user = userEvent.setup();
    useLanguageStore.setState({
      selectedLanguage: "ja",
      availableLanguages: [{ languageCode: "ja", label: JAPANESE, totalWords: 2 }],
      words: [
        {
          id: "JA_N_0001",
          prompt: "\u732B",
          choices: ["cat", "bag", "fish", "persimmon"],
          answer: "cat",
          meaning: "cat",
          difficulty: "1",
          questionType: "word_to_meaning",
        },
        {
          id: "JA_N_0002",
          prompt: "\u9784",
          choices: ["bag", "cat", "fish", "book"],
          answer: "bag",
          meaning: "bag",
          difficulty: "1",
          questionType: "word_to_meaning",
        },
      ],
      isLoading: false,
      loadError: null,
    });

    renderPlayFlow();
    await user.click(screen.getByRole("button", { name: MODE_KANJI }));

    expect(screen.getByRole("button", { name: DIFFICULTY_3 })).toBeDisabled();
  });

  it("updates setup total count when filters change", async () => {
    const user = userEvent.setup();
    useLanguageStore.setState({
      selectedLanguage: "ja",
      availableLanguages: [{ languageCode: "ja", label: JAPANESE, totalWords: 3 }],
      words: createFilterCountWords(),
      isLoading: false,
      loadError: null,
    });

    renderPlayFlow();

    expect(document.body.textContent ?? "").toMatch(/20\s*\/\s*3/);

    await user.click(screen.getByRole("button", { name: NOUN }));

    await waitFor(() => {
      expect(document.body.textContent ?? "").toMatch(/20\s*\/\s*2/);
    });
  });

  it("moves to result after completing 20 questions", async () => {
    const sessionWords = createWordToMeaningWords(20);
    useLanguageStore.setState({
      selectedLanguage: "ja",
      availableLanguages: [{ languageCode: "ja", label: JAPANESE, totalWords: 20 }],
      words: sessionWords,
      isLoading: false,
      loadError: null,
    });

    const user = await startStandardSession();
    await answerAllQuestions(user, sessionWords, 20);

    expect(await screen.findByRole("heading", { name: RESULT_SUMMARY })).toBeInTheDocument();
  }, 15000);

  it("stores pending session after save failure at session end", async () => {
    const sessionWords = createWordToMeaningWords(20);
    useLanguageStore.setState({
      selectedLanguage: "ja",
      availableLanguages: [{ languageCode: "ja", label: JAPANESE, totalWords: 20 }],
      words: sessionWords,
      isLoading: false,
      loadError: null,
    });

    const user = userEvent.setup();
    setMockGasFailure("saveSession", "save failed");
    renderPlayFlow();

    await user.click(screen.getByRole("button", { name: START_GAME }));
    await answerAllQuestions(user, sessionWords, 20);

    expect(await screen.findByRole("heading", { name: RESULT_SUMMARY })).toBeInTheDocument();

    await waitFor(() => {
      const pending = readPendingSession("player-demo", "ja");
      expect(pending?.reason).toBe("save failed");
      expect(pending?.payload.score).toBe(620);
      expect(pending?.payload.totalQuestions).toBe(20);
    });
  }, 15000);

  it("shows reload action when load fails", async () => {
    const user = userEvent.setup();
    const loadWordsMock = vi.fn().mockResolvedValue(undefined);

    useLanguageStore.setState({
      selectedLanguage: "ja",
      availableLanguages: [{ languageCode: "ja", label: JAPANESE, totalWords: 4 }],
      words: [],
      isLoading: false,
      loadError: RELOAD_MESSAGE,
      loadWords: loadWordsMock,
    });

    renderPlayFlow();

    await waitFor(() => {
      expect(screen.getByText(RELOAD_MESSAGE)).toBeInTheDocument();
    });
    await user.click(screen.getByRole("button", { name: RELOAD_BUTTON }));

    expect(loadWordsMock).toHaveBeenCalledWith("ja");
  });
});
