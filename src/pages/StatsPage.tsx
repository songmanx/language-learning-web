import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DEFAULT_SESSION_CONFIG,
  getQuizModeLabel,
  getSupportedQuizModes,
  normalizeQuizModeFilter,
  type SessionConfig,
} from "../features/game/sessionConfig";
import {
  clearPlayerProgress,
  readDailyStatsSnapshot,
  readLeaderboard,
  readSessionConfigSnapshot,
  type LeaderboardEntry,
} from "../services/sessionRecovery";
import { useAuthStore } from "../stores/authStore";
import { useLanguageStore } from "../stores/languageStore";

type QuizModeValue = SessionConfig["quizMode"];

const TEXT = {
  statsTitle: "\uD1B5\uACC4",
  noStats: "\uC544\uC9C1 \uC313\uC778 \uD1B5\uACC4\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4. \uBA3C\uC800 \uD50C\uB808\uC774\uD558\uAC70\uB098 \uC5F0\uC2B5\uC744 \uC2DC\uC791\uD574 \uC8FC\uC138\uC694.",
  statsReady: "\uB204\uC801 \uC9D1\uACC4 \uC644\uB8CC",
  statsEmpty: "\uC544\uC9C1 \uC9D1\uACC4\uD560 \uAE30\uB85D\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.",
  performanceSummary: "\uC131\uACFC \uC694\uC57D",
  quickActionsTitle: "\uBC14\uB85C \uC774\uB3D9",
  recentFlow: "\uCD5C\uADFC \uD50C\uB808\uC774",
  reviewAction: "\uBCF5\uC2B5",
  playAction: "\uD50C\uB808\uC774",
  homeAction: "\uD648",
  recommendedBadge: "\uCD94\uCC9C",
  totalSessions: "\uD50C\uB808\uC774 \uC218",
  practiceSessions: "\uC5F0\uC2B5 \uC218",
  totalScore: "\uB204\uC801 \uC810\uC218",
  bestScore: "\uCD5C\uACE0 \uC810\uC218",
  accuracy: "\uC815\uB2F5\uB960",
  totalQuestions: "\uD47C \uBB38\uC81C \uC218",
  correctAnswers: "\uB9DE\uD78C \uBB38\uC81C \uC218",
  lastPlayedAt: "\uB9C8\uC9C0\uB9C9 \uD50C\uB808\uC774",
  reviewCenter: "\uBCF5\uC2B5",
  resetAll: "\uB0B4 \uAE30\uB85D \uC0AD\uC81C",
  resetConfirm: "\uD604\uC7AC \uB85C\uADF8\uC778\uD55C \uB0B4 \uAE30\uB85D\uB9CC \uCD08\uAE30\uD654\uB429\uB2C8\uB2E4. \uACC4\uC18D\uD560\uAE4C\uC694?",
  rankingTitle: "\uC21C\uC704\uD45C",
  rankingEmpty: "\uC544\uC9C1 \uAE30\uB85D\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.",
  rankingDate: "\uB0A0\uC9DC",
  rankingTime: "\uC2DC\uAC04",
  rankingScore: "\uC810\uC218",
} as const;

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("ko-KR");
}

function formatDateParts(value: string) {
  const date = new Date(value);

  return {
    date: date.toLocaleDateString("ko-KR"),
    time: date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
  };
}

function normalizeQuizMode(entry: LeaderboardEntry) {
  return normalizeQuizModeFilter(entry.quizMode);
}

