import { useLocation, useNavigate } from "react-router-dom";
import type { SessionResultState } from "../features/game/resultState";
import { DEFAULT_SESSION_CONFIG, getSessionConfigLabels } from "../features/game/sessionConfig";
import { useLanguageStore } from "../stores/languageStore";

const TEXT = {
  noResultData: "\uACB0\uACFC \uB370\uC774\uD130\uAC00 \uC5C6\uC5B4 \uD648\uC73C\uB85C \uB3CC\uC544\uAC11\uB2C8\uB2E4.",
  homeShort: "\uD648\uC73C\uB85C",
  saving: "\uC138\uC158 \uC800\uC7A5 \uC911",
  saved: "\uC138\uC158 \uC800\uC7A5 \uC644\uB8CC",
  pending: "\uC138\uC158 \uC784\uC2DC \uC800\uC7A5 \uC644\uB8CC",
  statusTitle: "\uC138\uC158 \uC0C1\uD0DC",
  resultSummary: "\uACB0\uACFC \uC694\uC57D",
  sessionSnapshot: "\uC138\uC158 \uC2A4\uB0C5\uC0F7",
  score: "\uC810\uC218",
  correctAnswers: "\uC815\uB2F5 \uC218",
  accuracy: "\uC815\uB2F5\uB960",
  heartsLeft: "\uB0A8\uC740 \uD558\uD2B8",
  selectedLanguage: "\uC120\uD0DD \uC5B8\uC5B4",
  sessionMode: "\uD50C\uB808\uC774 \uBAA8\uB4DC",
  quizType: "\uCD9C\uC81C \uAD6C\uC131",
  totalTime: "\uC138\uC158 \uC2DC\uAC04",
  averageResponse: "\uD3C9\uADE0 \uBC18\uC751",
  sessionConfigTitle: "\uC138\uC158 \uAD6C\uC131",
  partOfSpeech: "\uD488\uC0AC",
  difficulty: "\uB09C\uC774\uB3C4",
  reviewPreview: "\uBCF5\uC2B5 \uC0C1\uD0DC \uBBF8\uB9AC\uBCF4\uAE30",
  stage: "\uB2E8\uACC4",
  priority: "\uC6B0\uC120",
  last: "\uACB0\uACFC",
  nextActionTitle: "\uB2E4\uC74C \uD559\uC2B5 \uC81C\uC548",
  quickActionsTitle: "\uBC14\uB85C \uC774\uB3D9",
  recommendedRoute: "\uCD94\uCC9C \uACBD\uB85C",
  savingGuide: "\uC800\uC7A5 \uC911",
  savedGuide: "\uC800\uC7A5 \uC644\uB8CC",
  pendingGuide: "\uC784\uC2DC \uC800\uC7A5 \uC0C1\uD0DC",
  performanceTitle: "\uC138\uC158 \uD3C9\uAC00",
  recommendationTitle: "\uCD94\uCC9C \uB2E4\uC74C \uD589\uB3D9",
  playAgain: "\uC7AC\uB3C4\uC804",
  practiceStart: "\uC5F0\uC2B5",
  moveReview: "\uBCF5\uC2B5",
  statsPage: "\uD1B5\uACC4",
  backHome: "\uD648",
  gradeExcellent: "\uB9E4\uC6B0 \uC88B\uC544\uC694",
  gradeGood: "\uC88B\uC740 \uD750\uB984\uC785\uB2C8\uB2E4",
  gradeKeepGoing: "\uD55C \uD310 \uB354 \uC62C\uB824\uBCF4\uC138\uC694",
  gradeRetry: "\uBCF5\uC2B5\uC73C\uB85C \uBC14\uB85C \uC774\uC5B4\uAC00\uBA74 \uC88B\uC2B5\uB2C8\uB2E4",
  recommendationReview: "\uBCF5\uC2B5\uC13C\uD130\uC5D0\uC11C \uC6B0\uC120 \uBCF5\uC2B5 \uBAA9\uB85D\uC744 \uD655\uC778\uD574 \uBCF4\uC138\uC694.",
  recommendationPractice: "\uC5F0\uC2B5 \uBAA8\uB4DC\uB85C \uBD80\uB2F4 \uC5C6\uC774 \uD55C \uBC88 \uB354 \uAC10\uAC01\uC744 \uC62C\uB824 \uBCF4\uC138\uC694.",
  recommendationPlay: "\uAE30\uBCF8 \uD50C\uB808\uC774\uB97C \uD55C \uD310 \uB354 \uC9C4\uD589\uD574 \uC810\uC218 \uD750\uB984\uC744 \uC774\uC5B4\uAC00\uC138\uC694.",
  recommendationReviewDetail: "\uBCF5\uC2B5",
  recommendationPracticeDetail: "\uC5F0\uC2B5",
  recommendationPlayDetail: "\uC7AC\uB3C4\uC804",
  primaryRecommended: "\uCD94\uCC9C",
  standardModeLabel: "\uAE30\uBCF8 \uD50C\uB808\uC774",
  practiceModeLabel: "\uC5F0\uC2B5 \uBAA8\uB4DC",
  wordToMeaningLabel: "\uB2E8\uC5B4 -> \uB73B",
  meaningToWordLabel: "\uB73B -> \uB2E8\uC5B4",
  newStage: "\uC2E0\uADDC",
  learningStage: "\uD559\uC2B5 \uC911",
  reviewStage: "\uBCF5\uC2B5 \uB300\uAE30",
  correctResult: "\uC815\uB2F5",
  wrongResult: "\uC624\uB2F5",
} as const;

