import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OverallLeaderboardPage } from "./OverallLeaderboardPage";
import { apiClient } from "../services/apiClient";
import { useLanguageStore } from "../stores/languageStore";

const MODE_MEANING_KANJI = "\uB73B \u2192 \uD55C\uC790";
const MODE_WORD_MEANING = "\uB2E8\uC5B4 \u2192 \uB73B";
const MODE_MEANING_WORD = "\uB73B \u2192 \uB2E8\uC5B4";
const MODE_AUDIO_MEANING = "\uC74C\uC131 \u2192 \uB73B";

describe("OverallLeaderboardPage", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
    useLanguageStore.setState({
      selectedLanguage: "ja",
      availableLanguages: [{ languageCode: "ja", label: "\uC77C\uBCF8\uC5B4", totalWords: 10 }],
      words: [],
      isLoading: false,
      loadError: null,
    });
  });

  it("shows global top 50 entries filtered by quiz mode", async () => {
    const user = userEvent.setup();
    vi.spyOn(apiClient, "getOverallLeaderboard").mockResolvedValue([
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
        quizMode: "meaning_to_kanji",
        playerId: "p2",
        nickname: "Beta",
      },
    ]);

    render(
      <MemoryRouter>
        <OverallLeaderboardPage />
      </MemoryRouter>,
    );

    expect(screen.getAllByText("\uC804\uCCB4 \uC21C\uC704\uD45C").length).toBeGreaterThan(0);
    expect(await screen.findByText("Alpha")).toBeInTheDocument();
    expect(screen.queryByText("Beta")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: MODE_MEANING_KANJI }));

    expect(screen.getByText("Beta")).toBeInTheDocument();
  });

  it("moves home from overall leaderboard", async () => {
    const user = userEvent.setup();
    vi.spyOn(apiClient, "getOverallLeaderboard").mockResolvedValue([]);

    render(
      <MemoryRouter initialEntries={["/leaderboard"]}>
        <Routes>
          <Route path="/leaderboard" element={<OverallLeaderboardPage />} />
          <Route path="/home" element={<div>home-route</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: "\uD648\uC73C\uB85C \uAC00\uAE30" }));

    expect(screen.getByText("home-route")).toBeInTheDocument();
  });

  it("shows only english quiz modes when english is selected", () => {
    vi.spyOn(apiClient, "getOverallLeaderboard").mockResolvedValue([]);

    useLanguageStore.setState({
      selectedLanguage: "en",
      availableLanguages: [{ languageCode: "en", label: "\uC601\uC5B4", totalWords: 12 }],
      words: [],
      isLoading: false,
      loadError: null,
    });

    render(
      <MemoryRouter>
        <OverallLeaderboardPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("button", { name: MODE_WORD_MEANING })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: MODE_MEANING_WORD })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: MODE_AUDIO_MEANING })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "\uD55C\uC790 \u2192 \uB73B" })).not.toBeInTheDocument();
  });
});
