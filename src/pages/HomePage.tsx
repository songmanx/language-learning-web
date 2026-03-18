import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../services/apiClient";
import { appLogger } from "../services/logger";
import { getRuntimeConfig } from "../services/runtimeConfig";
import type { PendingSessionRecord } from "../services/sessionRecovery";
import { clearPendingSession, readPendingSession } from "../services/sessionRecovery";
import { useAuthStore } from "../stores/authStore";
import { useLanguageStore } from "../stores/languageStore";

const runtimeConfig = getRuntimeConfig();
const TEXT = {
  welcome: "\uD658\uC601\uD569\uB2C8\uB2E4",
  learner: "\uD559\uC2B5\uC790",
  honorific: "\uB2D8",
  unselected: "\uBBF8\uC120\uD0DD",
  language: "\uC120\uD0DD \uC5B8\uC5B4",
  preparedWords: "\uC900\uBE44\uB41C \uBB38\uC81C \uC218",
  pendingSession: "\uC784\uC2DC \uC800\uC7A5\uB41C \uC138\uC158\uC774 \uC788\uC2B5\uB2C8\uB2E4.",
  pendingSavedAt: "\uB9C8\uC9C0\uB9C9 \uC800\uC7A5 \uC2DC\uB3C4",
  pendingReason: "\uC0AC\uC720",
  retrySaving: "\uC7AC\uC800\uC7A5 \uC911...",
  retrySave: "\uC784\uC2DC \uC800\uC7A5 \uC138\uC158 \uB2E4\uC2DC \uC800\uC7A5",
  retrySuccess:
    "\uC784\uC2DC \uC800\uC7A5\uB41C \uC138\uC158\uC744 \uC815\uC0C1\uC801\uC73C\uB85C \uB2E4\uC2DC \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4.",
  retryFail: "\uC138\uC158 \uC7AC\uC800\uC7A5\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.",
  playStart: "\uD50C\uB808\uC774 \uC2DC\uC791",
  practiceStart: "\uC5F0\uC2B5 \uBAA8\uB4DC \uC2DC\uC791",
  reviewCenter: "\uBCF5\uC2B5\uC13C\uD130 \uC5F4\uAE30",
  statsPage: "\uD1B5\uACC4 \uBCF4\uAE30",
  changeLanguage: "\uC5B8\uC5B4 \uB2E4\uC2DC \uC120\uD0DD",
  logout: "\uB85C\uADF8\uC544\uC6C3",
  startClickSuffix: "\uC2DC\uC791 \uBC84\uD2BC \uD074\uB9AD",
  retryAttempt: "\uC784\uC2DC \uC800\uC7A5 \uC138\uC158 \uC7AC\uC800\uC7A5 \uC2DC\uB3C4",
  retryAttemptSuccess: "\uC784\uC2DC \uC800\uC7A5 \uC138\uC158 \uC7AC\uC800\uC7A5 \uC131\uACF5",
  retryAttemptFail: "\uC784\uC2DC \uC800\uC7A5 \uC138\uC158 \uC7AC\uC800\uC7A5 \uC2E4\uD328",
  mockNotice:
    "\uD604\uC7AC\uB294 mock \uBAA8\uB4DC\uB77C\uC11C \uC2E4\uC81C Google Sheets\uC5D0 \uC800\uC7A5\uB418\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.",
  jsonNotice:
    "\uD604\uC7AC\uB294 \uC815\uC801 JSON\uC5D0\uC11C \uBB38\uC81C/\uBA54\uD0C0\uB97C \uC77D\uACE0, \uB85C\uADF8\uC778\uACFC \uC800\uC7A5\uC740 GAS\uB85C \uCC98\uB9AC\uD569\uB2C8\uB2E4.",
} as const;

