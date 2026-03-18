import { create } from "zustand";
import { useAuthStore } from "../stores/authStore";
import { apiClient, type WordItem } from "../services/apiClient";
import { appLogger, logger } from "../services/logger";
import { readJsonStorage, writeJsonStorage } from "../services/storage";
import {
  getSelectedLanguageKey,
  readCachedWords,
  writeCachedWords,
} from "../services/sessionRecovery";

const TEXT = {
  metaLoadStart: "\uC5B8\uC5B4 \uBA54\uD0C0 \uB85C\uB4DC \uC2DC\uC791",
  metaLoadSuccess: "\uC5B8\uC5B4 \uBA54\uD0C0 \uB85C\uB4DC \uC131\uACF5",
  metaLoadFail: "\uC5B8\uC5B4 \uBA54\uD0C0 \uB85C\uB4DC \uC2E4\uD328",
  metaFallback: "\uBA54\uD0C0 \uB370\uC774\uD130\uB97C \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD574 \uAE30\uBCF8 \uC5B8\uC5B4 \uBAA9\uB85D\uC744 \uC0AC\uC6A9\uD569\uB2C8\uB2E4.",
  languageSelected: "\uC5B8\uC5B4 \uC120\uD0DD \uC644\uB8CC",
  selectLanguageFirst: "\uBA3C\uC800 \uC5B8\uC5B4\uB97C \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.",
  loadWithoutLanguage: "\uC5B8\uC5B4 \uC120\uD0DD \uC5C6\uC774 \uB2E8\uC5B4 \uB85C\uB4DC\uB97C \uC2DC\uB3C4\uD568",
  wordsLoadStart: "\uB2E8\uC5B4 \uB370\uC774\uD130 \uB85C\uB4DC \uC2DC\uC791",
  wordsLoadSuccess: "\uB2E8\uC5B4 \uB370\uC774\uD130 \uB85C\uB4DC \uC131\uACF5",
  wordsLoadFallback: "\uB2E8\uC5B4 \uB370\uC774\uD130\uB97C \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD574 \uCE90\uC2DC \uB610\uB294 fallback \uB370\uC774\uD130\uB97C \uC0AC\uC6A9\uD569\uB2C8\uB2E4.",
  useCachedWords: "\uB370\uC774\uD130 \uB85C\uB4DC\uC5D0 \uC2E4\uD328\uD574 \uC800\uC7A5\uB41C \uCE90\uC2DC \uBB38\uC81C\uB97C \uC0AC\uC6A9\uD569\uB2C8\uB2E4.",
  cachedWordsLog: "\uCE90\uC2DC \uB2E8\uC5B4 \uB370\uC774\uD130 \uC0AC\uC6A9",
  useFallbackWords: "\uB370\uC774\uD130 \uB85C\uB4DC \uC2E4\uD328\uB85C \uAE30\uBCF8 \uBB38\uC81C\uB97C \uC0AC\uC6A9\uD569\uB2C8\uB2E4.",
  fallbackWordsLog: "fallback \uB2E8\uC5B4 \uB370\uC774\uD130 \uC0AC\uC6A9",
} as const;

function getCurrentPlayerId() {
  return useAuthStore.getState().playerId;
}

type LanguageOption = {
  languageCode: string;
  label: string;
  totalWords: number;
};

type LanguageSnapshot = {
  selectedLanguage: string | null;
  availableLanguages: LanguageOption[];
  words: WordItem[];
  isLoading: boolean;
  loadError: string | null;
};

type LanguageStore = LanguageSnapshot & {
  loadMeta: () => Promise<void>;
  selectLanguage: (languageCode: string) => void;
  loadWords: (languageCode?: string) => Promise<void>;
  clearLoadError: () => void;
};

let metaLoadPromise: Promise<void> | null = null;

