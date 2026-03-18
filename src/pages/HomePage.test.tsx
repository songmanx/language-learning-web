import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { HomePage } from "./HomePage";
import { clearMockGasFailures } from "../services/apiClient";
import { readPendingSession, writePendingSession } from "../services/sessionRecovery";
import { useAuthStore } from "../stores/authStore";
import { useLanguageStore } from "../stores/languageStore";

const pendingPayload = {
  playerId: "player-demo",
  languageCode: "ja",
  modeType: "standard" as const,
  quizType: "mixed" as const,
  totalTimeSec: 5,
  score: 42,
  heartsLeft: 2,
  totalQuestions: 3,
  correctAnswers: 2,
  answerLog: [],
  reviewState: [],
};

const TEXT = {
  pendingSession: "\uC784\uC2DC \uC800\uC7A5\uB41C \uC138\uC158\uC774 \uC788\uC2B5\uB2C8\uB2E4.",
  retrySave: "\uC784\uC2DC \uC800\uC7A5 \uC138\uC158 \uB2E4\uC2DC \uC800\uC7A5",
  retrySuccess:
    "\uC784\uC2DC \uC800\uC7A5\uB41C \uC138\uC158\uC744 \uC815\uC0C1\uC801\uC73C\uB85C \uB2E4\uC2DC \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4.",
  practiceStart: "\uC5F0\uC2B5 \uBAA8\uB4DC \uC2DC\uC791",
  mockNotice:
    "\uD604\uC7AC\uB294 mock \uBAA8\uB4DC\uB77C\uC11C \uC2E4\uC81C Google Sheets\uC5D0 \uC800\uC7A5\uB418\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.",
  selectedLanguage: "\uC120\uD0DD \uC5B8\uC5B4",
} as const;

describe("HomePage retry save flow", () => {
  beforeEach(() => {
    window.localStorage.clear();
    clearMockGasFailures();
    useAuthStore.setState({
      isLoggedIn: true,
      token: "mock-token",
      playerId: "player-demo",
      nickname: "demo",
    });
    useLanguageStore.setState({
      selectedLanguage: "ja",
      availableLanguages: [{ languageCode: "ja", label: "\uC77C\uBCF8\uC5B4", totalWords: 3 }],
      words: [
        {
          id: "ja-1",
          prompt: "\u306D\u3053",
          choices: ["\uACE0\uC591\uC774", "\uAC1C", "\uC0C8", "\uBB3C\uACE0\uAE30"],
          answer: "\uACE0\uC591\uC774",
          meaning: "\uACE0\uC591\uC774",
          difficulty: "1",
          questionType: "word_to_meaning",
        },
      ],
      isLoading: false,
      loadError: null,
    });
    writePendingSession("player-demo", "ja", pendingPayload, "save failed");
  });

  it("임시 저장 세션을 다시 저장하면 안내 메시지를 보여주고 pending session을 지운다", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    expect(screen.getByText(TEXT.pendingSession)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: TEXT.retrySave }));

    await screen.findByText(TEXT.retrySuccess);

    await waitFor(() => {
      expect(readPendingSession("player-demo", "ja")).toBeNull();
    });
  });

  it("홈 화면에서 연습 모드로 진입할 수 있다", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/home"]}>
        <Routes>
          <Route path="/home" element={<HomePage />} />
          <Route path="/practice" element={<div>practice-route</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: TEXT.practiceStart }));

    await screen.findByText("practice-route");
  });

  it("mock 모드 안내 문구와 선택 언어 이름을 보여준다", () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    expect(screen.getByText(TEXT.mockNotice)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`${TEXT.selectedLanguage}:\\s*일본어`))).toBeInTheDocument();
  });
});
