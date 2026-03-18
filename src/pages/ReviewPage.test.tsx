import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { ReviewPage } from "./ReviewPage";
import { writeReviewSnapshot } from "../services/sessionRecovery";
import { useAuthStore } from "../stores/authStore";
import { useLanguageStore } from "../stores/languageStore";

const TEXT = {
  reviewCenter: "\uBCF5\uC2B5\uC13C\uD130",
  noReviewData: "\uBCF5\uC2B5 \uB370\uC774\uD130\uAC00 \uC544\uC9C1 \uC5C6\uC2B5\uB2C8\uB2E4",
  practiceStart: "\uC5F0\uC2B5 \uBAA8\uB4DC \uC2DC\uC791",
  playNow: "\uBC14\uB85C \uD50C\uB808\uC774\uD558\uAE30",
  learningStage: "\uD559\uC2B5 \uC911",
  reviewStage: "\uBCF5\uC2B5 \uB300\uAE30",
  priorityLabel: "\uC6B0\uC120\uC21C\uC704",
  lastResultLabel: "\uC9C1\uC804 \uACB0\uACFC",
  wrongResult: "\uC624\uB2F5",
} as const;

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
  });

  it("우선순위 기준으로 복습 목록을 보여준다", () => {
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

  it("복습센터에서 연습 모드 시작 버튼을 누를 수 있다", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/review"]}>
        <Routes>
          <Route path="/review" element={<ReviewPage />} />
          <Route path="/practice" element={<div>practice-route</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: TEXT.practiceStart }));

    expect(screen.getByText("practice-route")).toBeInTheDocument();
  });

  it("복습센터에서 바로 플레이하기 버튼을 누를 수 있다", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <ReviewPage />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: TEXT.playNow }));
  });
});
