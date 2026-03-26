import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { ResultPage } from "./ResultPage";
import type { SessionResultState } from "../features/game/resultState";
import { writeLeaderboard } from "../services/sessionRecovery";

function RouteProbe() {
  const location = useLocation();
  const state = location.state as { sessionConfig?: { quizMode?: string } } | null;

  return <div>{state?.sessionConfig?.quizMode ?? "no-config"}</div>;
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
    partOfSpeech: "noun",
    difficulty: "2",
    quizMode: "meaning_to_word",
  },
};

describe("ResultPage", () => {
  beforeEach(() => {
    window.localStorage.clear();
    writeLeaderboard("player-demo", "ja", [
      {
        playedAt: "2026-03-25T10:00:00.000Z",
        totalTimeSec: 32,
        score: 180,
        quizMode: "meaning_to_word",
      },
      {
        playedAt: "2026-03-25T11:00:00.000Z",
        totalTimeSec: 35,
        score: 170,
        quizMode: "meaning_to_word",
      },
    ]);
  });

  it("shows compact result summary with ranking", () => {
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
    expect(screen.getByRole("button", { name: "재도전" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "통계" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "홈" })).toBeInTheDocument();
    expect(screen.getByText("180")).toBeInTheDocument();
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

    await user.click(screen.getByRole("button", { name: "재도전" }));

    expect(screen.getByText("meaning_to_word")).toBeInTheDocument();
  });
});
