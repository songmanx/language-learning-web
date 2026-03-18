import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { ResultPage } from "./ResultPage";
import type { SessionResultState } from "../features/game/resultState";
import { useLanguageStore } from "../stores/languageStore";

const TEXT = {
  resultSummary: "\uACB0\uACFC \uC694\uC57D",
  moveReview: "\uBCF5\uC2B5\uC13C\uD130\uB85C \uC774\uB3D9",
  noResultData: "\uACB0\uACFC \uB370\uC774\uD130\uAC00 \uC5C6\uC5B4 \uD648\uC73C\uB85C \uB3CC\uC544\uAC11\uB2C8\uB2E4.",
  homeShort: "\uD648\uC73C\uB85C",
  nextActionTitle: "\uB2E4\uC74C \uD559\uC2B5 \uC81C\uC548",
  playAgain: "\uB2E4\uC2DC \uD50C\uB808\uC774",
  practiceStart: "\uC5F0\uC2B5 \uBAA8\uB4DC \uC2DC\uC791",
  accuracy: "\uC815\uB2F5\uB960",
  heartsLeft: "\uB0A8\uC740 \uD558\uD2B8",
  performanceTitle: "\uC138\uC158 \uD3C9\uAC00",
  excellent: "\uB9E4\uC6B0 \uC88B\uC544\uC694",
  selectedLanguage: "\uC120\uD0DD \uC5B8\uC5B4",
  stage: "\uBCF5\uC2B5 \uB2E8\uACC4",
  learningStage: "\uD559\uC2B5 \uC911",
  last: "\uC9C1\uC804 \uACB0\uACFC",
  correctResult: "\uC815\uB2F5",
  reviewPreview: "\uBCF5\uC2B5 \uC0C1\uD0DC \uBBF8\uB9AC\uBCF4\uAE30",
} as const;

const resultState: SessionResultState = {
  saveStatus: "saved",
  payload: {
    playerId: "player-demo",
    languageCode: "ja",
    modeType: "standard",
    quizType: "mixed",
    totalTimeSec: 3,
    score: 12,
    heartsLeft: 3,
    totalQuestions: 1,
    correctAnswers: 1,
    answerLog: [],
    reviewState: [
      {
        wordId: "ja-1",
        priorityScore: 100,
        reviewStage: "learning",
        lastResult: "correct",
      },
    ],
  },
};

describe("ResultPage", () => {
  it("결과 화면의 확장 요약과 CTA를 보여준다", () => {
    useLanguageStore.setState({
      selectedLanguage: "ja",
      availableLanguages: [{ languageCode: "ja", label: "\uC77C\uBCF8\uC5B4", totalWords: 4 }],
      words: [],
      isLoading: false,
      loadError: null,
    });

    render(
      <MemoryRouter initialEntries={[{ pathname: "/result", state: resultState }]}>
        <Routes>
          <Route path="/result" element={<ResultPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: TEXT.resultSummary })).toBeInTheDocument();
    expect(screen.getByText(TEXT.nextActionTitle)).toBeInTheDocument();
    expect(screen.getByText(TEXT.performanceTitle)).toBeInTheDocument();
    expect(screen.getByText(TEXT.accuracy)).toBeInTheDocument();
    expect(screen.getByText(TEXT.heartsLeft)).toBeInTheDocument();
    expect(screen.getByText(TEXT.excellent)).toBeInTheDocument();
    expect(screen.getByText(TEXT.reviewPreview)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`${TEXT.selectedLanguage}:\\s*일본어`))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`${TEXT.stage}: ${TEXT.learningStage}`))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`${TEXT.last}: ${TEXT.correctResult}`))).toBeInTheDocument();
    expect(screen.getByRole("button", { name: TEXT.moveReview })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: TEXT.playAgain })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: TEXT.practiceStart })).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("1 / 1")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getAllByText("3").length).toBeGreaterThan(0);
  });

  it("결과 데이터가 없으면 홈 경로로 이동할 수 있다", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/result"]}>
        <Routes>
          <Route path="/result" element={<ResultPage />} />
          <Route path="/home" element={<div>home-route</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText(TEXT.noResultData)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: TEXT.homeShort }));

    expect(screen.getByText("home-route")).toBeInTheDocument();
  });

  it("다시 플레이 버튼으로 플레이 화면으로 이동할 수 있다", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={[{ pathname: "/result", state: resultState }]}>
        <Routes>
          <Route path="/result" element={<ResultPage />} />
          <Route path="/play" element={<div>play-route</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: TEXT.playAgain }));

    expect(screen.getByText("play-route")).toBeInTheDocument();
  });
});