const fallbackWords: WordItem[] = [
  {
    id: "fallback-1",
    prompt: "\u3042\u308A\u304C\u3068\u3046",
    choices: ["\uAC10\uC0AC\uD569\uB2C8\uB2E4", "\uC548\uB155\uD558\uC138\uC694", "\uBBF8\uC548\uD569\uB2C8\uB2E4", "\uC798\uAC00\uC694"],
    answer: "\uAC10\uC0AC\uD569\uB2C8\uB2E4",
    meaning: "\uAC10\uC0AC\uD569\uB2C8\uB2E4",
    difficulty: "1",
    questionType: "word_to_meaning",
  },
  {
    id: "fallback-2",
    prompt: "\u3055\u304F\u3089",
    choices: ["\uBC9A\uAF43", "\uBE44", "\uB208", "\uBC14\uB2E4"],
    answer: "\uBC9A\uAF43",
    meaning: "\uBC9A\uAF43",
    difficulty: "1",
    questionType: "meaning_to_word",
  },
];

function getInitialSelectedLanguage() {
  return readJsonStorage<string | null>(getSelectedLanguageKey(getCurrentPlayerId()), null);
}

export const useLanguageStore = create<LanguageStore>((set, get) => ({
  selectedLanguage: getInitialSelectedLanguage(),
  availableLanguages: [],
  words: [],
  isLoading: false,
  loadError: null,
  clearLoadError() {
    set({ loadError: null });
  },
  async loadMeta() {
    if (get().availableLanguages.length > 0 && !get().loadError) {
      return;
    }

    if (metaLoadPromise) {
      await metaLoadPromise;
      return;
    }

    metaLoadPromise = (async () => {
      set({ isLoading: true, loadError: null });
      appLogger.info("language", TEXT.metaLoadStart);

      try {
        const meta = await apiClient.getMeta();
        set({
          availableLanguages: meta,
          isLoading: false,
        });
        appLogger.info("language", TEXT.metaLoadSuccess, {
          count: meta.length,
        });
      } catch (error) {
        logger("ERROR", TEXT.metaLoadFail, error instanceof Error ? { message: error.message } : undefined);
        set({
          availableLanguages: [
            { languageCode: "ja", label: "\uC77C\uBCF8\uC5B4", totalWords: fallbackWords.length },
          ],
          loadError: TEXT.metaFallback,
          isLoading: false,
        });
      } finally {
        metaLoadPromise = null;
      }
    })();

    await metaLoadPromise;
  },
  selectLanguage(languageCode) {
    writeJsonStorage(getSelectedLanguageKey(getCurrentPlayerId()), languageCode);
    set({ selectedLanguage: languageCode, loadError: null });
    appLogger.info("language", TEXT.languageSelected, { languageCode });
  },
  async loadWords(languageCode) {
    const targetLanguage = languageCode ?? get().selectedLanguage;
    const playerId = getCurrentPlayerId();

    if (!targetLanguage) {
      set({ loadError: TEXT.selectLanguageFirst });
      appLogger.warning("language", TEXT.loadWithoutLanguage);
      return;
    }

    set({ isLoading: true, loadError: null });
    appLogger.info("language", TEXT.wordsLoadStart, {
      languageCode: targetLanguage,
      playerId,
    });

    try {
      const words = await apiClient.getWords(targetLanguage);
      const nextWords = words.length > 0 ? words : fallbackWords;
      writeCachedWords(playerId, targetLanguage, nextWords);
      set({
        words: nextWords,
        isLoading: false,
      });
      appLogger.info("language", TEXT.wordsLoadSuccess, {
        languageCode: targetLanguage,
        count: nextWords.length,
        source: words.length > 0 ? "remote" : "fallback-empty",
      });
    } catch (error) {
      logger(
        "WARNING",
        TEXT.wordsLoadFallback,
        error instanceof Error ? { message: error.message, languageCode: targetLanguage } : undefined,
      );
      const cachedWords = readCachedWords(playerId, targetLanguage);

      if (cachedWords.length > 0) {
        set({
          words: cachedWords,
          loadError: TEXT.useCachedWords,
          isLoading: false,
        });
        appLogger.warning("language", TEXT.cachedWordsLog, {
          languageCode: targetLanguage,
          count: cachedWords.length,
        });
        return;
      }

      set({
        words: fallbackWords,
        loadError: TEXT.useFallbackWords,
        isLoading: false,
      });
      appLogger.warning("language", TEXT.fallbackWordsLog, {
        languageCode: targetLanguage,
        count: fallbackWords.length,
      });
    }
  },
}));
