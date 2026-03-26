import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { SessionConfig } from "../features/game/sessionConfig";
import { readGlobalLeaderboard, type LeaderboardEntry } from "../services/sessionRecovery";
import { useLanguageStore } from "../stores/languageStore";

type QuizModeValue = SessionConfig["quizMode"];

const QUIZ_MODE_OPTIONS: Array<{ value: QuizModeValue; label: string }> = [
  { value: "kanji_to_meaning", label: "한자 → 뜻" },
  { value: "furigana_to_meaning", label: "후리 → 뜻" },
  { value: "audio_to_meaning", label: "음성 → 뜻" },
  { value: "meaning_to_word", label: "뜻 → 단어" },
];

const TEXT = {
  title: "전체 순위표",
  empty: "아직 기록이 없습니다.",
  date: "날짜",
  time: "시간",
  score: "점수",
  nickname: "닉네임",
  home: "홈으로 가기",
} as const;

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

export function OverallLeaderboardPage() {
  const navigate = useNavigate();
  const selectedLanguage = useLanguageStore((state) => state.selectedLanguage);
  const availableLanguages = useLanguageStore((state) => state.availableLanguages);
  const [selectedQuizMode, setSelectedQuizMode] = useState<QuizModeValue>("kanji_to_meaning");

  const languageLabel =
    availableLanguages.find((language) => language.languageCode === selectedLanguage)?.label ??
    selectedLanguage ??
    "-";

  const leaderboard = useMemo(() => {
    if (!selectedLanguage) {
      return [];
    }

    return readGlobalLeaderboard(selectedLanguage)
      .filter((entry) => normalizeQuizMode(entry) === selectedQuizMode)
      .slice(0, 50);
  }, [selectedLanguage, selectedQuizMode]);

  return (
    <section className="space-y-4 pb-4">
      <div className="rounded-[1.5rem] border border-white/10 bg-stone-950/40 p-4 sm:rounded-[1.75rem] sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold sm:text-2xl">{TEXT.title}</h2>
          <span className="text-sm font-semibold text-amber-200">{languageLabel}</span>
        </div>
      </div>

      <div className="rounded-[1.1rem] border border-white/10 bg-stone-950/40 p-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
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

        <div className="mt-3 flex items-center justify-between gap-3">
          <h3 className="text-[1.02rem] font-black tracking-[-0.03em] text-white">{TEXT.title}</h3>
          <div className="grid grid-cols-[1fr_1.1fr_1fr_0.7fr] gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-400">
            <span>{TEXT.nickname}</span>
            <span>{TEXT.date}</span>
            <span>{TEXT.time}</span>
            <span className="text-right">{TEXT.score}</span>
          </div>
        </div>

        <div className="mt-2 space-y-1.5">
          {leaderboard.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-3 py-3 text-sm text-stone-300">
              {TEXT.empty}
            </div>
          ) : (
            leaderboard.map((entry, index) => {
              const { date, time } = formatDateParts(entry.playedAt);

              return (
                <div
                  key={`${entry.playedAt}-${entry.score}-${index}`}
                  className="grid grid-cols-[auto_1fr_1.1fr_1fr_0.7fr] items-center gap-2 rounded-2xl border border-white/10 bg-white/6 px-3 py-2"
                >
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-amber-300/20 bg-amber-300/10 text-[12px] font-black text-amber-100">
                    {index + 1}
                  </span>
                  <span className="truncate text-[12px] font-semibold text-stone-100">
                    {entry.nickname ?? entry.playerId ?? "익명"}
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

      <button
        className="min-h-12 w-full rounded-2xl border border-white/15 bg-white/8 px-4 py-3 text-sm font-semibold text-white"
        type="button"
        onClick={() => navigate("/home")}
      >
        {TEXT.home}
      </button>
    </section>
  );
}
