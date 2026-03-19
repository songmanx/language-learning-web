import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResultPage } from "./ResultPage";
import { PlayPage } from "./PlayPage";
import { apiClient, clearMockGasFailures, setMockGasFailure } from "../services/apiClient";
import { readPendingSession } from "../services/sessionRecovery";
import { useAuthStore } from "../stores/authStore";
import { useLanguageStore } from "../stores/languageStore";

const TEXT = {
  answer: "고양이",
  dog: "개",
  reviewPreview: "복습 상태 미리보기",
  checkingAnswer: "답변 확인 중...",
  correctAnswer: "정답이에요!",
  incorrectAnswer: "오답이었어요. 다음 문제로 넘어갈게요.",
  correctAnswerLabel: "정답",
  sessionProgressLabel: "세션 진행",
  selectedAnswerLabel: "선택한 답",
  setupTitle: "게임 설정",
  setupReset: "기본 구성 복원",
  startGame: "게임 시작",
  startPractice: "연습 시작",
  quizModeMeaningToWord: "뜻 -> 단어",
  quizModeKanjiToMeaning: "단어(한자) -> 뜻",
  availableWords: "필터 일치 문항",
  reloadWords: "단어 다시 불러오기",
  reloadingWords: "단어 다시 불러오는 중...",
  moveHome: "홈으로 이동",
  loadError: "단어를 다시 불러와 주세요.",
  missingLanguage: "선택한 언어 정보가 없어 홈에서 다시 시작해 주세요.",
  finalQuestion: "마지막 문제",
} as const;

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

