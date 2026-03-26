import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { HomePage } from "./HomePage";
import { clearMockGasFailures, setMockGasFailure } from "../services/apiClient";
import { readPendingSession, writePendingSession, writeSessionConfigSnapshot } from "../services/sessionRecovery";
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
          prompt: "猫",
          choices: ["고양이", "가방", "책", "물고기"],
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

  it("retries a pending session save and clears local pending data", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    expect(screen.getByText("임시 저장된 세션이 있습니다.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "임시 저장 세션 다시 저장" }));

    await screen.findByText("임시 저장된 세션을 정상적으로 다시 저장했습니다.");

    await waitFor(() => {
      expect(readPendingSession("player-demo", "ja")).toBeNull();
    });
  });

  it("shows readable retry error for network failure", async () => {
    const user = userEvent.setup();
    setMockGasFailure("saveSession", "Failed to fetch");

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: "임시 저장 세션 다시 저장" }));

    await screen.findByText(/저장 서버에 연결하지 못했습니다/);

    expect(readPendingSession("player-demo", "ja")).not.toBeNull();
  });

  it("shows readable message for pending failed-to-fetch reason", () => {
    writePendingSession("player-demo", "ja", pendingPayload, "Failed to fetch");

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    expect(screen.getByText(/저장 서버에 연결하지 못했습니다/)).toBeInTheDocument();
  });

  it("hides the last session config card", () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    expect(screen.getByText(/선택 언어:\s*일본어/)).toBeInTheDocument();
    expect(screen.queryByText("마지막 세션 구성")).not.toBeInTheDocument();
  });

  it("passes the last session config when practice starts", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/home"]}>
        <Routes>
          <Route path="/home" element={<HomePage />} />
          <Route path="/practice" element={<PracticeRouteProbe />} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: "연습 모드 시작" }));

    expect(screen.getByText("meaning_to_word")).toBeInTheDocument();
  });

  it("moves to overall leaderboard from home", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/home"]}>
        <Routes>
          <Route path="/home" element={<HomePage />} />
          <Route path="/leaderboard" element={<div>leaderboard-route</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: "전체 순위표" }));

    expect(screen.getByText("leaderboard-route")).toBeInTheDocument();
  });
});
