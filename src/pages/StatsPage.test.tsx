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

const MODE_MEANING_KANJI = "\uB73B \u2192 \uD55C\uC790";

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
      availableLanguages: [{ languageCode: "ja", label: "\uC77C\uBCF8\uC5B4", totalWords: 10 }],
      words: [],
      isLoading: false,
      loadError: null,
    });
    writeSessionConfigSnapshot("player-demo", "ja", {
      partOfSpeech: "noun",
      difficulty: "2",
      quizMode: "meaning_to_kanji",
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
        quizMode: "meaning_to_kanji",
      },
    ]);

    render(
      <MemoryRouter>
        <StatsPage />
      </MemoryRouter>,
    );

    const headings = screen.getAllByRole("heading");
    expect(headings[1]).toHaveTextContent("\uC131\uACFC \uC694\uC57D");
    expect(headings[2]).toHaveTextContent("\uC21C\uC704\uD45C");
    expect(headings[3]).toHaveTextContent("\uBC14\uB85C \uC774\uB3D9");
    expect(screen.getByText("\uB204\uC801 \uC9D1\uACC4 \uC644\uB8CC")).toBeInTheDocument();

    expect(screen.getAllByText("42").length).toBeGreaterThan(0);
    expect(screen.queryByText("35")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: MODE_MEANING_KANJI }));

    expect(screen.getByText("35")).toBeInTheDocument();
  });

  it("shows empty stats and empty leaderboard messages without snapshot", () => {
    render(
      <MemoryRouter>
        <StatsPage />
      </MemoryRouter>,
    );

    expect(screen.getByText(/\uC544\uC9C1 \uC313\uC778 \uD1B5\uACC4\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4/)).toBeInTheDocument();
    expect(screen.getByText("\uC544\uC9C1 \uAE30\uB85D\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.")).toBeInTheDocument();
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

    await user.click(screen.getByRole("button", { name: "\uD648" }));

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

    await user.click(screen.getByRole("button", { name: "\uD50C\uB808\uC774" }));

    expect(screen.getByText("meaning_to_kanji")).toBeInTheDocument();
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

    await user.click(screen.getByRole("button", { name: "\uB0B4 \uAE30\uB85D \uC0AD\uC81C" }));

    expect(readDailyStatsSnapshot("player-demo", "ja")).toBeNull();
    confirmSpy.mockRestore();
  });
});
