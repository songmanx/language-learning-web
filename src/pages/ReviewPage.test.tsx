import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { ReviewPage } from "./ReviewPage";
import { writeReviewSnapshot, writeSessionConfigSnapshot } from "../services/sessionRecovery";
import { useAuthStore } from "../stores/authStore";
import { useLanguageStore } from "../stores/languageStore";
import type { WordItem } from "../services/apiTypes";

function createWords(): WordItem[] {
  return [
    {
      id: "JA_N_0001",
      prompt: "猫",
      choices: ["고양이", "가방", "물고기", "책"],
      answer: "고양이",
      meaning: "고양이",
      difficulty: "1",
      questionType: "word_to_meaning",
    },
    {
      id: "JA_N_0002",
      prompt: "犬",
      choices: ["강아지", "고양이", "물고기", "책"],
      answer: "강아지",
      meaning: "강아지",
      difficulty: "1",
      questionType: "word_to_meaning",
    },
    {
      id: "JA_N_0003",
      prompt: "학생",
      choices: ["学生", "先生", "学校", "友達"],
      answer: "学生",
      meaning: "학생",
      difficulty: "2",
      questionType: "meaning_to_word",
    },
  ];
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
      availableLanguages: [{ languageCode: "ja", label: "일본어", totalWords: 3 }],
      words: createWords(),
      isLoading: false,
      loadError: null,
    });
    writeSessionConfigSnapshot("player-demo", "ja", {
      partOfSpeech: "all",
      difficulty: "all",
      quizMode: "kanji_to_meaning",
    });
  });

  it("shows review setup screen instead of the old review center list", () => {
    writeReviewSnapshot("player-demo", "ja", [
      {
        wordId: "JA_N_0001",
        priorityScore: 100,
        reviewStage: "learning",
        lastResult: "wrong",
        masteryCount: 0,
      },
    ]);

    render(
      <MemoryRouter>
        <ReviewPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("button", { name: "복습 시작" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "복습센터" })).not.toBeInTheDocument();
  });

  it("starts review play only with review words", async () => {
    const user = userEvent.setup();
    writeReviewSnapshot("player-demo", "ja", [
      {
        wordId: "JA_N_0002",
        priorityScore: 100,
        reviewStage: "learning",
        lastResult: "wrong",
        masteryCount: 0,
      },
    ]);

    render(
      <MemoryRouter>
        <ReviewPage />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: "복습 시작" }));

    expect(await screen.findByRole("heading", { name: "犬" })).toBeInTheDocument();
  });

  it("shows empty review guidance when there are no review words", () => {
    render(
      <MemoryRouter>
        <ReviewPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("복습할 문제가 아직 없습니다. 먼저 기본 플레이에서 틀린 문제를 만들어 주세요.")).toBeInTheDocument();
  });

  it("passes the last session config into review play", async () => {
    const user = userEvent.setup();
    writeReviewSnapshot("player-demo", "ja", [
      {
        wordId: "JA_N_0001",
        priorityScore: 100,
        reviewStage: "learning",
        lastResult: "wrong",
        masteryCount: 0,
      },
    ]);

    render(
      <MemoryRouter initialEntries={["/review"]}>
        <Routes>
          <Route path="/review" element={<ReviewPage />} />
          <Route path="/home" element={<div>home-route</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole("button", { name: "한자 -> 뜻" })).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByRole("button", { name: "홈" }));
    expect(screen.getByText("home-route")).toBeInTheDocument();
  });
});
