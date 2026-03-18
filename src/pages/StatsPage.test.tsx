import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { StatsPage } from "./StatsPage";
import { writeDailyStatsSnapshot } from "../services/sessionRecovery";
import { useAuthStore } from "../stores/authStore";
import { useLanguageStore } from "../stores/languageStore";

const TEXT = {
  statsTitle: "\uAE30\uBCF8 \uD1B5\uACC4",
  totalSessions: "\uB204\uC801 \uC138\uC158",
  noStats: "\uD45C\uC2DC\uD560 \uD1B5\uACC4\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4",
  backHome: "\uD648\uC73C\uB85C \uB3CC\uC544\uAC00\uAE30",
  selectedLanguage: "\uC120\uD0DD \uC5B8\uC5B4",
} as const;

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
  });

  it("저장된 통계 스냅샷을 기본 카드로 보여준다", () => {
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

    expect(screen.getByRole("heading", { name: TEXT.statsTitle })).toBeInTheDocument();
    expect(screen.getByText(TEXT.totalSessions)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`${TEXT.selectedLanguage}:\\s*일본어`))).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("80%")).toBeInTheDocument();
  });

  it("통계가 없으면 안내 문구를 보여준다", () => {
    render(
      <MemoryRouter>
        <StatsPage />
      </MemoryRouter>,
    );

    expect(screen.getByText(new RegExp(TEXT.noStats))).toBeInTheDocument();
  });

  it("홈으로 돌아가기 버튼으로 이동한다", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/stats"]}>
        <Routes>
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/home" element={<div>home-route</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: TEXT.backHome }));

    expect(screen.getByText("home-route")).toBeInTheDocument();
  });
});
