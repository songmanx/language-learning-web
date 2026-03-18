import { useLocation, useNavigate } from "react-router-dom";
import type { SessionResultState } from "../features/game/resultState";
import { useLanguageStore } from "../stores/languageStore";

const TEXT = {
  noResultData: "\uACB0\uACFC \uB370\uC774\uD130\uAC00 \uC5C6\uC5B4 \uD648\uC73C\uB85C \uB3CC\uC544\uAC11\uB2C8\uB2E4.",
  homeShort: "\uD648\uC73C\uB85C",
  saving: "\uC138\uC158 \uC800\uC7A5 \uC911",
  saved: "\uC138\uC158 \uC800\uC7A5 \uC644\uB8CC",
  pending: "\uC138\uC158 \uC784\uC2DC \uC800\uC7A5 \uC644\uB8CC",
  resultSummary: "\uACB0\uACFC \uC694\uC57D",
  score: "\uC810\uC218",
  correctAnswers: "\uC815\uB2F5 \uC218",
  accuracy: "\uC815\uB2F5\uB960",
  heartsLeft: "\uB0A8\uC740 \uD558\uD2B8",
  selectedLanguage: "\uC120\uD0DD \uC5B8\uC5B4",
  reviewPreview: "\uBCF5\uC2B5 \uC0C1\uD0DC \uBBF8\uB9AC\uBCF4\uAE30",
  stage: "\uBCF5\uC2B5 \uB2E8\uACC4",
  priority: "\uC6B0\uC120\uC21C\uC704",
  last: "\uC9C1\uC804 \uACB0\uACFC",
  nextActionTitle: "\uB2E4\uC74C \uD559\uC2B5 \uC81C\uC548",
  savingGuide:
    "\uACB0\uACFC\uB294 \uBA3C\uC800 \uBCF4\uC5EC \uC8FC\uACE0 \uC800\uC7A5\uC740 \uB4A4\uC5D0\uC11C \uACC4\uC18D \uC9C4\uD589 \uC911\uC785\uB2C8\uB2E4. \uC7A0\uC2DC \uD6C4 \uC800\uC7A5 \uC0C1\uD0DC\uAC00 \uC5C5\uB370\uC774\uD2B8\uB429\uB2C8\uB2E4.",
  savedGuide:
    "\uC138\uC158\uC774 \uC815\uC0C1\uC801\uC73C\uB85C \uC800\uC7A5\uB410\uC2B5\uB2C8\uB2E4. \uBCF5\uC2B5\uC13C\uD130\uC5D0\uC11C \uC6B0\uC120 \uBCF5\uC2B5 \uBAA9\uB85D\uC744 \uD655\uC778\uD558\uAC70\uB098 \uBC14\uB85C \uD55C \uD310 \uB354 \uC9C4\uD589\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
  pendingGuide:
    "\uC800\uC7A5 \uC7AC\uC2DC\uB3C4\uAC00 \uD544\uC694\uD55C \uC0C1\uD0DC\uC785\uB2C8\uB2E4. \uD648\uC5D0\uC11C \uC784\uC2DC \uC800\uC7A5 \uC138\uC158\uC744 \uB2E4\uC2DC \uC800\uC7A5\uD558\uACE0 \uBCF5\uC2B5 \uD750\uB984\uC744 \uC774\uC5B4\uAC00\uC138\uC694.",
  performanceTitle: "\uC138\uC158 \uD3C9\uAC00",
  recommendationTitle: "\uCD94\uCC9C \uB2E4\uC74C \uD589\uB3D9",
  playAgain: "\uB2E4\uC2DC \uD50C\uB808\uC774",
  practiceStart: "\uC5F0\uC2B5 \uBAA8\uB4DC \uC2DC\uC791",
  moveReview: "\uBCF5\uC2B5\uC13C\uD130\uB85C \uC774\uB3D9",
  statsPage: "\uD1B5\uACC4 \uBCF4\uAE30",
  backHome: "\uD648\uC73C\uB85C \uB3CC\uC544\uAC00\uAE30",
  gradeExcellent: "\uB9E4\uC6B0 \uC88B\uC544\uC694",
  gradeGood: "\uC88B\uC740 \uD750\uB984\uC785\uB2C8\uB2E4",
  gradeKeepGoing: "\uD55C \uD310 \uB354 \uC62C\uB824\uBCF4\uC138\uC694",
  gradeRetry: "\uBCF5\uC2B5\uC73C\uB85C \uBC14\uB85C \uC774\uC5B4\uAC00\uBA74 \uC88B\uC2B5\uB2C8\uB2E4",
  recommendationReview: "\uBCF5\uC2B5\uC13C\uD130\uC5D0\uC11C \uC6B0\uC120 \uBCF5\uC2B5 \uBAA9\uB85D\uC744 \uD655\uC778\uD574 \uBCF4\uC138\uC694.",
  recommendationPractice: "\uC5F0\uC2B5 \uBAA8\uB4DC\uB85C \uBD80\uB2F4 \uC5C6\uC774 \uD55C \uBC88 \uB354 \uAC10\uAC01\uC744 \uC62C\uB824 \uBCF4\uC138\uC694.",
  recommendationPlay: "\uAE30\uBCF8 \uD50C\uB808\uC774\uB97C \uD55C \uD310 \uB354 \uC9C4\uD589\uD574 \uC810\uC218 \uD750\uB984\uC744 \uC774\uC5B4\uAC00\uC138\uC694.",
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
  const guideText =
    saveStatus === "saving"
      ? TEXT.savingGuide
      : saveStatus === "saved"
        ? TEXT.savedGuide
        : TEXT.pendingGuide;
  const accuracy = getAccuracy(payload.correctAnswers, payload.totalQuestions);
  const performance = getPerformanceSummary(accuracy, payload.heartsLeft);
  const selectedLanguageLabel =
    availableLanguages.find((language) => language.languageCode === payload.languageCode)?.label ??
    payload.languageCode;

  return (
    <section className="space-y-4 pb-4">
      <div className="rounded-[1.75rem] border border-white/10 bg-stone-950/40 p-5 sm:rounded-[2rem] sm:p-6">
        <p className="text-sm text-amber-200">
          {saveStatus === "saving" ? TEXT.saving : saveStatus === "saved" ? TEXT.saved : TEXT.pending}
        </p>
        <h2 className="mt-2 text-2xl font-bold sm:text-3xl">{TEXT.resultSummary}</h2>
        <p className="mt-2 text-sm leading-6 text-stone-400">
          {TEXT.selectedLanguage}: {selectedLanguageLabel}
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <SummaryCard label={TEXT.score} value={String(payload.score)} />
          <SummaryCard label={TEXT.correctAnswers} value={`${payload.correctAnswers} / ${payload.totalQuestions}`} />
          <SummaryCard label={TEXT.accuracy} value={`${accuracy}%`} />
          <SummaryCard label={TEXT.heartsLeft} value={String(payload.heartsLeft)} />
        </div>
      </div>

      {message ? (
        <div className="rounded-[1.75rem] border border-amber-300/30 bg-amber-300/10 p-4 text-sm leading-6 text-amber-50 sm:p-5">
          {message}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-[1.75rem] border border-white/10 bg-white/8 p-5 sm:rounded-[2rem] sm:p-6">
          <p className="text-sm text-sky-200">{TEXT.nextActionTitle}</p>
          <p className="mt-3 text-sm leading-6 text-stone-300">{guideText}</p>
        </div>
        <div className="rounded-[1.75rem] border border-white/10 bg-white/8 p-5 sm:rounded-[2rem] sm:p-6">
          <p className="text-sm text-emerald-200">{TEXT.performanceTitle}</p>
          <p className="mt-3 text-xl font-semibold text-white">{performance.grade}</p>
          <p className="mt-3 text-sm leading-6 text-stone-300">
            {TEXT.recommendationTitle}: {performance.recommendation}
          </p>
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-white/10 bg-white/8 p-5 sm:rounded-[2rem] sm:p-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            className="min-h-14 rounded-2xl bg-emerald-400 px-4 py-4 text-base font-semibold text-stone-950"
            type="button"
            onClick={() => navigate("/play")}
          >
            {TEXT.playAgain}
          </button>
          <button
            className="min-h-14 rounded-2xl border border-sky-200/20 bg-sky-300/12 px-4 py-4 text-base font-semibold text-sky-50"
            type="button"
            onClick={() => navigate("/practice")}
          >
            {TEXT.practiceStart}
          </button>
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-white/10 bg-white/8 p-5 sm:rounded-[2rem] sm:p-6">
        <h3 className="text-lg font-semibold">{TEXT.reviewPreview}</h3>
        <div className="mt-4 space-y-3">
          {payload.reviewState.map((item: (typeof payload.reviewState)[number]) => (
            <div
              key={item.wordId}
              className="rounded-2xl border border-white/10 bg-stone-950/30 p-4"
            >
              <p className="font-medium">{item.wordId}</p>
              <p className="mt-1 text-sm leading-6 text-stone-300">
                {TEXT.stage}: {getStageLabel(item.reviewStage)} / {TEXT.priority}: {item.priorityScore} / {TEXT.last}: {getLastResultLabel(item.lastResult)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        <button
          className="min-h-14 w-full rounded-2xl bg-amber-400 px-4 py-4 text-base font-semibold text-stone-950"
          type="button"
          onClick={() => navigate("/review")}
        >
          {TEXT.moveReview}
        </button>
        <button
          className="min-h-14 w-full rounded-2xl border border-white/15 bg-white/8 px-4 py-4 text-base font-semibold"
          type="button"
          onClick={() => navigate("/stats")}
        >
          {TEXT.statsPage}
        </button>
        <button
          className="min-h-14 w-full rounded-2xl bg-white/8 px-4 py-4 text-base font-semibold"
          type="button"
          onClick={() => navigate("/home")}
        >
          {TEXT.backHome}
        </button>
      </div>
    </section>
  );
}

type SummaryCardProps = {
  label: string;
  value: string;
};

function SummaryCard({ label, value }: SummaryCardProps) {
  return (
    <div className="rounded-2xl bg-white/8 p-4 text-center">
      <p className="text-xs text-stone-400">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}
