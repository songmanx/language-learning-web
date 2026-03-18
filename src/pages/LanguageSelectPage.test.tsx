import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LanguageSelectPage } from "./LanguageSelectPage";
import { useLanguageStore } from "../stores/languageStore";

const TEXT = {
  title: "언어 선택",
  selectAction: "이 언어로 시작하기",
  totalQuestionsLabel: "준비된 문제",
} as const;

describe("LanguageSelectPage", () => {
  beforeEach(() => {
    useLanguageStore.setState({
      selectedLanguage: null,
      availableLanguages: [{ languageCode: "ja", label: "일본어", totalWords: 4 }],
      words: [],
      isLoading: false,
      loadError: null,
    });
  });

  it("언어 카드 안내 문구를 보여준다", () => {
    render(
      <MemoryRouter>
        <LanguageSelectPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: TEXT.title })).toBeInTheDocument();
    expect(screen.getByText(/준비된 문제/)).toBeInTheDocument();
    expect(screen.getByText(TEXT.selectAction)).toBeInTheDocument();
  });

  it("언어를 선택하면 홈 화면으로 이동한다", async () => {
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
});
