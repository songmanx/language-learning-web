import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { appLogger } from "../services/logger";
import { readReviewSnapshot } from "../services/sessionRecovery";
import { useAuthStore } from "../stores/authStore";
import { useLanguageStore } from "../stores/languageStore";

const TEXT = {
  reviewCenterEnglish: "Review Center",
  reviewCenterTitle: "\uBCF5\uC2B5\uC13C\uD130",
  reviewCenterDescription:
    "\uCD5C\uADFC \uC138\uC158\uC758 Review_State\uB97C \uAE30\uC900\uC73C\uB85C \uC6B0\uC120\uC21C\uC704\uAC00 \uB192\uC740 \uBB38\uC81C\uBD80\uD130 \uD655\uC778\uD569\uB2C8\uB2E4.",
  selectedLanguage: "\uC120\uD0DD \uC5B8\uC5B4",
  priorityReviewList: "\uC6B0\uC120 \uBCF5\uC2B5 \uBAA9\uB85D",
  noReviewData:
    "\uCD5C\uADFC \uC138\uC158\uC758 \uBCF5\uC2B5 \uB370\uC774\uD130\uAC00 \uC544\uC9C1 \uC5C6\uC2B5\uB2C8\uB2E4. \uBA3C\uC800 \uD50C\uB808\uC774\uB97C \uC9C4\uD589\uD55C \uB4A4 \uB2E4\uC2DC \uD655\uC778\uD574 \uC8FC\uC138\uC694.",
  practiceStart: "\uC5F0\uC2B5 \uBAA8\uB4DC \uC2DC\uC791",
  playNow: "\uBC14\uB85C \uD50C\uB808\uC774\uD558\uAE30",
  backHome: "\uD648\uC73C\uB85C \uB3CC\uC544\uAC00\uAE30",
  movePracticeLog: "\uBCF5\uC2B5\uC13C\uD130\uC5D0\uC11C \uC5F0\uC2B5 \uBAA8\uB4DC\uB85C \uC774\uB3D9",
  movePlayLog: "\uBCF5\uC2B5\uC13C\uD130\uC5D0\uC11C \uD50C\uB808\uC774\uB85C \uC774\uB3D9",
  learningStage: "\uD559\uC2B5 \uC911",
  reviewStage: "\uBCF5\uC2B5 \uB300\uAE30",
  priorityLabel: "\uC6B0\uC120\uC21C\uC704",
  lastResultLabel: "\uC9C1\uC804 \uACB0\uACFC",
  correctResult: "\uC815\uB2F5",
  wrongResult: "\uC624\uB2F5",
  skippedResult: "\uAC74\uB108\uB700",
} as const;

function getStageLabel(stage: string) {
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

  if (lastResult === "skipped") {
    return TEXT.skippedResult;
  }

  return lastResult;
}

export function ReviewPage() {
  const navigate = useNavigate();
  const playerId = useAuthStore((state) => state.playerId);
  const selectedLanguage = useLanguageStore((state) => state.selectedLanguage);

  const snapshot = useMemo(() => {
    if (!playerId || !selectedLanguage) {
      return null;
    }

    return readReviewSnapshot(playerId, selectedLanguage);
  }, [playerId, selectedLanguage]);

  const sortedReviewItems = useMemo(() => {
    if (!snapshot) {
      return [];
    }

    return [...snapshot.reviewState].sort((left, right) => {
      if (right.priorityScore !== left.priorityScore) {
        return right.priorityScore - left.priorityScore;
      }

      return left.wordId.localeCompare(right.wordId);
    });
  }, [snapshot]);

  const learningCount = sortedReviewItems.filter((item) => item.reviewStage === "learning").length;
  const reviewCount = sortedReviewItems.filter((item) => item.reviewStage === "review").length;

  return (
    <section className="space-y-4 pb-4">
      <div className="rounded-[1.75rem] border border-white/10 bg-stone-950/40 p-5 sm:rounded-[2rem] sm:p-6">
        <p className="text-sm text-amber-200">{TEXT.reviewCenterEnglish}</p>
        <h2 className="mt-2 text-2xl font-bold sm:text-3xl">{TEXT.reviewCenterTitle}</h2>
        <p className="mt-2 text-sm leading-6 text-stone-300">{TEXT.reviewCenterDescription}</p>
        <p className="mt-4 text-sm leading-6 text-stone-400">
          {TEXT.selectedLanguage}: {selectedLanguage ?? "-"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/8 p-4 text-center">
          <p className="text-xs text-stone-400">{TEXT.learningStage}</p>
          <p className="mt-2 text-2xl font-bold">{learningCount}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/8 p-4 text-center">
          <p className="text-xs text-stone-400">{TEXT.reviewStage}</p>
          <p className="mt-2 text-2xl font-bold">{reviewCount}</p>
        </div>
      </div>

      {snapshot ? (
        <div className="rounded-[1.75rem] border border-white/10 bg-white/8 p-5 sm:rounded-[2rem] sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold">{TEXT.priorityReviewList}</h3>
            <span className="text-xs text-stone-400">
              {new Date(snapshot.savedAt).toLocaleString("ko-KR")}
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {sortedReviewItems.map((item) => (
              <div
                key={item.wordId}
                className="rounded-2xl border border-white/10 bg-stone-950/30 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{item.wordId}</p>
                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-stone-200">
                    {getStageLabel(item.reviewStage)}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-stone-300">
                  {TEXT.priorityLabel}: {item.priorityScore} / {TEXT.lastResultLabel}: {getLastResultLabel(item.lastResult)}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-[1.75rem] border border-dashed border-white/15 bg-white/6 p-5 text-sm leading-6 text-stone-300">
          {TEXT.noReviewData}
        </div>
      )}

      <div className="grid gap-3">
        <button
          className="min-h-14 rounded-2xl bg-sky-300 px-4 py-4 text-base font-semibold text-stone-950"
          type="button"
          onClick={() => {
            appLogger.info("review", TEXT.movePracticeLog, { selectedLanguage });
            navigate("/practice");
          }}
        >
          {TEXT.practiceStart}
        </button>
        <button
          className="min-h-14 rounded-2xl bg-emerald-400 px-4 py-4 text-base font-semibold text-stone-950"
          type="button"
          onClick={() => {
            appLogger.info("review", TEXT.movePlayLog, { selectedLanguage });
            navigate("/play");
          }}
        >
          {TEXT.playNow}
        </button>
        <button
          className="min-h-14 rounded-2xl border border-white/15 bg-white/8 px-4 py-4 text-base font-semibold"
          type="button"
          onClick={() => navigate("/home")}
        >
          {TEXT.backHome}
        </button>
      </div>
    </section>
  );
}
