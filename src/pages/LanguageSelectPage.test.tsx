import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LanguageSelectPage } from "./LanguageSelectPage";
import { useAuthStore } from "../stores/authStore";
import { useLanguageStore } from "../stores/languageStore";

describe("LanguageSelectPage", () => {
  beforeEach(() => {
    useAuthStore.setState({
      isLoggedIn: true,
      token: "mock-token",
      playerId: "player-demo",
      nickname: "demo",
    });
    useLanguageStore.setState({
      selectedLanguage: null,
      availableLanguages: [{ languageCode: "ja", label: "일본어", totalWords: 4 }],
      words: [],
      isLoading: false,
      loadError: null,
    });
  });

  it("shows polished language card and logout action", () => {
    render(
      <MemoryRouter>
        <LanguageSelectPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "언어 선택" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /일본어/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "로그아웃" })).toBeInTheDocument();
  });

  it("moves to home after selecting a language", async () => {
    const user = userEvent.setup();
    const loadMeta = vi.fn().mockResolvedValue(undefined);
    const loadWords = vi.fn().mockResolvedValue(undefined);
    const selectLanguage = vi.fn((languageCode: string) => {
      useLanguageStore.setState({ selectedLanguage: languageCode });
    });

    useLanguageStore.setState({
      selectedLanguage: null,
      availableLanguages: [{ languageCode: "ja", label: "일본어", totalWords: 4 }],
      words: [],
      isLoading: false,
      loadError: null,
      loadMeta,
      loadWords,
      selectLanguage,
      clearLoadError: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/languages"]}>
        <Routes>
          <Route path="/languages" element={<LanguageSelectPage />} />
          <Route path="/home" element={<div>home-route</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: /일본어/ }));

    await waitFor(() => {
      expect(loadWords).toHaveBeenCalledWith("ja");
    });
    expect(screen.getByText("home-route")).toBeInTheDocument();
  });

  it("moves to login when logout is clicked", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/languages"]}>
        <Routes>
          <Route path="/languages" element={<LanguageSelectPage />} />
          <Route path="/login" element={<div>login-route</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: "로그아웃" }));

    expect(screen.getByText("login-route")).toBeInTheDocument();
  });
});
