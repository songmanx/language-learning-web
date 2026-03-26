import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DEFAULT_SESSION_CONFIG, type SessionConfig } from "../features/game/sessionConfig";
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

const QUIZ_MODE_OPTIONS: Array<{ value: QuizModeValue; label: string }> = [
  { value: "kanji_to_meaning", label: "한자 → 뜻" },
  { value: "furigana_to_meaning", label: "후리 → 뜻" },
  { value: "audio_to_meaning", label: "음성 → 뜻" },
  { value: "meaning_to_word", label: "뜻 → 단어" },
];

const TEXT = {
  statsTitle: "기본 통계",
  noStats: "아직 표시할 통계가 없습니다. 먼저 플레이나 연습을 진행해 주세요.",
  statsReady: "누적 집계 완료",
  statsEmpty: "통계 대기 중",
  performanceSummary: "성과 요약",
  quickActionsTitle: "바로 이동",
  recentFlow: "최근 흐름",
  reviewAction: "복습",
  playAction: "플레이",
  homeAction: "홈",
  recommendedBadge: "추천",
  totalSessions: "누적 세션",
  practiceSessions: "연습 세션",
  totalScore: "누적 점수",
  bestScore: "최고 점수",
  accuracy: "평균 정답률",
  totalQuestions: "누적 문제 수",
  correctAnswers: "누적 정답 수",
  lastPlayedAt: "마지막 플레이",
  reviewCenter: "복습",
  resetAll: "내 기록 삭제",
  resetConfirm: "현재 로그인한 내 기록만 초기화됩니다. 계속할까요?",
  rankingTitle: "순위표",
  rankingEmpty: "아직 기록이 없습니다.",
  rankingDate: "날짜",
  rankingTime: "시간",
  rankingScore: "점수",
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
  return (entry.quizMode ?? "word_to_meaning") as QuizModeValue;
}

export function StatsPage() {
  const navigate = useNavigate();
  const playerId = useAuthStore((state) => state.playerId);
  const selectedLanguage = useLanguageStore((state) => state.selectedLanguage);
  const availableLanguages = useLanguageStore((state) => state.availableLanguages);
  const [selectedQuizMode, setSelectedQuizMode] = useState<QuizModeValue>("kanji_to_meaning");
  const [resetTick, setResetTick] = useState(0);

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
          {QUIZ_MODE_OPTIONS.map((option) => {
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
