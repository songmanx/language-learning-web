import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StatsPage } from "./StatsPage";
import {
  readDailyStatsSnapshot,
  writeDailyStatsSnapshot,
  writeLeaderboard,
  writeSessionConfigSnapshot,
} from "../services/sessionRecovery";
import { useAuthStore } from "../stores/authStore";
import { useLanguageStore } from "../stores/languageStore";

function RouteProbe() {
  const location = useLocation();
  const state = location.state as { sessionConfig?: { quizMode?: string } } | null;

  return <div>{state?.sessionConfig?.quizMode ?? "no-config"}</div>;
}

describe("StatsPage", () => {
  beforeEach(() => {
    window.localStorage.clear();
    useAuthStore.setState({
      isLoggedIn: true,
      token: "mock-token",
      playerId: "player-demo",
      nickname: "demo",
    });
    useLanguageStore.setState({
      selectedLanguage: "ja",
      availableLanguages: [{ languageCode: "ja", label: "일본어", totalWords: 10 }],
      words: [],
      isLoading: false,
      loadError: null,
    });
    writeSessionConfigSnapshot("player-demo", "ja", {
      partOfSpeech: "noun",
      difficulty: "2",
      quizMode: "meaning_to_word",
    });
  });

  it("shows reordered sections with quiz-mode leaderboard filtering", async () => {
    const user = userEvent.setup();

    writeDailyStatsSnapshot("player-demo", "ja", {
      sessionCount: 3,
      practiceSessionCount: 1,
      totalScore: 86,
      bestScore: 42,
      totalQuestions: 10,
      correctAnswers: 8,
      averageAccuracy: 80,
      lastPlayedAt: "2026-03-18T10:00:00.000Z",
    });
    writeLeaderboard("player-demo", "ja", [
      {
        playedAt: "2026-03-18T10:00:00.000Z",
        totalTimeSec: 18,
        score: 42,
        quizMode: "kanji_to_meaning",
      },
      {
        playedAt: "2026-03-17T10:00:00.000Z",
        totalTimeSec: 20,
        score: 35,
        quizMode: "meaning_to_word",
      },
    ]);

    render(
      <MemoryRouter>
        <StatsPage />
      </MemoryRouter>,
    );

    const headings = screen.getAllByRole("heading");
    expect(headings[1]).toHaveTextContent("성과 요약");
    expect(headings[2]).toHaveTextContent("순위표");
    expect(headings[3]).toHaveTextContent("바로 이동");
    expect(screen.getByText("누적 집계 완료")).toBeInTheDocument();

    expect(screen.getAllByText("42").length).toBeGreaterThan(0);
    expect(screen.queryByText("35")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "뜻 → 단어" }));

    expect(screen.getByText("35")).toBeInTheDocument();
  });

  it("shows empty stats and empty leaderboard messages without snapshot", () => {
    render(
      <MemoryRouter>
        <StatsPage />
      </MemoryRouter>,
    );

    expect(screen.getByText(/아직 표시할 통계가 없습니다/)).toBeInTheDocument();
    expect(screen.getByText("아직 기록이 없습니다.")).toBeInTheDocument();
  });

  it("moves home from stats", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/stats"]}>
        <Routes>
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/home" element={<div>home-route</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: "홈" }));

    expect(screen.getByText("home-route")).toBeInTheDocument();
  });

  it("passes session config when replay starts", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/stats"]}>
        <Routes>
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/play" element={<RouteProbe />} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: "플레이" }));

    expect(screen.getByText("meaning_to_word")).toBeInTheDocument();
  });

  it("clears only the current player's saved progress when confirmed", async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);

    writeDailyStatsSnapshot("player-demo", "ja", {
      sessionCount: 3,
      practiceSessionCount: 1,
      totalScore: 86,
      bestScore: 42,
      totalQuestions: 10,
      correctAnswers: 8,
      averageAccuracy: 80,
      lastPlayedAt: "2026-03-18T10:00:00.000Z",
    });

    render(
      <MemoryRouter>
        <StatsPage />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: "내 기록 삭제" }));

    expect(readDailyStatsSnapshot("player-demo", "ja")).toBeNull();
    confirmSpy.mockRestore();
  });
});
