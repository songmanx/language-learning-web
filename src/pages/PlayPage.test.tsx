import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { ResultPage } from "./ResultPage";
import { PlayPage } from "./PlayPage";
import { clearMockGasFailures, setMockGasFailure } from "../services/apiClient";
import { readPendingSession } from "../services/sessionRecovery";
import { useAuthStore } from "../stores/authStore";
import { useLanguageStore } from "../stores/languageStore";

const TEXT = {
  practiceMode: "연습 모드",
  practiceDescription: "가볍게 감각을 올리는 연습 세션",
  answer: "고양이",
  meaningToWordLabel: "뜻 -> 단어",
  chooseWord: "뜻을 보고 단어를 골라 주세요.",
  dog: "개",
  reviewPreview: "복습 상태 미리보기",
  saving: "세션 저장 중",
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

function getFirstAnswerButton(name: string) {
  return screen.getAllByRole("button", { name })[0]!;
}

describe("PlayPage flow", () => {
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
          id: "ja-1",
          prompt: "ねこ",
          choices: [TEXT.answer, "개", "새", "물고기"],
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

  it("정답 선택 후 결과 화면으로 이동하고 저장 완료 상태를 보여준다", async () => {
    const user = userEvent.setup();
    renderPlayFlow();

    await user.click(getFirstAnswerButton(TEXT.answer));

    await screen.findByText(TEXT.saving);
    await screen.findByText(TEXT.reviewPreview);
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("1 / 1")).toBeInTheDocument();
  });

  it("연습 모드로 진입하면 구분 배지를 보여준다", () => {
    renderPlayFlow("/practice");

    expect(screen.getByText(TEXT.practiceMode)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(TEXT.practiceDescription))).toBeInTheDocument();
  });

  it("뜻 -> 단어 문제 유형을 렌더링할 수 있다", async () => {
    const user = userEvent.setup();
    useLanguageStore.setState({
      selectedLanguage: "ja",
      availableLanguages: [{ languageCode: "ja", label: "일본어", totalWords: 4 }],
      words: [
        {
          id: "ja-1",
          prompt: "ねこ",
          choices: [TEXT.answer, "새", "물고기", TEXT.dog],
          answer: TEXT.answer,
          meaning: TEXT.answer,
          difficulty: "1",
          questionType: "word_to_meaning",
        },
        {
          id: "ja-4",
          prompt: "いぬ",
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

    await user.click(getFirstAnswerButton(TEXT.answer));

    expect(screen.getByText((content) => content.includes(TEXT.meaningToWordLabel))).toBeInTheDocument();
    expect(screen.getByText(TEXT.chooseWord)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: TEXT.dog })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "いぬ" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: TEXT.dog })).not.toBeInTheDocument();
  });

  it("저장 실패 시 결과 화면에 임시 저장 안내를 보여주고 pending session을 남긴다", async () => {
    const user = userEvent.setup();
    setMockGasFailure("saveSession", "save failed");
    renderPlayFlow();

    await user.click(getFirstAnswerButton(TEXT.answer));

    await screen.findByText(/save failed/);
    expect(screen.getByText(TEXT.reviewPreview)).toBeInTheDocument();

    await waitFor(() => {
      const pending = readPendingSession("player-demo", "ja");
      expect(pending?.reason).toBe("save failed");
      expect(pending?.payload.score).toBe(12);
    });
  });
});