function getAccuracy(correctAnswers: number, totalQuestions: number) {
  if (totalQuestions === 0) {
    return 0;
  }

  return Math.round((correctAnswers / totalQuestions) * 100);
}

function getPerformanceSummary(accuracy: number, heartsLeft: number) {
  if (accuracy >= 90 && heartsLeft >= 2) {
    return {
      grade: TEXT.gradeExcellent,
      recommendation: TEXT.recommendationPlay,
    };
  }

  if (accuracy >= 70) {
    return {
      grade: TEXT.gradeGood,
      recommendation: TEXT.recommendationPractice,
    };
  }

  if (heartsLeft > 0) {
    return {
      grade: TEXT.gradeKeepGoing,
      recommendation: TEXT.recommendationPractice,
    };
  }

  return {
    grade: TEXT.gradeRetry,
    recommendation: TEXT.recommendationReview,
  };
}

function getModeLabel(modeType: SessionResultState["payload"]["modeType"]) {
  return modeType === "practice" ? TEXT.practiceModeLabel : TEXT.standardModeLabel;
}

function getQuizTypeLabel(quizType: SessionResultState["payload"]["quizType"]) {
  return quizType === "meaning_to_word" ? TEXT.meaningToWordLabel : TEXT.wordToMeaningLabel;
}

function formatDuration(totalTimeSec: number) {
  if (totalTimeSec < 60) {
    return `${totalTimeSec}\uCD08`;
  }

  const minutes = Math.floor(totalTimeSec / 60);
  const seconds = totalTimeSec % 60;
  return seconds === 0 ? `${minutes}\uBD84` : `${minutes}\uBD84 ${seconds}\uCD08`;
}

function formatAverageResponse(answerLog: SessionResultState["payload"]["answerLog"]) {
  if (answerLog.length === 0) {
    return "-";
  }

  const average = answerLog.reduce((sum, answer) => sum + answer.responseTimeMs, 0) / answerLog.length;
  return average < 1000 ? `${Math.round(average / 10) * 10}ms` : `${(average / 1000).toFixed(1)}s`;
}

function getStageLabel(stage: string) {
  if (stage === "new") {
    return TEXT.newStage;
  }

  if (stage === "learning") {
    return TEXT.learningStage;
  }

  if (stage === "review") {
    return TEXT.reviewStage;
  }

  return stage;
}

function getLastResultLabel(lastResult: string) {
  if (lastResult === "correct") {
    return TEXT.correctResult;
  }

  if (lastResult === "wrong") {
    return TEXT.wrongResult;
  }

  return lastResult;
}

