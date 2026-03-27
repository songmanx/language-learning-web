import { afterEach, describe, expect, it, vi } from "vitest";
import { speakPrompt, stopSpeech } from "./audioFeedback";

describe("audioFeedback", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("prefers an en-US voice for english prompts", () => {
    const speak = vi.fn();
    const cancel = vi.fn();

    vi.stubGlobal(
      "SpeechSynthesisUtterance",
      class {
        text: string;
        lang = "";
        rate = 1;
        pitch = 1;
        volume = 1;
        voice?: SpeechSynthesisVoice;

        constructor(text: string) {
          this.text = text;
        }
      },
    );

    vi.stubGlobal("speechSynthesis", {
      speak,
      cancel,
      getVoices: () => [
        { name: "Japanese Voice", lang: "ja-JP" },
        { name: "English (United States)", lang: "en-US" },
      ],
    });

    const result = speakPrompt("apple", "en");

    expect(result).toBe(true);
    expect(speak).toHaveBeenCalledTimes(1);
    const utterance = speak.mock.calls[0][0] as SpeechSynthesisUtterance;
    expect(utterance.lang).toBe("en-US");
    expect(utterance.voice?.lang).toBe("en-US");
  });

  it("stops active speech when requested", () => {
    const cancel = vi.fn();

    vi.stubGlobal("speechSynthesis", {
      speak: vi.fn(),
      cancel,
      getVoices: () => [],
    });

    stopSpeech();

    expect(cancel).toHaveBeenCalledTimes(1);
  });
});
