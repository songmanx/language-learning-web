import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { ResultPage } from "./ResultPage";
import type { SessionResultState } from "../features/game/resultState";
import { useLanguageStore } from "../stores/languageStore";

const TEXT = {
  resultSummary: "결과 요약",
  moveReview: "복습",
  noResultData: "결과 데이터가 없어 홈으로 돌아갑니다.",
  homeShort: "홈으로",
  quickActionsTitle: "바로 이동",
  recommendedRoute: "추천 경로",
  playAgain: "재도전",
  practiceStart: "연습",
  accuracy: "정답률",
  heartsLeft: "남은 하트",
  performanceTitle: "세션 평가",
  statusTitle: "세션 상태",
  sessionSnapshot: "세션 스냅샷",
  sessionMode: "플레이 모드",
  quizType: "출제 구성",
  totalTime: "세션 시간",
  averageResponse: "평균 반응",
  sessionConfigTitle: "세션 구성",
  partOfSpeech: "품사",
  difficulty: "난이도",
  excellent: "매우 좋아요",
  selectedLanguage: "선택 언어",
  stage: "복습 단계",
  learningStage: "학습 중",
  last: "직전 결과",
  correctResult: "정답",
  reviewPreview: "복습 상태 미리보기",
  primaryRecommended: "추천",
} as const;

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
  sessionConfig: {
    partOfSpeech: "noun",
    difficulty: "2",
    quizMode: "meaning_to_word",
  },
};

describe("ResultPage", () => {
  it("결과 화면의 요약과 CTA를 보여준다", () => {
    useLanguageStore.setState({
      selectedLanguage: "ja",
      availableLanguages: [{ languageCode: "ja", label: "일본어", totalWords: 4 }],
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
    expect(screen.getByText(TEXT.statusTitle)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`${TEXT.recommendedRoute}: ${TEXT.playAgain}`))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`${TEXT.performanceTitle}: ${TEXT.excellent}`))).toBeInTheDocument();
    expect(screen.getByText(TEXT.sessionSnapshot)).toBeInTheDocument();
    expect(screen.getByText(TEXT.sessionConfigTitle)).toBeInTheDocument();
    expect(screen.getByText(TEXT.sessionMode)).toBeInTheDocument();
    expect(screen.getByText(TEXT.quizType)).toBeInTheDocument();
    expect(screen.getByText(TEXT.totalTime)).toBeInTheDocument();
    expect(screen.getByText(TEXT.averageResponse)).toBeInTheDocument();
    expect(screen.getAllByText(TEXT.accuracy).length).toBeGreaterThan(0);
    expect(screen.getByText(TEXT.heartsLeft)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(TEXT.excellent))).toBeInTheDocument();
    expect(screen.getByText(TEXT.reviewPreview)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`${TEXT.partOfSpeech}: 명사`))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`${TEXT.difficulty}: 난이도 2`))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`${TEXT.quizType}: 뜻 -> 단어`))).toBeInTheDocument();
    expect(screen.queryByText(/문제 흐름/)).not.toBeInTheDocument();
    expect(screen.getByText(TEXT.primaryRecommended)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`${TEXT.selectedLanguage}:\\s*일본어`))).toBeInTheDocument();
    expect(screen.getByText(/단계:\s*학습 중/)).toBeInTheDocument();
    expect(screen.getByText(/결과:\s*정답/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: TEXT.moveReview })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: TEXT.playAgain })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: TEXT.practiceStart })).toBeInTheDocument();
    expect(screen.getByText("기본 플레이")).toBeInTheDocument();
    expect(screen.getByText("단어 -> 뜻")).toBeInTheDocument();
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

  it("다시 플레이 버튼은 마지막 세션 구성을 전달한다", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={[{ pathname: "/result", state: resultState }]}>
        <Routes>
          <Route path="/result" element={<ResultPage />} />
          <Route path="/play" element={<RouteProbe />} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: TEXT.playAgain }));

    expect(screen.getByText("meaning_to_word")).toBeInTheDocument();
  });
});