export function ResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const result = location.state as SessionResultState | undefined;
  const availableLanguages = useLanguageStore((state) => state.availableLanguages);

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

  const { payload, saveStatus, message } = result;
  const accuracy = getAccuracy(payload.correctAnswers, payload.totalQuestions);
  const performance = getPerformanceSummary(accuracy, payload.heartsLeft);
  const modeLabel = getModeLabel(payload.modeType);
  const quizTypeLabel = getQuizTypeLabel(payload.quizType);
  const durationLabel = formatDuration(payload.totalTimeSec);
  const averageResponseLabel = formatAverageResponse(payload.answerLog);
  const sessionConfig = result.sessionConfig ?? DEFAULT_SESSION_CONFIG;
  const sessionConfigLabels = getSessionConfigLabels(sessionConfig);
  const selectedLanguageLabel =
    availableLanguages.find((language) => language.languageCode === payload.languageCode)?.label ??
    payload.languageCode;
  const primaryAction =
    saveStatus === "pending"
      ? TEXT.moveReview
      : accuracy >= 90
        ? TEXT.playAgain
        : accuracy >= 70
          ? TEXT.practiceStart
          : TEXT.moveReview;
  const actionCards = [
    {
      title: TEXT.moveReview,
      description: TEXT.recommendationReviewDetail,
      toneClassName:
        primaryAction === TEXT.moveReview
          ? "border-amber-300/50 bg-gradient-to-br from-amber-300/20 to-amber-200/8 text-amber-50 shadow-[0_16px_40px_rgba(251,191,36,0.12)]"
          : "border-white/10 bg-white/8 text-stone-100 hover:border-white/15 hover:bg-white/10",
      action: () => navigate("/review"),
    },
    {
      title: TEXT.practiceStart,
      description: TEXT.recommendationPracticeDetail,
      toneClassName:
        primaryAction === TEXT.practiceStart
          ? "border-sky-200/40 bg-gradient-to-br from-sky-300/20 to-cyan-200/8 text-sky-50 shadow-[0_16px_40px_rgba(56,189,248,0.12)]"
          : "border-white/10 bg-white/8 text-stone-100 hover:border-white/15 hover:bg-white/10",
      action: () => navigate("/practice", { state: { sessionConfig } }),
    },
    {
      title: TEXT.playAgain,
      description: TEXT.recommendationPlayDetail,
      toneClassName:
        primaryAction === TEXT.playAgain
          ? "border-emerald-300/50 bg-gradient-to-br from-emerald-300/20 to-emerald-200/8 text-emerald-50 shadow-[0_16px_40px_rgba(16,185,129,0.12)]"
          : "border-white/10 bg-white/8 text-stone-100 hover:border-white/15 hover:bg-white/10",
      action: () => navigate("/play", { state: { sessionConfig } }),
    },
  ];
  return (
    <section className="space-y-4 pb-4">
      <div className="rounded-[1.75rem] border border-white/10 bg-stone-950/40 p-5 sm:rounded-[2rem] sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-amber-100">
            {TEXT.statusTitle}
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-stone-200">
            {saveStatus === "saving" ? TEXT.saving : saveStatus === "saved" ? TEXT.saved : TEXT.pending}
          </span>
        </div>
        <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] text-white sm:text-3xl">{TEXT.resultSummary}</h2>
        <p className="mt-2 text-sm leading-6 text-stone-400">
          {TEXT.selectedLanguage}: {selectedLanguageLabel}
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <SummaryCard label={TEXT.score} value={String(payload.score)} />
          <SummaryCard label={TEXT.correctAnswers} value={`${payload.correctAnswers} / ${payload.totalQuestions}`} />
          <SummaryCard label={TEXT.accuracy} value={`${accuracy}%`} />
          <SummaryCard label={TEXT.heartsLeft} value={String(payload.heartsLeft)} />
        </div>
        <div className="mt-3 border-t border-white/10 pt-3">
          <div className="flex flex-wrap items-center gap-1">
            <span className="rounded-full border border-white/10 bg-white/10 px-2 py-1 text-[10px] text-stone-200">
              {TEXT.recommendedRoute}: {primaryAction}
            </span>
            <span className="rounded-full border border-emerald-300/15 bg-emerald-300/10 px-2 py-1 text-[10px] text-emerald-100">
              {TEXT.performanceTitle}: {performance.grade}
            </span>
          </div>
          <div className="mt-2 grid gap-1.5">
            {actionCards.map((card) => (
              <button
                key={card.title}
                aria-label={card.title}
                className={`min-h-8 rounded-2xl border px-2.5 py-1.5 text-left transition duration-200 ${card.toneClassName}`}
                type="button"
                onClick={card.action}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[12px] font-semibold">{card.title}</span>
                  {primaryAction === card.title ? (
                    <span className="rounded-full border border-white/10 bg-white/10 px-2 py-1 text-[11px]">
                      {TEXT.primaryRecommended}
                    </span>
                  ) : null}
                </div>
                <p className="mt-0.5 text-[10px] text-stone-300/90">{card.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {message ? (
        <div className="rounded-[1.25rem] border border-amber-300/30 bg-amber-300/10 p-3 text-[13px] leading-5 text-amber-50">
          {message}
        </div>
      ) : null}

      <div className="rounded-[1.25rem] border border-white/10 bg-white/8 p-2.5 sm:rounded-[1.5rem] sm:p-3">
        <h3 className="text-sm font-semibold">{TEXT.sessionSnapshot}</h3>
        <div className="mt-1.5 grid grid-cols-2 gap-1 sm:grid-cols-4">
          <SummaryCard label={TEXT.sessionMode} value={modeLabel} compact />
          <SummaryCard label={TEXT.quizType} value={quizTypeLabel} compact />
          <SummaryCard label={TEXT.totalTime} value={durationLabel} compact />
          <SummaryCard label={TEXT.averageResponse} value={averageResponseLabel} compact />
        </div>
        <div className="mt-1.5 rounded-[0.95rem] border border-white/10 bg-stone-950/30 p-1.5">
          <p className="text-[11px] text-amber-200">{TEXT.sessionConfigTitle}</p>
          <div className="mt-1 flex flex-wrap gap-1">
            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-stone-300">
              {TEXT.partOfSpeech}: {sessionConfigLabels.partOfSpeech}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-stone-300">
              {TEXT.difficulty}: {sessionConfigLabels.difficulty}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-stone-300">
              {TEXT.quizType}: {sessionConfigLabels.quizMode}
            </span>
          </div>
        </div>
        <div className="mt-2 border-t border-white/10 pt-2">
          <h3 className="text-[13px] font-semibold">{TEXT.reviewPreview}</h3>
          <div className="mt-1.5 space-y-1">
          {payload.reviewState.map((item: (typeof payload.reviewState)[number]) => (
            <div key={item.wordId} className="rounded-[0.85rem] border border-white/10 bg-stone-950/30 px-2 py-1">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-[13px] font-medium">{item.wordId}</p>
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-stone-300">
                  {TEXT.priority}: {item.priorityScore}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap gap-1">
                <span className="rounded-full border border-sky-200/20 bg-sky-300/12 px-2 py-0.5 text-[11px] text-sky-100">
                  {TEXT.stage}: {getStageLabel(item.reviewStage)}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-stone-300">
                  {TEXT.last}: {getLastResultLabel(item.lastResult)}
                </span>
              </div>
            </div>
          ))}
          </div>
        </div>
        <div className="mt-1.5 grid gap-1">
          <button
            className="min-h-8 w-full rounded-2xl border border-sky-200/20 bg-sky-300/12 px-2.5 py-1 text-[13px] font-semibold text-sky-50 transition duration-200 hover:bg-sky-300/16"
            type="button"
            onClick={() => navigate("/stats")}
          >
            {TEXT.statsPage}
          </button>
          <button
            className="min-h-8 w-full rounded-2xl border border-white/10 bg-white/8 px-2.5 py-1 text-[13px] font-semibold text-stone-100 transition duration-200 hover:bg-white/10"
            type="button"
            onClick={() => navigate("/home")}
          >
            {TEXT.backHome}
          </button>
        </div>
      </div>
    </section>
  );
}

type SummaryCardProps = {
  label: string;
  value: string;
  compact?: boolean;
};

function SummaryCard({ label, value, compact = false }: SummaryCardProps) {
  return (
    <div className={`rounded-2xl bg-white/8 text-center ${compact ? "p-1.5" : "p-2.5"}`}>
      <p className="text-[11px] text-stone-400">{label}</p>
      <p className={`mt-0.5 font-bold ${compact ? "text-[14px] sm:text-[15px]" : "text-[17px] sm:text-lg"}`}>{value}</p>
    </div>
  );
}
