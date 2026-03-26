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

function createWordToMeaningWords(count: number): WordItem[] {
  return Array.from({ length: count }, (_, index) => {
    const answer = `뜻${index + 1}`;
    return {
      id: `JA_N_${String(index + 1).padStart(4, "0")}`,
      prompt: `漢字${index + 1}`,
      choices: [answer, `오답A${index + 1}`, `오답B${index + 1}`, `오답C${index + 1}`],
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
      prompt: "고양이",
      choices: ["cat", "bag", "fish", "persimmon"],
      answer: "cat",
      meaning: "cat",
      difficulty: "1",
      questionType: "word_to_meaning",
    },
    {
      id: "JA_N_0002",
      prompt: "가방",
      choices: ["bag", "cat", "fish", "book"],
      answer: "bag",
      meaning: "bag",
      difficulty: "1",
      questionType: "word_to_meaning",
    },
    {
      id: "JA_N_0003",
      prompt: "cat",
      choices: ["猫", "犬", "鳥", "魚"],
      answer: "猫",
      meaning: "cat",
      difficulty: "2",
      questionType: "meaning_to_word",
    },
  ];
}

function createFilterCountWords(): WordItem[] {
  return [
    {
      id: "JA_N_0001",
      prompt: "猫",
      choices: ["고양이", "개", "새", "물고기"],
      answer: "고양이",
      meaning: "고양이",
      difficulty: "1",
      questionType: "word_to_meaning",
    },
    {
      id: "JA_N_0002",
      prompt: "犬",
      choices: ["개", "고양이", "새", "물고기"],
      answer: "개",
      meaning: "개",
      difficulty: "1",
      questionType: "word_to_meaning",
    },
    {
      id: "JA_V_0003",
      prompt: "食べる",
      choices: ["먹다", "보다", "자다", "걷다"],
      answer: "먹다",
      meaning: "먹다",
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
  await user.click(screen.getByRole("button", { name: "게임 시작" }));
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
    await user.click(screen.getByRole("button", { name: new RegExp(answer ?? "") }));

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
    useAuthStore.setState({
      isLoggedIn: true,
      token: "mock-token",
      playerId: "player-demo",
      nickname: "demo",
    });
    useLanguageStore.setState({
      selectedLanguage: "ja",
      availableLanguages: [{ languageCode: "ja", label: "일본어", totalWords: 20 }],
      words: createWordToMeaningWords(20),
      isLoading: false,
      loadError: null,
    });
  });

  it("shows setup first", () => {
    renderPlayFlow();

    expect(screen.getByRole("button", { name: "게임 시작" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "한자 -> 뜻" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "단어1" })).not.toBeInTheDocument();
  });

  it("shows quiz after starting", async () => {
    await startStandardSession();

    expect(await screen.findByRole("heading", { level: 2 })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "초기화" })).not.toBeInTheDocument();
  });

  it("starts the selected meaning-to-word mode", async () => {
    const user = userEvent.setup();
    useLanguageStore.setState({
      selectedLanguage: "ja",
      availableLanguages: [{ languageCode: "ja", label: "일본어", totalWords: 3 }],
      words: createMixedWords(),
      isLoading: false,
      loadError: null,
    });

    renderPlayFlow();
    await user.click(screen.getByRole("button", { name: "뜻 -> 단어" }));
    await user.click(screen.getByRole("button", { name: "게임 시작" }));

    expect(await screen.findByRole("heading", { name: "cat" })).toBeInTheDocument();
  });

  it("shows audio mode as coming soon", () => {
    renderPlayFlow();

    const audioButton = screen
      .getAllByRole("button")
      .find((button) => button.textContent?.includes("음성 -> 뜻"));

    expect(audioButton).toBeTruthy();
    expect(audioButton).toBeDisabled();
  });

  it("disables unavailable difficulty", async () => {
    const user = userEvent.setup();
    useLanguageStore.setState({
      selectedLanguage: "ja",
      availableLanguages: [{ languageCode: "ja", label: "일본어", totalWords: 2 }],
      words: [
        {
          id: "JA_N_0001",
          prompt: "고양이",
          choices: ["cat", "bag", "fish", "persimmon"],
          answer: "cat",
          meaning: "cat",
          difficulty: "1",
          questionType: "word_to_meaning",
        },
        {
          id: "JA_N_0002",
          prompt: "가방",
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
    await user.click(screen.getByRole("button", { name: "한자 -> 뜻" }));

    expect(screen.getByRole("button", { name: "난이도 3+" })).toBeDisabled();
  });

  it("updates setup total count when filters change", async () => {
    const user = userEvent.setup();
    useLanguageStore.setState({
      selectedLanguage: "ja",
      availableLanguages: [{ languageCode: "ja", label: "일본어", totalWords: 3 }],
      words: createFilterCountWords(),
      isLoading: false,
      loadError: null,
    });

    const view = renderPlayFlow();

    expect(view.container.textContent).toContain("3");

    await user.click(screen.getByRole("button", { name: "명사" }));

    await waitFor(() => {
      expect(view.container.textContent).toContain("2");
    });
  });

  it("moves to result after completing 20 questions", async () => {
    const sessionWords = createWordToMeaningWords(20);
    useLanguageStore.setState({
      selectedLanguage: "ja",
      availableLanguages: [{ languageCode: "ja", label: "일본어", totalWords: 20 }],
      words: sessionWords,
      isLoading: false,
      loadError: null,
    });

    const user = await startStandardSession();
    await answerAllQuestions(user, sessionWords, 20);

    expect(await screen.findByRole("heading", { name: "결과 요약" })).toBeInTheDocument();
  }, 15000);

  it("stores pending session after save failure at session end", async () => {
    const sessionWords = createWordToMeaningWords(20);
    useLanguageStore.setState({
      selectedLanguage: "ja",
      availableLanguages: [{ languageCode: "ja", label: "일본어", totalWords: 20 }],
      words: sessionWords,
      isLoading: false,
      loadError: null,
    });

    const user = userEvent.setup();
    setMockGasFailure("saveSession", "save failed");
    renderPlayFlow();

    await user.click(screen.getByRole("button", { name: "게임 시작" }));
    await answerAllQuestions(user, sessionWords, 20);

    expect(await screen.findByRole("heading", { name: "결과 요약" })).toBeInTheDocument();

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
      availableLanguages: [{ languageCode: "ja", label: "일본어", totalWords: 4 }],
      words: [],
      isLoading: false,
      loadError: "단어를 다시 불러와 주세요.",
      loadWords: loadWordsMock,
    });

    renderPlayFlow();

    await waitFor(() => {
      expect(screen.getByText("단어를 다시 불러와 주세요.")).toBeInTheDocument();
    });
    await user.click(screen.getByRole("button", { name: "단어 다시 불러오기" }));

    expect(loadWordsMock).toHaveBeenCalledWith("ja");
  });
});
