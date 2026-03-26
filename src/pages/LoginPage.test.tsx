import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginPage } from "./LoginPage";
import { clearMockGasFailures, setMockGasFailure } from "../services/apiClient";
import { useAuthStore } from "../stores/authStore";
import { useLanguageStore } from "../stores/languageStore";

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

  it("renders minimal login form", () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "로그인" })).toBeInTheDocument();
    expect(screen.getByLabelText("아이디")).toBeInTheDocument();
    expect(screen.getByLabelText("비밀번호")).toBeInTheDocument();
    expect(screen.queryByText(/바로 써볼 수 있는 데모 계정/)).not.toBeInTheDocument();
  });

  it("navigates to languages after login", async () => {
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

    await user.click(screen.getByRole("button", { name: "로그인" }));

    await waitFor(() => {
      expect(screen.getByText("languages-route")).toBeInTheDocument();
    });
    expect(loadMeta).toHaveBeenCalledTimes(1);
  });

  it("shows login error message", async () => {
    const user = userEvent.setup();
    setMockGasFailure("login", "아이디 또는 비밀번호가 올바르지 않습니다.");

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: "로그인" }));

    await waitFor(() => {
      expect(screen.getByText(/아이디 또는 비밀번호가 올바르지 않습니다./)).toBeInTheDocument();
    });
  });
});
