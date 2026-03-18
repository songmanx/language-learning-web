import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginPage } from "./LoginPage";
import { clearMockGasFailures, setMockGasFailure } from "../services/apiClient";
import { useAuthStore } from "../stores/authStore";
import { useLanguageStore } from "../stores/languageStore";

const TEXT = {
  title: "학습을 시작해 봅시다",
  demoHintTitle: "바로 써볼 수 있는 데모 계정",
  submit: "로그인",
  failedPrefix: "로그인 실패:",
} as const;

describe("LoginPage", () => {
  beforeEach(() => {
    clearMockGasFailures();
    useAuthStore.setState({
      isLoggedIn: false,
      token: null,
      playerId: null,
      nickname: null,
    });
    useLanguageStore.setState({
      selectedLanguage: null,
      availableLanguages: [],
      words: [],
      isLoading: false,
      loadError: null,
    });
  });

  it("데모 로그인 안내 문구를 보여준다", () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: TEXT.title })).toBeInTheDocument();
    expect(screen.getByText(TEXT.demoHintTitle)).toBeInTheDocument();
    expect(screen.getByDisplayValue("demo")).toBeInTheDocument();
  });

  it("로그인 후 언어 선택 화면으로 이동한다", async () => {
    const user = userEvent.setup();
    const loadMeta = vi.fn().mockResolvedValue(undefined);

    useLanguageStore.setState({
      selectedLanguage: null,
      availableLanguages: [],
      words: [],
      isLoading: false,
      loadError: null,
      loadMeta,
      selectLanguage: vi.fn(),
      loadWords: vi.fn().mockResolvedValue(undefined),
      clearLoadError: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/languages" element={<div>languages-route</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: TEXT.submit }));

    await waitFor(() => {
      expect(screen.getByText("languages-route")).toBeInTheDocument();
    });
    expect(loadMeta).toHaveBeenCalledTimes(1);
  });

  it("로그인 실패 시 오류 문구를 화면에 보여준다", async () => {
    const user = userEvent.setup();
    setMockGasFailure("login", "아이디 또는 비밀번호가 올바르지 않습니다.");

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: TEXT.submit }));

    await waitFor(() => {
      expect(screen.getByText(/아이디 또는 비밀번호가 올바르지 않습니다./)).toBeInTheDocument();
    });
    expect(screen.getByText(new RegExp(TEXT.failedPrefix))).toBeInTheDocument();
  });
});
