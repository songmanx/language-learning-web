import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { ReviewPage } from "./ReviewPage";
import { writeReviewSnapshot, writeSessionConfigSnapshot } from "../services/sessionRecovery";
import { useAuthStore } from "../stores/authStore";
import { useLanguageStore } from "../stores/languageStore";

const TEXT = {
  reviewCenter: "복습센터",
  noReviewData: "복습 데이터가 아직 없습니다",
  practiceStart: "연습 모드 시작",
  playNow: "바로 플레이하기",
  backHome: "홈으로 돌아가기",
  snapshotStatus: "복습 스냅샷",
  quickActionsTitle: "바로 이동",
  recommendedRoute: "추천 경로",
  totalItems: "전체 항목",
  topPriority: "최상위 우선순위",
  updatedAt: "최신 반영",
  lastLoadout: "연결 세션 구성",
  recommendedBadge: "추천",
  learningStage: "학습 중",
  reviewStage: "복습 대기",
  priorityLabel: "우선순위",
  lastResultLabel: "직전 결과",
  wrongResult: "오답",
} as const;

function RouteProbe() {
  const location = useLocation();
  const state = location.state as { sessionConfig?: { quizMode?: string } } | null;

  return <div>{state?.sessionConfig?.quizMode ?? "no-config"}</div>;
}

describe("ReviewPage", () => {
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
      availableLanguages: [],
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

  it("우선순위 기준으로 복습 목록과 마지막 세션 구성을 보여준다", () => {
    writeReviewSnapshot("player-demo", "ja", [
      {
        wordId: "ja-2",
        priorityScore: 30,
        reviewStage: "review",
        lastResult: "correct",
      },
      {
        wordId: "ja-1",
        priorityScore: 100,
        reviewStage: "learning",
        lastResult: "wrong",
      },
    ]);

    render(
      <MemoryRouter>
        <ReviewPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: TEXT.reviewCenter })).toBeInTheDocument();
    expect(screen.getByText(TEXT.snapshotStatus)).toBeInTheDocument();
    expect(screen.getByText(TEXT.quickActionsTitle)).toBeInTheDocument();
    expect(screen.getByText(TEXT.recommendedBadge)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`${TEXT.recommendedRoute}: ${TEXT.practiceStart}`))).toBeInTheDocument();
    expect(screen.getByText(TEXT.totalItems)).toBeInTheDocument();
    expect(screen.getByText(TEXT.topPriority)).toBeInTheDocument();
    expect(screen.getByText(TEXT.updatedAt)).toBeInTheDocument();
    expect(screen.getByText(TEXT.lastLoadout)).toBeInTheDocument();
    expect(screen.getByText(/출제: 뜻 -> 단어/)).toBeInTheDocument();
    expect(screen.queryByText(/흐름:/)).not.toBeInTheDocument();
    expect(screen.getAllByText(TEXT.learningStage).length).toBeGreaterThan(0);
    expect(screen.getAllByText(TEXT.reviewStage).length).toBeGreaterThan(0);
    expect(screen.getByText(new RegExp(`${TEXT.priorityLabel}: 100`))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`${TEXT.lastResultLabel}: ${TEXT.wrongResult}`))).toBeInTheDocument();
    const items = screen.getAllByText(/ja-/).map((node) => node.textContent);
    expect(items[0]).toBe("ja-1");
    expect(items[1]).toBe("ja-2");
  });

  it("복습 데이터가 없으면 안내 문구를 보여준다", () => {
    render(
      <MemoryRouter>
        <ReviewPage />
      </MemoryRouter>,
    );

    expect(screen.getByText(new RegExp(TEXT.noReviewData))).toBeInTheDocument();
  });

  it("복습센터 액션은 마지막 세션 구성을 전달한다", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/review"]}>
        <Routes>
          <Route path="/review" element={<ReviewPage />} />
          <Route path="/practice" element={<RouteProbe />} />
          <Route path="/play" element={<RouteProbe />} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: TEXT.practiceStart }));
    expect(screen.getByText("meaning_to_word")).toBeInTheDocument();
  });

  it("복습센터에서 홈으로 돌아갈 수 있다", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/review"]}>
        <Routes>
          <Route path="/review" element={<ReviewPage />} />
          <Route path="/home" element={<div>home-route</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: TEXT.backHome }));

    expect(screen.getByText("home-route")).toBeInTheDocument();
  });
});
