import { useEffect, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { SessionResultState } from "../features/game/resultState";
import {
  DEFAULT_SESSION_CONFIG,
  getReadableSessionConfigLabels as getSessionConfigLabels,
  normalizeQuizModeFilter,
} from "../features/game/sessionConfig";
import { apiClient, type LeaderboardRecord } from "../services/apiClient";

const STANDARD_QUESTION_LIMIT = 20;

const TEXT = {
  noResultData: "결과 데이터가 없어 홈으로 돌아갑니다.",
  homeShort: "홈으로",
  saving: "세션 저장 중",
  saved: "세션 저장 완료",
  pending: "임시 저장 완료",
  statusTitle: "세션 상태",
  resultSummary: "결과 요약",
  score: "점수",
  correctAnswers: "정답 수",
  incorrectAnswers: "오답 수",
  accuracy: "정답률",
  failed: "탈락",
  heartsLeft: "남은 하트",
  totalQuestions: "총 문제",
  sessionMode: "플레이 모드",
  quizType: "출제 구성",
  totalTime: "세션 시간",
  averageResponse: "평균 반응",
  partOfSpeech: "품사",
  difficulty: "난이도",
  playAgain: "다시하기",
  practiceStart: "연습",
  moveReview: "복습",
  statsPage: "통계",
  backHome: "홈",
  gradeExcellent: "매우 좋았어요",
  gradeGood: "좋은 흐름",
  gradeKeepGoing: "계속 해봐요",
  gradeRetry: "복습 추천",
  primaryRecommended: "추천",
  standardModeLabel: "기본 플레이",
  practiceModeLabel: "연습 모드",
  reviewModeLabel: "복습 모드",
  wordToMeaningLabel: "단어 → 뜻",
  meaningToWordLabel: "뜻 → 단어",
  wrongAnswersTitle: "오답 정리",
  wrongAnswersEmpty: "이번 세션에는 오답이 없습니다.",
  promptLabel: "문제",
  correctAnswerLabel: "정답",
  rankingTitle: "순위표",
  rankingEmpty: "아직 기록이 없습니다.",
  rankingDate: "날짜",
  rankingTime: "시간",
  rankingScore: "점수",
} as const;

function getAccuracy(correctAnswers: number, totalQuestions: number) {
  if (totalQuestions === 0) {
    return 0;
  }

  return Math.round((correctAnswers / totalQuestions) * 100);
}

function getPerformanceGrade(accuracy: number, heartsLeft: number) {
  if (accuracy >= 90 && heartsLeft >= 2) {
    return TEXT.gradeExcellent;
  }

  if (accuracy >= 70) {
    return TEXT.gradeGood;
  }

  if (heartsLeft > 0) {
    return TEXT.gradeKeepGoing;
  }

  return TEXT.gradeRetry;
}

function getModeLabel(modeType: SessionResultState["payload"]["modeType"], displayMode?: SessionResultState["displayMode"]) {
  if (displayMode === "review") {
    return TEXT.reviewModeLabel;
  }

  return modeType === "practice" ? TEXT.practiceModeLabel : TEXT.standardModeLabel;
}

function getReplayPath(displayMode?: SessionResultState["displayMode"]) {
  if (displayMode === "review") {
    return "/review";
  }

  if (displayMode === "practice") {
    return "/practice";
  }

  return "/play";
}

function getQuizTypeLabel(quizType: SessionResultState["payload"]["quizType"]) {
  return quizType === "meaning_to_word" ? TEXT.meaningToWordLabel : TEXT.wordToMeaningLabel;
}

function formatDuration(totalTimeSec: number) {
  if (totalTimeSec < 60) {
    return `${totalTimeSec}초`;
  }

  const minutes = Math.floor(totalTimeSec / 60);
  const seconds = totalTimeSec % 60;
  return seconds === 0 ? `${minutes}분` : `${minutes}분 ${seconds}초`;
}

function formatAverageResponse(answerLog: SessionResultState["payload"]["answerLog"]) {
  if (answerLog.length === 0) {
    return "-";
  }

  const average = answerLog.reduce((sum, answer) => sum + answer.responseTimeMs, 0) / answerLog.length;
  return average < 1000 ? `${Math.round(average / 10) * 10}ms` : `${(average / 1000).toFixed(1)}s`;
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

export function ResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const result = location.state as SessionResultState | undefined;
  const [leaderboard, setLeaderboard] = useState<LeaderboardRecord[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadLeaderboard() {
      if (!result || result.payload.modeType !== "standard" || result.sessionConfig?.gameStyle === "self_check") {
        if (!cancelled) {
          setLeaderboard([]);
        }
        return;
      }

      try {
        const nextLeaderboard = await apiClient.getLeaderboard(result.payload.playerId, result.payload.languageCode);
        if (!cancelled) {
          setLeaderboard(
            nextLeaderboard
              .filter(
                (entry) =>
                  normalizeQuizModeFilter(entry.quizMode) === (result.sessionConfig ?? DEFAULT_SESSION_CONFIG).quizMode,
              )
              .slice(0, 10),
          );
        }
      } catch {
        if (!cancelled) {
          setLeaderboard([]);
        }
      }
    }

    void loadLeaderboard();

    return () => {
      cancelled = true;
    };
  }, [result]);

  if (!result) {
    return (
      <section className="rounded-[2rem] border border-white/10 bg-stone-950/40 p-6">
        <p className="text-sm text-stone-300">{TEXT.noResultData}</p>
        <button
          className="mt-4 rounded-2xl bg-amber-400 px-4 py-3 font-semibold text-stone-950"
          type="button"
          onClick={() => navigate("/home")}
        >
          {TEXT.homeShort}
        </button>
      </section>
    );
  }

  const { payload, saveStatus, message, incorrectAnswers = [] } = result;
  const sessionConfig = result.sessionConfig ?? DEFAULT_SESSION_CONFIG;
  const accuracy = getAccuracy(payload.correctAnswers, payload.totalQuestions);
  const didFailOut =
    payload.modeType === "standard" &&
    payload.heartsLeft <= 0 &&
    payload.totalQuestions < STANDARD_QUESTION_LIMIT;
  const isSelfCheckResult = sessionConfig.gameStyle === "self_check";
  const performanceGrade = getPerformanceGrade(accuracy, payload.heartsLeft);
  const modeLabel = getModeLabel(payload.modeType, result.displayMode);
  const quizTypeLabel = getQuizTypeLabel(payload.quizType);
  const durationLabel = formatDuration(payload.totalTimeSec);
  const averageResponseLabel = formatAverageResponse(payload.answerLog);
  const sessionConfigLabels = getSessionConfigLabels(sessionConfig, payload.languageCode);
  const replayPath = getReplayPath(result.displayMode);
  const primaryAction = isSelfCheckResult
    ? incorrectAnswers.length > 0
      ? TEXT.moveReview
      : TEXT.playAgain
    : saveStatus === "pending"
      ? TEXT.moveReview
      : accuracy >= 90
        ? TEXT.playAgain
        : accuracy >= 70
          ? TEXT.practiceStart
          : TEXT.moveReview;
  const actionCards = [
    {
      title: TEXT.playAgain,
      toneClassName:
        primaryAction === TEXT.playAgain
          ? "border-emerald-300/50 bg-gradient-to-br from-emerald-300/20 to-emerald-200/8 text-emerald-50 shadow-[0_16px_40px_rgba(16,185,129,0.12)]"
          : "border-white/10 bg-white/8 text-stone-100 hover:border-white/15 hover:bg-white/10",
      action: () => navigate(replayPath, { state: { sessionConfig, autoStart: true } }),
    },
    {
      title: TEXT.moveReview,
      toneClassName:
        primaryAction === TEXT.moveReview
          ? "border-amber-300/50 bg-gradient-to-br from-amber-300/20 to-amber-200/8 text-amber-50 shadow-[0_16px_40px_rgba(251,191,36,0.12)]"
          : "border-white/10 bg-white/8 text-stone-100 hover:border-white/15 hover:bg-white/10",
      action: () => navigate("/review", { state: { sessionConfig } }),
    },
    {
      title: TEXT.practiceStart,
      toneClassName:
        primaryAction === TEXT.practiceStart
          ? "border-sky-200/40 bg-gradient-to-br from-sky-300/20 to-cyan-200/8 text-sky-50 shadow-[0_16px_40px_rgba(56,189,248,0.12)]"
          : "border-white/10 bg-white/8 text-stone-100 hover:border-white/15 hover:bg-white/10",
      action: () => navigate("/practice", { state: { sessionConfig } }),
    },
  ].filter((card) => !isSelfCheckResult || card.title !== TEXT.practiceStart);

  return (
    <section className="space-y-3 pb-2">
      <div className="rounded-[1rem] border border-white/10 bg-stone-950/40 p-2 sm:rounded-[1.15rem] sm:p-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[12px] font-semibold text-amber-100">
            {TEXT.statusTitle}
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[12px] text-stone-200">
            {saveStatus === "saving" ? TEXT.saving : saveStatus === "saved" ? TEXT.saved : TEXT.pending}
          </span>
        </div>
        <h2 className="mt-1 text-[1.6rem] font-black tracking-[-0.03em] text-white sm:text-[1.92rem]">
          {TEXT.resultSummary}
        </h2>
        <div className="mt-1 grid grid-cols-2 gap-px">
          {isSelfCheckResult ? (
            <>
              <SummaryCard label={TEXT.correctAnswers} value={String(payload.correctAnswers)} compact />
              <SummaryCard label={TEXT.incorrectAnswers} value={String(payload.totalQuestions - payload.correctAnswers)} compact />
              <SummaryCard label={TEXT.accuracy} value={`${accuracy}%`} compact />
              <SummaryCard label={TEXT.totalQuestions} value={String(payload.totalQuestions)} compact />
            </>
          ) : (
            <>
              <SummaryCard label={TEXT.score} value={String(payload.score)} compact />
              <SummaryCard label={TEXT.correctAnswers} value={`${payload.correctAnswers} / ${payload.totalQuestions}`} compact />
              <SummaryCard label={TEXT.accuracy} value={didFailOut ? TEXT.failed : `${accuracy}%`} compact />
              <SummaryCard label={TEXT.heartsLeft} value={String(payload.heartsLeft)} compact />
            </>
          )}
        </div>
        <div className="mt-1 border-t border-white/10 pt-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[12px] text-stone-200">
              {didFailOut ? TEXT.failed : performanceGrade}
            </span>
          </div>
          <div className="mt-1 grid gap-1">
            {actionCards.map((card) => (
              <button
                key={card.title}
                aria-label={card.title}
                className={`min-h-10 rounded-2xl border px-3 py-2 text-left transition duration-200 ${card.toneClassName}`}
                type="button"
                onClick={card.action}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[14px] font-bold sm:text-[15px]">{card.title}</span>
                  {primaryAction === card.title ? (
                    <span className="rounded-full border border-white/10 bg-white/10 px-2 py-0.5 text-[11px]">
                      {TEXT.primaryRecommended}
                    </span>
                  ) : null}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {message ? (
        <div className="rounded-[0.7rem] border border-amber-300/30 bg-amber-300/10 p-2.5 text-[13px] leading-5 text-amber-50">
          {message}
        </div>
      ) : null}

      <div className="rounded-[0.72rem] border border-white/10 bg-stone-950/40 p-3">
        <h3 className="text-[1.02rem] font-black tracking-[-0.03em] text-white">{TEXT.wrongAnswersTitle}</h3>
        <div className="mt-2 space-y-2">
          {incorrectAnswers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-3 py-3 text-sm text-stone-300">
              {TEXT.wrongAnswersEmpty}
            </div>
          ) : (
            incorrectAnswers.map((item, index) => (
              <div
                key={`${item.shownPrompt}-${item.correctAnswer}-${index}`}
                className="rounded-2xl border border-white/10 bg-white/6 px-3 py-2.5 text-sm leading-6 text-stone-200"
              >
                <span className="text-stone-400">{TEXT.promptLabel}:</span>{" "}
                <span className="font-semibold text-stone-100">{item.shownPrompt}</span>
                <span className="mx-2 text-stone-500">/</span>
                <span className="text-stone-400">{TEXT.correctAnswerLabel}:</span>{" "}
                <span className="font-semibold text-emerald-100">{item.correctAnswer}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-[0.72rem] border border-white/10 bg-white/8 p-2">
        <div className="grid grid-cols-2 gap-1 sm:grid-cols-4">
          <SummaryCard label={TEXT.sessionMode} value={modeLabel} compact />
          <SummaryCard label={TEXT.quizType} value={quizTypeLabel} compact />
          <SummaryCard label={TEXT.totalTime} value={durationLabel} compact />
          <SummaryCard label={TEXT.averageResponse} value={averageResponseLabel} compact />
        </div>
        <div className="mt-1 rounded-[0.6rem] border border-white/10 bg-stone-950/30 p-1.5">
          <div className="flex flex-wrap gap-1">
            <Chip>{TEXT.sessionMode}: {sessionConfigLabels.gameStyle}</Chip>
            <Chip>{TEXT.partOfSpeech}: {sessionConfigLabels.partOfSpeech}</Chip>
            <Chip>{TEXT.difficulty}: {sessionConfigLabels.difficulty}</Chip>
            <Chip>{TEXT.quizType}: {sessionConfigLabels.quizMode}</Chip>
          </div>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            className="min-h-11 rounded-2xl border border-white/15 bg-white/8 px-4 py-3 text-[15px] font-bold text-white"
            type="button"
            onClick={() => navigate("/stats")}
          >
            {TEXT.statsPage}
          </button>
          <button
            className="min-h-11 rounded-2xl border border-white/15 bg-white/8 px-4 py-3 text-[15px] font-bold text-white"
            type="button"
            onClick={() => navigate("/home")}
          >
            {TEXT.backHome}
          </button>
        </div>
      </div>

      {payload.modeType === "standard" && !isSelfCheckResult ? (
        <div className="rounded-[1.1rem] border border-white/10 bg-stone-950/40 p-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-[1.02rem] font-black tracking-[-0.03em] text-white">{TEXT.rankingTitle}</h3>
            <div className="grid grid-cols-[1.2fr_1fr_0.7fr] gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-400">
              <span>{TEXT.rankingDate}</span>
              <span>{TEXT.rankingTime}</span>
              <span className="text-right">{TEXT.rankingScore}</span>
            </div>
          </div>
          <div className="mt-2 space-y-1.5">
            {leaderboard.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-3 py-3 text-sm text-stone-300">
                {TEXT.rankingEmpty}
              </div>
            ) : (
              leaderboard.map((entry, index) => {
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
      ) : null}
    </section>
  );
}

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-stone-300">
      {children}
    </span>
  );
}

type SummaryCardProps = {
  label: string;
  value: string;
  compact?: boolean;
};

function SummaryCard({ label, value, compact = false }: SummaryCardProps) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/8 text-center ${compact ? "p-3" : "p-4"}`}>
      <p className="text-[11px] text-stone-400">{label}</p>
      <p className={`mt-1 font-bold text-white ${compact ? "text-[1.02rem]" : "text-2xl"}`}>{value}</p>
    </div>
  );
}
