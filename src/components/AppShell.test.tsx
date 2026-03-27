import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { AppShell } from "./AppShell";
import { useLanguageStore } from "../stores/languageStore";

describe("AppShell", () => {
  beforeEach(() => {
    useLanguageStore.setState({
      selectedLanguage: "ja",
      availableLanguages: [{ languageCode: "ja", label: "일본어", totalWords: 94 }],
      words: [],
      isLoading: false,
      loadError: null,
    });
  });

  it("shows the selected japanese language badge on regular pages", () => {
    render(
      <MemoryRouter initialEntries={["/home"]}>
        <AppShell>
          <div>content</div>
        </AppShell>
      </MemoryRouter>,
    );

    expect(screen.getByText("일본어")).toBeInTheDocument();
    expect(screen.getByText("JAPANESE TRACK")).toBeInTheDocument();
  });

  it("switches the header badge and accent text for english", () => {
    useLanguageStore.setState({
      selectedLanguage: "en",
      availableLanguages: [{ languageCode: "en", label: "영어", totalWords: 299 }],
      words: [],
      isLoading: false,
      loadError: null,
    });

    render(
      <MemoryRouter initialEntries={["/play"]}>
        <AppShell>
          <div>content</div>
        </AppShell>
      </MemoryRouter>,
    );

    expect(screen.getByText("영어")).toBeInTheDocument();
    expect(screen.getByText("ENGLISH TRACK")).toBeInTheDocument();
  });

  it("hides the language badge on login and language-select pages", () => {
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <AppShell>
          <div>content</div>
        </AppShell>
      </MemoryRouter>,
    );

    expect(screen.queryByText("일본어")).not.toBeInTheDocument();
    expect(screen.getByText("LANGUAGE STUDIO")).toBeInTheDocument();
  });
});