export function HomePage() {
  const navigate = useNavigate();
  const playerId = useAuthStore((state) => state.playerId);
  const nickname = useAuthStore((state) => state.nickname);
  const logout = useAuthStore((state) => state.logout);
  const { selectedLanguage, availableLanguages, words, loadWords } = useLanguageStore();
  const [pendingSession, setPendingSession] = useState<PendingSessionRecord | null>(null);
  const [retryMessage, setRetryMessage] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const selectedLanguageLabel =
    availableLanguages.find((language) => language.languageCode === selectedLanguage)?.label ??
    selectedLanguage ??
    TEXT.unselected;

  useEffect(() => {
    if (!playerId || !selectedLanguage) {
      setPendingSession(null);
      return;
    }

    setPendingSession(readPendingSession(playerId, selectedLanguage));
  }, [playerId, selectedLanguage]);

  useEffect(() => {
    if (!selectedLanguage || words.length > 0) {
      return;
    }

    void loadWords(selectedLanguage);
  }, [loadWords, selectedLanguage, words.length]);

  async function prepareWords(targetPath: "/play" | "/practice", trigger: "play" | "practice") {
    appLogger.info("home", `${trigger} ${TEXT.startClickSuffix}`, {
      selectedLanguage,
      preparedWords: words.length,
    });

    if (words.length === 0) {
      await loadWords();
    }

    navigate(targetPath);
  }

  async function handleRetrySave() {
    if (!playerId || !selectedLanguage || !pendingSession) {
      return;
    }

    setIsRetrying(true);
    setRetryMessage(null);
    appLogger.info("home", TEXT.retryAttempt, {
      playerId,
      languageCode: selectedLanguage,
    });

    try {
      await apiClient.saveSession(pendingSession.payload);
      clearPendingSession(playerId, selectedLanguage);
      setPendingSession(null);
      setRetryMessage(TEXT.retrySuccess);
      appLogger.info("home", TEXT.retryAttemptSuccess, {
        playerId,
        languageCode: selectedLanguage,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : TEXT.retryFail;
      setRetryMessage(message);
      appLogger.warning("home", TEXT.retryAttemptFail, {
        playerId,
        languageCode: selectedLanguage,
        message,
      });
    } finally {
      setIsRetrying(false);
    }
  }

  return (
    <section className="space-y-4 pb-4">
      <div className="rounded-[1.75rem] border border-white/10 bg-stone-950/40 p-5 sm:rounded-[2rem] sm:p-6">
        <p className="text-sm text-amber-200">{TEXT.welcome}</p>
        <h2 className="mt-2 text-2xl font-bold sm:text-3xl">{`${nickname ?? TEXT.learner}${TEXT.honorific}`}</h2>
        <p className="mt-2 text-sm leading-6 text-stone-300">
          {TEXT.language}: {selectedLanguageLabel} / {TEXT.preparedWords}: {words.length}
        </p>
      </div>

      {runtimeConfig.useMockApi ? (
        <div className="rounded-[1.5rem] border border-sky-200/20 bg-sky-300/10 p-4 text-sm leading-6 text-sky-50">
          {TEXT.mockNotice}
        </div>
      ) : runtimeConfig.useStaticData ? (
        <div className="rounded-[1.5rem] border border-emerald-200/20 bg-emerald-300/10 p-4 text-sm leading-6 text-emerald-50">
          {TEXT.jsonNotice}
        </div>
      ) : null}

      {pendingSession ? (
        <div className="rounded-[1.75rem] border border-amber-300/40 bg-amber-300/10 p-4 sm:rounded-[2rem] sm:p-5">
          <p className="text-sm font-semibold leading-6 text-amber-100">{TEXT.pendingSession}</p>
          <p className="mt-2 text-sm leading-6 text-amber-50/90">
            {TEXT.pendingSavedAt}: {new Date(pendingSession.savedAt).toLocaleString("ko-KR")}
          </p>
          <p className="mt-1 text-sm leading-6 text-amber-50/90">{TEXT.pendingReason}: {pendingSession.reason}</p>
          <button
            className="mt-4 min-h-14 w-full rounded-2xl bg-amber-400 px-4 py-4 text-base font-semibold text-stone-950 disabled:opacity-60"
            type="button"
            onClick={() => void handleRetrySave()}
            disabled={isRetrying}
          >
            {isRetrying ? TEXT.retrySaving : TEXT.retrySave}
          </button>
        </div>
      ) : null}

      {retryMessage ? (
        <div className="rounded-2xl border border-white/10 bg-white/8 p-4 text-sm leading-6 text-stone-200">
          {retryMessage}
        </div>
      ) : null}

      <div className="grid gap-3">
        <button
          className="min-h-14 rounded-2xl bg-emerald-400 px-4 py-4 text-base font-semibold text-stone-950"
          type="button"
          onClick={() => void prepareWords("/play", "play")}
        >
          {TEXT.playStart}
        </button>
        <button
          className="min-h-14 rounded-2xl border border-sky-200/20 bg-sky-300/12 px-4 py-4 text-base font-semibold text-sky-50"
          type="button"
          onClick={() => void prepareWords("/practice", "practice")}
        >
          {TEXT.practiceStart}
        </button>
        <button
          className="min-h-14 rounded-2xl border border-white/15 bg-white/8 px-4 py-4 text-base font-semibold"
          type="button"
          onClick={() => navigate("/review")}
        >
          {TEXT.reviewCenter}
        </button>
        <button
          className="min-h-14 rounded-2xl border border-white/15 bg-white/8 px-4 py-4 text-base font-semibold"
          type="button"
          onClick={() => navigate("/stats")}
        >
          {TEXT.statsPage}
        </button>
        <button
          className="min-h-14 rounded-2xl border border-white/15 bg-white/8 px-4 py-4 text-base font-semibold"
          type="button"
          onClick={() => navigate("/languages")}
        >
          {TEXT.changeLanguage}
        </button>
        <button
          className="min-h-14 rounded-2xl border border-red-300/30 bg-red-400/10 px-4 py-4 text-base font-semibold text-red-100"
          type="button"
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          {TEXT.logout}
        </button>
      </div>
    </section>
  );
}