function getChoiceButtons() {
  return screen
    .getAllByRole("button")
    .filter((button) => button.className.includes("min-h-16") || button.className.includes("min-h-20"));
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
      availableLanguages: [{ languageCode: "ja", label: "일본어", totalWords: 4 }],
      words: [
        {
          id: "JA_N_0001",
          prompt: "猫",
          choices: [TEXT.answer, "새", "물고기", TEXT.dog],
          answer: TEXT.answer,
          meaning: TEXT.answer,
          difficulty: "1",
          questionType: "word_to_meaning",
        },
      ],
      isLoading: false,
      loadError: null,
    });
  });

  it("플레이 진입 시 설정 화면이 먼저 보이고 문제 흐름 옵션은 없다", () => {
    renderPlayFlow();

    expect(screen.getByText(TEXT.setupTitle)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: TEXT.startGame })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: TEXT.quizModeKanjiToMeaning })).toBeInTheDocument();
    expect(screen.queryByText("문제 흐름")).not.toBeInTheDocument();
    expect(screen.queryByText("혼합 출제")).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "猫" })).not.toBeInTheDocument();
  });

  it("게임 시작 후에는 설정 패널 없이 게임만 보여준다", async () => {
    const user = userEvent.setup();
    renderPlayFlow();

    await user.click(screen.getByRole("button", { name: TEXT.startGame }));

    expect(await screen.findByRole("heading", { name: "猫" })).toBeInTheDocument();
    expect(screen.queryByText(TEXT.setupTitle)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: TEXT.setupReset })).not.toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: TEXT.sessionProgressLabel })).toHaveAttribute("aria-valuetext", "1 / 1");
    expect(screen.getByText(TEXT.finalQuestion)).toBeInTheDocument();
  });

  it("뜻 -> 단어를 선택하면 해당 문제만 시작한다", async () => {
    const user = userEvent.setup();
    useLanguageStore.setState({
      selectedLanguage: "ja",
      availableLanguages: [{ languageCode: "ja", label: "일본어", totalWords: 4 }],
      words: [
        {
          id: "JA_N_0001",
          prompt: "猫",
          choices: [TEXT.answer, "새", "물고기", TEXT.dog],
          answer: TEXT.answer,
          meaning: TEXT.answer,
          difficulty: "1",
          questionType: "word_to_meaning",
        },
        {
          id: "JA_N_0002",
          prompt: TEXT.dog,
          choices: ["いぬ", "ねこ", "とり", "さかな"],
          answer: "いぬ",
          meaning: TEXT.dog,
          difficulty: "2",
          questionType: "meaning_to_word",
        },
      ],
      isLoading: false,
      loadError: null,
    });

    renderPlayFlow();

    await user.click(screen.getByRole("button", { name: TEXT.quizModeMeaningToWord }));
    await user.click(screen.getByRole("button", { name: TEXT.startGame }));

    expect(await screen.findByRole("heading", { name: TEXT.dog })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "猫" })).not.toBeInTheDocument();
  });

  it("정답 선택 후 결과 화면으로 이동한다", async () => {
    const user = userEvent.setup();
    renderPlayFlow();

    await user.click(screen.getByRole("button", { name: TEXT.startGame }));
    await user.click(screen.getByRole("button", { name: new RegExp(TEXT.answer) }));

    expect(await screen.findByText(TEXT.reviewPreview)).toBeInTheDocument();
  });

  it("오답 선택 시 정답 안내를 보여준다", async () => {
    const user = userEvent.setup();
    useLanguageStore.setState({
      selectedLanguage: "ja",
      availableLanguages: [{ languageCode: "ja", label: "일본어", totalWords: 4 }],
      words: [
        {
          id: "JA_N_0001",
          prompt: "猫",
          choices: [TEXT.answer, "새", "물고기", TEXT.dog],
          answer: TEXT.answer,
          meaning: TEXT.answer,
          difficulty: "1",
          questionType: "word_to_meaning",
        },
        {
          id: "JA_N_0002",
          prompt: "犬",
          choices: ["개", "새", "물고기", "고양이"],
          answer: "개",
          meaning: "개",
          difficulty: "1",
          questionType: "word_to_meaning",
        },
      ],
      isLoading: false,
      loadError: null,
    });

    renderPlayFlow();
    await user.click(screen.getByRole("button", { name: TEXT.startGame }));

    const wrongButton = getChoiceButtons().find((button) => !button.textContent?.includes(TEXT.answer));
    expect(wrongButton).toBeDefined();
    await user.click(wrongButton!);

    expect(screen.getByText(TEXT.incorrectAnswer)).toBeInTheDocument();
    expect(screen.getByText(`${TEXT.correctAnswerLabel}: ${TEXT.answer}`)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`^${TEXT.selectedAnswerLabel}:`))).toBeInTheDocument();
  });

  it("저장 실패 시 pending session을 남긴다", async () => {
    const user = userEvent.setup();
    setMockGasFailure("saveSession", "save failed");
    renderPlayFlow();

    await user.click(screen.getByRole("button", { name: TEXT.startGame }));
    await user.click(screen.getByRole("button", { name: new RegExp(TEXT.answer) }));

    await screen.findByText(/save failed/);

    await waitFor(() => {
      const pending = readPendingSession("player-demo", "ja");
      expect(pending?.reason).toBe("save failed");
      expect(pending?.payload.score).toBe(12);
    });
  });

  it("단어가 비어 있고 로드 오류가 있으면 재시도 화면을 보여준다", async () => {
    const user = userEvent.setup();
    const loadWordsMock = vi.fn().mockResolvedValue(undefined);

    useLanguageStore.setState({
      selectedLanguage: "ja",
      availableLanguages: [{ languageCode: "ja", label: "일본어", totalWords: 4 }],
      words: [],
      isLoading: false,
      loadError: TEXT.loadError,
      loadWords: loadWordsMock,
    });

    renderPlayFlow();

    await waitFor(() => {
      expect(screen.getByText(TEXT.loadError)).toBeInTheDocument();
    });
    await user.click(screen.getByRole("button", { name: TEXT.reloadWords }));

    expect(loadWordsMock).toHaveBeenCalledWith("ja");
  });

  it("선택 언어가 없으면 홈으로 이동 버튼만 보여준다", async () => {
    useLanguageStore.setState({
      selectedLanguage: null,
      availableLanguages: [],
      words: [],
      isLoading: false,
      loadError: null,
    });

    renderPlayFlow();

    await waitFor(() => {
      expect(screen.getByText(TEXT.missingLanguage)).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: TEXT.moveHome })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: TEXT.reloadWords })).not.toBeInTheDocument();
  });

  it("단어 재시도 로딩 중이면 버튼 문구가 바뀐다", async () => {
    useLanguageStore.setState({
      selectedLanguage: "ja",
      availableLanguages: [{ languageCode: "ja", label: "일본어", totalWords: 4 }],
      words: [],
      isLoading: true,
      loadError: TEXT.loadError,
    });

    renderPlayFlow();

    await waitFor(() => {
      expect(screen.getByText(TEXT.loadError)).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: TEXT.reloadingWords })).toBeDisabled();
  });
});
