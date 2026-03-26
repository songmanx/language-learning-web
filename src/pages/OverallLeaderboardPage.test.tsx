import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { OverallLeaderboardPage } from "./OverallLeaderboardPage";
import { writeGlobalLeaderboard } from "../services/sessionRecovery";
import { useLanguageStore } from "../stores/languageStore";

describe("OverallLeaderboardPage", () => {
  beforeEach(() => {
    window.localStorage.clear();
    useLanguageStore.setState({
      selectedLanguage: "ja",
      availableLanguages: [{ languageCode: "ja", label: "일본어", totalWords: 10 }],
      words: [],
      isLoading: false,
      loadError: null,
    });
  });

  it("shows global top 50 entries filtered by quiz mode", async () => {
    const user = userEvent.setup();

    writeGlobalLeaderboard("ja", [
      {
        playedAt: "2026-03-18T10:00:00.000Z",
        totalTimeSec: 18,
        score: 120,
        quizMode: "kanji_to_meaning",
        playerId: "p1",
        nickname: "Alpha",
      },
      {
        playedAt: "2026-03-17T10:00:00.000Z",
        totalTimeSec: 20,
        score: 99,
        quizMode: "meaning_to_word",
        playerId: "p2",
        nickname: "Beta",
      },
    ]);

    render(
      <MemoryRouter>
        <OverallLeaderboardPage />
      </MemoryRouter>,
    );

    expect(screen.getAllByText("전체 순위표").length).toBeGreaterThan(0);
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.queryByText("Beta")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "뜻 → 단어" }));

    expect(screen.getByText("Beta")).toBeInTheDocument();
  });

  it("moves home from overall leaderboard", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/leaderboard"]}>
        <Routes>
          <Route path="/leaderboard" element={<OverallLeaderboardPage />} />
          <Route path="/home" element={<div>home-route</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: "홈으로 가기" }));

    expect(screen.getByText("home-route")).toBeInTheDocument();
  });
});
