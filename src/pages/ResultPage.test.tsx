import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResultPage } from "./ResultPage";
import type { SessionResultState } from "../features/game/resultState";
import { apiClient } from "../services/apiClient";

function RouteProbe() {
  const location = useLocation();
  const state = location.state as { sessionConfig?: { quizMode?: string; gameStyle?: string } } | null;

  return (
    <div>
      <div>{location.pathname}</div>
      <div>{state?.sessionConfig?.quizMode ?? "no-config"}</div>
      <div>{state?.sessionConfig?.gameStyle ?? "no-style"}</div>
    </div>
  );
}

const resultState: SessionResultState = {
  saveStatus: "saved",
  payload: {
    playerId: "player-demo",
    languageCode: "ja",
    modeType: "standard",
    quizType: "word_to_meaning",
    totalTimeSec: 3,
    score: 12,
    heartsLeft: 3,
    totalQuestions: 20,
    correctAnswers: 18,
    answerLog: [],
    reviewState: [
      {
        wordId: "JA_N_0016",
        priorityScore: 100,
        reviewStage: "learning",
        lastResult: "wrong",
      },
    ],
  },
  sessionConfig: {
    gameStyle: "multiple_choice",
    partOfSpeech: "noun",
    difficulty: "2",
    quizMode: "meaning_to_kanji",
  },
  incorrectAnswers: [
    {
      shownPrompt: "고양이",
      correctAnswer: "猫",
    },
    {
      shownPrompt: "가방",
      correctAnswer: "鞄",
    },
  ],
};

describe("ResultPage", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
    vi.spyOn(apiClient, "getLeaderboard").mockResolvedValue([
      {
        playedAt: "2026-03-25T10:00:00.000Z",
        totalTimeSec: 32,
        score: 180,
        quizMode: "meaning_to_kanji",
      },
      {
        playedAt: "2026-03-25T11:00:00.000Z",
        totalTimeSec: 35,
        score: 170,
        quizMode: "meaning_to_kanji",
      },
    ]);
  });

  it("shows compact result summary with ranking", async () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: "/result", state: resultState }]}>
        <Routes>
          <Route path="/result" element={<ResultPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "결과 요약" })).toBeInTheDocument();
    expect(screen.getByText("세션 상태")).toBeInTheDocument();
    expect(screen.getByText("순위표")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "복습" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "연습" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "다시하기" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "통계" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "홈" })).toBeInTheDocument();
    expect(await screen.findByText("180")).toBeInTheDocument();
    expect(screen.getAllByRole("button")[0]).toHaveAccessibleName("다시하기");
    expect(screen.getByRole("heading", { name: "오답 정리" })).toBeInTheDocument();
    expect(screen.getByText("고양이")).toBeInTheDocument();
    expect(screen.getByText("猫")).toBeInTheDocument();
  });

  it("shows 탈락 instead of accuracy when the run ends early", () => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/result",
            state: {
              ...resultState,
              payload: {
                ...resultState.payload,
                heartsLeft: 0,
                totalQuestions: 8,
                correctAnswers: 3,
              },
            } satisfies SessionResultState,
          },
        ]}
      >
        <Routes>
          <Route path="/result" element={<ResultPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getAllByText("탈락").length).toBeGreaterThan(0);
  });

  it("moves home when result data is missing", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/result"]}>
        <Routes>
          <Route path="/result" element={<ResultPage />} />
          <Route path="/home" element={<div>home-route</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: "홈으로" }));

    expect(screen.getByText("home-route")).toBeInTheDocument();
  });

  it("passes session config on replay", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={[{ pathname: "/result", state: resultState }]}>
        <Routes>
          <Route path="/result" element={<ResultPage />} />
          <Route path="/play" element={<RouteProbe />} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: "다시하기" }));

    expect(screen.getByText("/play")).toBeInTheDocument();
    expect(screen.getByText("meaning_to_kanji")).toBeInTheDocument();
    expect(screen.getByText("multiple_choice")).toBeInTheDocument();
  });

  it("replays review results back into review mode", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/result",
            state: {
              ...resultState,
              payload: {
                ...resultState.payload,
                modeType: "practice",
              },
              displayMode: "review",
            } satisfies SessionResultState,
          },
        ]}
      >
        <Routes>
          <Route path="/result" element={<ResultPage />} />
          <Route path="/review" element={<RouteProbe />} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: "다시하기" }));

    expect(screen.getByText("/review")).toBeInTheDocument();
    expect(screen.getByText("meaning_to_kanji")).toBeInTheDocument();
  });

  it("shows self-check results without leaderboard or practice CTA", async () => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/result",
            state: {
              ...resultState,
              payload: {
                ...resultState.payload,
                score: 0,
                heartsLeft: 10,
                correctAnswers: 14,
              },
              sessionConfig: {
                gameStyle: "self_check",
                partOfSpeech: "noun",
                difficulty: "2",
                quizMode: "kanji_to_furigana",
              },
            } satisfies SessionResultState,
          },
        ]}
      >
        <Routes>
          <Route path="/result" element={<ResultPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.queryByText("순위표")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "연습" })).not.toBeInTheDocument();
    expect(screen.getByText("오답 수")).toBeInTheDocument();
    expect(apiClient.getLeaderboard).not.toHaveBeenCalled();
  });

  it("shows english session config labels and english leaderboard entries", async () => {
    vi.spyOn(apiClient, "getLeaderboard").mockResolvedValue([
      {
        playedAt: "2026-03-26T10:00:00.000Z",
        totalTimeSec: 22,
        score: 210,
        quizMode: "meaning_to_kanji",
      },
    ]);

    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/result",
            state: {
              ...resultState,
              payload: {
                ...resultState.payload,
                languageCode: "en",
                quizType: "meaning_to_word",
              },
              sessionConfig: {
                gameStyle: "multiple_choice",
                partOfSpeech: "noun",
                difficulty: "2",
                quizMode: "meaning_to_kanji",
              },
            } satisfies SessionResultState,
          },
        ]}
      >
        <Routes>
          <Route path="/result" element={<ResultPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText(/플레이 모드:\s*4지선다형/)).toBeInTheDocument();
    expect(await screen.findByText("210")).toBeInTheDocument();
  });
});
