import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { HomePage } from "./HomePage";
import { clearMockGasFailures } from "../services/apiClient";
import {
  readPendingSession,
  writePendingSession,
  writeSessionConfigSnapshot,
} from "../services/sessionRecovery";
import { useAuthStore } from "../stores/authStore";
import { useLanguageStore } from "../stores/languageStore";

const pendingPayload = {
  playerId: "player-demo",
  languageCode: "ja",
  modeType: "standard" as const,
  quizType: "word_to_meaning" as const,
  totalTimeSec: 5,
  score: 42,
  heartsLeft: 2,
  totalQuestions: 3,
  correctAnswers: 2,
  answerLog: [],
  reviewState: [],
};

const TEXT = {
  pendingSession: "임시 저장된 세션이 있습니다.",
  retrySave: "임시 저장 세션 다시 저장",
  retrySuccess: "임시 저장된 세션을 정상적으로 다시 저장했습니다.",
  practiceStart: "연습 모드 시작",
  mockNotice: "현재는 mock 모드라서 실제 Google Sheets에 저장되지 않습니다.",
  selectedLanguage: "선택 언어",
  lastLoadout: "마지막 세션 구성",
} as const;

function PracticeRouteProbe() {
  const location = useLocation();
  const state = location.state as { sessionConfig?: { quizMode?: string } } | null;

  return <div>{state?.sessionConfig?.quizMode ?? "no-config"}</div>;
}

describe("HomePage", () => {
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
      availableLanguages: [{ languageCode: "ja", label: "일본어", totalWords: 3 }],
      words: [
        {
          id: "ja-1",
          prompt: "ねこ",
          choices: ["고양이", "개", "새", "물고기"],
          answer: "고양이",
          meaning: "고양이",
          difficulty: "1",
          questionType: "word_to_meaning",
        },
      ],
      isLoading: false,
      loadError: null,
    });
    writePendingSession("player-demo", "ja", pendingPayload, "save failed");
    writeSessionConfigSnapshot("player-demo", "ja", {
      partOfSpeech: "noun",
      difficulty: "2",
      quizMode: "meaning_to_word",
    });
  });

  it("임시 저장 세션을 다시 저장하면 pending session을 지운다", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    expect(screen.getByText(TEXT.pendingSession)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: TEXT.retrySave }));

    await screen.findByText(TEXT.retrySuccess);

    await waitFor(() => {
      expect(readPendingSession("player-demo", "ja")).toBeNull();
    });
  });

  it("마지막 세션 구성에는 품사/난이도/출제만 보여준다", () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    expect(screen.getByText(TEXT.mockNotice)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`${TEXT.selectedLanguage}:\\s*일본어`))).toBeInTheDocument();
    expect(screen.getByText(TEXT.lastLoadout)).toBeInTheDocument();
    expect(screen.getByText(/출제: 뜻 -> 단어/)).toBeInTheDocument();
    expect(screen.queryByText(/흐름:/)).not.toBeInTheDocument();
  });

  it("홈 화면에서 연습 모드 진입 시 마지막 세션 구성을 전달한다", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/home"]}>
        <Routes>
          <Route path="/home" element={<HomePage />} />
          <Route path="/practice" element={<PracticeRouteProbe />} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: TEXT.practiceStart }));

    expect(screen.getByText("meaning_to_word")).toBeInTheDocument();
  });
});