export function StatsPage() {
  const navigate = useNavigate();
  const playerId = useAuthStore((state) => state.playerId);
  const selectedLanguage = useLanguageStore((state) => state.selectedLanguage);
  const availableLanguages = useLanguageStore((state) => state.availableLanguages);
  const [selectedQuizMode, setSelectedQuizMode] = useState<QuizModeValue>("kanji_to_meaning");
  const [resetTick, setResetTick] = useState(0);
  const quizModeOptions = useMemo(
    () =>
      getSupportedQuizModes(selectedLanguage).map((value) => ({
        value,
        label: getQuizModeLabel(value, selectedLanguage),
      })),
    [selectedLanguage],
  );

  const snapshot = useMemo(() => {
    if (!playerId || !selectedLanguage) {
      return null;
    }

    return readDailyStatsSnapshot(playerId, selectedLanguage);
  }, [playerId, resetTick, selectedLanguage]);

  const sessionConfigSnapshot = useMemo(() => {
    if (!playerId || !selectedLanguage) {
      return null;
    }

    return readSessionConfigSnapshot(playerId, selectedLanguage);
  }, [playerId, resetTick, selectedLanguage]);

  const filteredLeaderboard = useMemo(() => {
    if (!playerId || !selectedLanguage) {
      return [];
    }

    return readLeaderboard(playerId, selectedLanguage)
      .filter((entry) => normalizeQuizMode(entry) === selectedQuizMode)
      .slice(0, 10);
  }, [playerId, resetTick, selectedLanguage, selectedQuizMode]);

  const languageLabel =
    availableLanguages.find((language) => language.languageCode === selectedLanguage)?.label ??
    selectedLanguage ??
    "-";

  const recommendedAction =
    snapshot && snapshot.averageAccuracy >= 85 ? TEXT.playAction : TEXT.reviewCenter;

  const actionCards = [
    {
      title: TEXT.reviewAction,
      recommended: recommendedAction === TEXT.reviewCenter,
      toneClassName:
        recommendedAction === TEXT.reviewCenter
          ? "border-amber-300/30 bg-amber-300/10"
          : "border-white/10 bg-white/8",
      onClick: () => navigate("/review"),
    },
    {
      title: TEXT.playAction,
      recommended: recommendedAction === TEXT.playAction,
      toneClassName:
        recommendedAction === TEXT.playAction
          ? "border-emerald-300/30 bg-emerald-300/10"
          : "border-white/10 bg-white/8",
      onClick: () =>
        navigate("/play", {
          state: { sessionConfig: sessionConfigSnapshot?.sessionConfig ?? DEFAULT_SESSION_CONFIG },
        }),
    },
    {
      title: TEXT.homeAction,
      recommended: false,
      toneClassName: "border-white/10 bg-white/8",
      onClick: () => navigate("/home"),
    },
  ];

  function handleResetAll() {
    if (!playerId || !selectedLanguage) {
      return;
    }

    if (!window.confirm(TEXT.resetConfirm)) {
      return;
    }

    clearPlayerProgress(playerId, selectedLanguage);
    setResetTick((previous) => previous + 1);
  }

  return (
    <section className="space-y-4 pb-4">
      <div className="rounded-[1.5rem] border border-white/10 bg-stone-950/40 p-4 sm:rounded-[1.75rem] sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold sm:text-2xl">{TEXT.statsTitle}</h2>
          <span className="text-sm font-semibold text-amber-200">{languageLabel}</span>
        </div>
      </div>

      {snapshot ? (
        <div className="rounded-[1.75rem] border border-white/10 bg-white/8 p-5 sm:rounded-[2rem] sm:p-6">
          <h3 className="text-lg font-semibold">{TEXT.performanceSummary}</h3>
          <p className="mt-3 text-4xl font-bold text-emerald-200">{snapshot.averageAccuracy}%</p>
          <div className="mt-4 rounded-2xl border border-white/10 bg-stone-950/30 p-4">
            <p className="text-xs text-stone-400">{TEXT.recentFlow}</p>
            <p className="mt-2 text-sm leading-6 text-stone-100">{formatDateTime(snapshot.lastPlayedAt)}</p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <DetailRow label={TEXT.totalQuestions} value={String(snapshot.totalQuestions)} />
            <DetailRow label={TEXT.correctAnswers} value={String(snapshot.correctAnswers)} />
            <DetailRow label={TEXT.lastPlayedAt} value={formatDateTime(snapshot.lastPlayedAt)} />
            <DetailRow label={TEXT.accuracy} value={`${snapshot.averageAccuracy}%`} />
          </div>
        </div>
      ) : (
        <div className="rounded-[1.75rem] border border-dashed border-white/15 bg-white/6 p-5 text-sm leading-6 text-stone-300">
          {TEXT.noStats}
        </div>
      )}

      <div className="rounded-[1.1rem] border border-white/10 bg-stone-950/40 p-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-[1.02rem] font-black tracking-[-0.03em] text-white">{TEXT.rankingTitle}</h3>
          <div className="grid grid-cols-[1.2fr_1fr_0.7fr] gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-400">
            <span>{TEXT.rankingDate}</span>
            <span>{TEXT.rankingTime}</span>
            <span className="text-right">{TEXT.rankingScore}</span>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {quizModeOptions.map((option) => {
            const isSelected = selectedQuizMode === option.value;

            return (
              <button
                key={option.value}
                className={`min-h-10 rounded-2xl border px-3 py-2 text-sm font-semibold transition ${
                  isSelected
                    ? "border-amber-300/30 bg-amber-300/12 text-amber-100"
                    : "border-white/10 bg-white/6 text-stone-200 hover:bg-white/10"
                }`}
                type="button"
                onClick={() => setSelectedQuizMode(option.value)}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        <div className="mt-2 space-y-1.5">
          {filteredLeaderboard.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-3 py-3 text-sm text-stone-300">
              {TEXT.rankingEmpty}
            </div>
          ) : (
            filteredLeaderboard.map((entry, index) => {
              const { date, time } = formatDateParts(entry.playedAt);

              return (
                <div
                  key={`${entry.playedAt}-${entry.score}-${index}`}
                  className="grid grid-cols-[auto_1.2fr_1fr_0.7fr] items-center gap-2 rounded-2xl border border-white/10 bg-white/6 px-3 py-2"
                >
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-amber-300/20 bg-amber-300/10 text-[12px] font-black text-amber-100">
                    {index + 1}
                  </span>
                  <span className="text-[12px] font-medium text-stone-200">{date}</span>
                  <span className="text-[12px] font-medium text-stone-200">{time}</span>
                  <span className="text-right text-[13px] font-black text-white">{entry.score}</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-white/10 bg-white/8 p-5 sm:rounded-[2rem] sm:p-6">
        <h3 className="text-lg font-semibold">{TEXT.quickActionsTitle}</h3>
        <div className="mt-3 grid gap-3">
          {actionCards.map((card) => (
            <button
              key={card.title}
              aria-label={card.title}
              className={`min-h-12 rounded-2xl border px-4 py-3 text-left ${card.toneClassName}`}
              type="button"
              onClick={card.onClick}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-base font-bold">{card.title}</span>
                {card.recommended ? (
                  <span className="rounded-full border border-white/10 bg-white/10 px-2 py-1 text-[11px]">
                    {TEXT.recommendedBadge}
                  </span>
                ) : null}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-white/10 bg-white/8 p-5 sm:rounded-[2rem] sm:p-6">
        <div className="w-full rounded-2xl border border-white/10 bg-stone-950/30 px-4 py-2 text-sm text-stone-100">
          {snapshot ? TEXT.statsReady : TEXT.statsEmpty}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <StatCard label={TEXT.totalSessions} value={String(snapshot?.sessionCount ?? 0)} compact />
          <StatCard label={TEXT.practiceSessions} value={String(snapshot?.practiceSessionCount ?? 0)} compact />
          <StatCard label={TEXT.totalScore} value={String(snapshot?.totalScore ?? 0)} compact />
          <StatCard label={TEXT.bestScore} value={String(snapshot?.bestScore ?? 0)} compact />
        </div>
      </div>

      <button
        className="min-h-12 w-full rounded-2xl border border-rose-300/25 bg-rose-400/10 px-4 py-3 text-sm font-semibold text-rose-100"
        type="button"
        onClick={handleResetAll}
      >
        {TEXT.resetAll}
      </button>
    </section>
  );
}

type StatCardProps = {
  label: string;
  value: string;
  compact?: boolean;
};

function StatCard({ label, value, compact = false }: StatCardProps) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/8 text-center ${compact ? "p-3" : "p-4"}`}>
      <p className="text-xs text-stone-400">{label}</p>
      <p className={`mt-2 font-bold ${compact ? "text-xl" : "text-2xl"}`}>{value}</p>
    </div>
  );
}

type DetailRowProps = {
  label: string;
  value: string;
};

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-stone-950/30 p-4">
      <p className="text-xs text-stone-400">{label}</p>
      <p className="mt-2 text-sm leading-6 text-stone-100">{value}</p>
    </div>
  );
}
