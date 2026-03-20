import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DEFAULT_SESSION_CONFIG, getSessionConfigLabels } from "../features/game/sessionConfig";
import { appLogger } from "../services/logger";
import { readReviewSnapshot, readSessionConfigSnapshot } from "../services/sessionRecovery";
import { useAuthStore } from "../stores/authStore";
import { useLanguageStore } from "../stores/languageStore";

const TEXT = {
  reviewCenterEnglish: "Review Center",
  reviewCenterTitle: "\uBCF5\uC2B5\uC13C\uD130",
  reviewCenterDescription: "\uCD5C\uC2E0 \uBCF5\uC2B5 \uC6B0\uC120\uC21C\uC704",
  selectedLanguage: "\uC120\uD0DD \uC5B8\uC5B4",
  snapshotStatus: "\uBCF5\uC2B5 \uC2A4\uB0C5\uC0F7",
  nextActionTitle: "\uB2E4\uC74C \uD559\uC2B5 \uD750\uB984",
  reviewSummary: "\uBCF5\uC2B5 \uC694\uC57D",
  quickActionsTitle: "\uBC14\uB85C \uC774\uB3D9",
  recommendedRoute: "\uCD94\uCC9C \uACBD\uB85C",
  totalItems: "\uC804\uCCB4 \uD56D\uBAA9",
  topPriority: "\uCD5C\uC0C1\uC704 \uC6B0\uC120\uC21C\uC704",
  updatedAt: "\uCD5C\uC2E0 \uBC18\uC601",
  lastLoadout: "\uC5F0\uACB0 \uC138\uC158 \uAD6C\uC131",
  partOfSpeech: "\uD488\uC0AC",
  difficulty: "\uB09C\uC774\uB3C4",
  quizMode: "\uCD9C\uC81C",
  reviewReady: "\uBCF5\uC2B5 \uC900\uBE44 \uC644\uB8CC",
  reviewEmpty: "\uBCF5\uC2B5 \uB370\uC774\uD130 \uB300\uAE30 \uC911",
  reviewReadyGuide: "\uBCF5\uC2B5 \uC900\uBE44 \uC644\uB8CC",
  reviewEmptyGuide: "\uD50C\uB808\uC774 \uD6C4 \uB2E4\uC2DC \uD655\uC778",
  priorityReviewList: "\uC6B0\uC120 \uBCF5\uC2B5",
  noReviewData:
    "\uCD5C\uADFC \uC138\uC158\uC758 \uBCF5\uC2B5 \uB370\uC774\uD130\uAC00 \uC544\uC9C1 \uC5C6\uC2B5\uB2C8\uB2E4. \uBA3C\uC800 \uD50C\uB808\uC774\uB97C \uC9C4\uD589\uD55C \uB4A4 \uB2E4\uC2DC \uD655\uC778\uD574 \uC8FC\uC138\uC694.",
  practiceStart: "\uC5F0\uC2B5",
  playNow: "\uD50C\uB808\uC774",
  backHome: "\uD648",
  practiceActionDetail: "\uC5F0\uC2B5",
  playActionDetail: "\uC7AC\uB3C4\uC804",
  homeActionDetail: "\uD648",
  recommendedBadge: "\uCD94\uCC9C",
  movePracticeLog: "\uBCF5\uC2B5\uC13C\uD130\uC5D0\uC11C \uC5F0\uC2B5 \uBAA8\uB4DC\uB85C \uC774\uB3D9",
  movePlayLog: "\uBCF5\uC2B5\uC13C\uD130\uC5D0\uC11C \uD50C\uB808\uC774\uB85C \uC774\uB3D9",
  learningStage: "\uD559\uC2B5 \uC911",
  reviewStage: "\uBCF5\uC2B5 \uB300\uAE30",
  priorityLabel: "\uC6B0\uC120",
  lastResultLabel: "\uACB0\uACFC",
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
  const sessionConfigSnapshot = useMemo(() => {
    if (!playerId || !selectedLanguage) {
      return null;
    }

    return readSessionConfigSnapshot(playerId, selectedLanguage);
  }, [playerId, selectedLanguage]);
  const sessionConfigLabels = getSessionConfigLabels(
    sessionConfigSnapshot?.sessionConfig ?? DEFAULT_SESSION_CONFIG,
  );

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
  const topPriorityScore = sortedReviewItems[0]?.priorityScore ?? 0;
  const formattedSavedAt = snapshot ? new Date(snapshot.savedAt).toLocaleString("ko-KR") : "-";
  const actionCards = [
    {
      title: TEXT.practiceStart,
      description: TEXT.practiceActionDetail,
      recommended: Boolean(snapshot),
      toneClassName: snapshot
        ? "border-sky-200/40 bg-gradient-to-br from-sky-300/20 to-cyan-200/8 text-sky-50 shadow-[0_16px_40px_rgba(56,189,248,0.12)]"
        : "border-white/10 bg-white/8 text-stone-100 hover:border-white/15 hover:bg-white/10",
      onClick: () => {
        appLogger.info("review", TEXT.movePracticeLog, { selectedLanguage });
        navigate("/practice", {
          state: { sessionConfig: sessionConfigSnapshot?.sessionConfig ?? DEFAULT_SESSION_CONFIG },
        });
      },
    },
    {
      title: TEXT.playNow,
      description: TEXT.playActionDetail,
      recommended: false,
      toneClassName: "border-emerald-300/20 bg-emerald-300/10 text-emerald-50 shadow-[0_16px_40px_rgba(16,185,129,0.08)] hover:bg-emerald-300/14",
      onClick: () => {
        appLogger.info("review", TEXT.movePlayLog, { selectedLanguage });
        navigate("/play", {
          state: { sessionConfig: sessionConfigSnapshot?.sessionConfig ?? DEFAULT_SESSION_CONFIG },
        });
      },
    },
    {
      title: TEXT.backHome,
      description: TEXT.homeActionDetail,
      recommended: false,
      toneClassName: "border-white/10 bg-white/8 text-stone-100 hover:border-white/15 hover:bg-white/10",
      onClick: () => navigate("/home"),
    },
  ];
  const recommendedActionTitle = actionCards.find((card) => card.recommended)?.title ?? TEXT.playNow;
  return (
    <section className="space-y-4 pb-4">
      <div className="rounded-[1.75rem] border border-white/10 bg-stone-950/40 p-5 sm:rounded-[2rem] sm:p-6">
        <p className="text-sm text-amber-200">{TEXT.reviewCenterEnglish}</p>
        <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] text-white sm:text-3xl">{TEXT.reviewCenterTitle}</h2>
        <p className="mt-4 text-sm leading-6 text-stone-400">
          {TEXT.selectedLanguage}: {selectedLanguage ?? "-"}
        </p>
        <div className="flex flex-col gap-3">
          <div className="min-w-0 flex-1">
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-amber-100">
                {TEXT.snapshotStatus}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-stone-200">
                {snapshot ? TEXT.reviewReady : TEXT.reviewEmpty}
              </span>
            </div>
            <div className="mt-2.5 grid grid-cols-2 gap-1.5">
              <SummaryCard label={TEXT.totalItems} value={String(sortedReviewItems.length)} />
              <SummaryCard label={TEXT.topPriority} value={String(topPriorityScore)} />
              <SummaryCard label={TEXT.learningStage} value={String(learningCount)} compact />
              <SummaryCard label={TEXT.reviewStage} value={String(reviewCount)} compact />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1">
              <span className="rounded-full border border-white/10 bg-white/10 px-2 py-1 text-[10px] text-stone-200">
                {TEXT.recommendedRoute}: {recommendedActionTitle}
              </span>
            </div>
            <div className="mt-3 grid gap-1.5">
                {actionCards.map((card) => (
                  <button
                    key={card.title}
                    aria-label={card.title}
                    className={`min-h-8 rounded-2xl border px-2.5 py-1.5 text-left transition duration-200 ${card.toneClassName}`}
                    type="button"
                    onClick={card.onClick}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[12px] font-semibold">{card.title}</span>
                      {card.recommended ? (
                        <span className="rounded-full border border-white/10 bg-white/10 px-2 py-1 text-[11px]">
                          {TEXT.recommendedBadge}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-0.5 text-[10px] text-stone-300/90">{card.description}</p>
                  </button>
                ))}
            </div>
          </div>

          <div className="w-full rounded-[0.95rem] border border-white/10 bg-stone-950/30 p-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-200">{TEXT.nextActionTitle}</p>
            <p className="mt-1 text-[11px] text-stone-300">
              {snapshot ? TEXT.practiceActionDetail : TEXT.playActionDetail}
            </p>
            <div className="mt-2 border-t border-white/10 pt-2">
              <p className="text-[11px] text-stone-400">{TEXT.updatedAt}</p>
              <p className="mt-0.5 text-[13px] text-stone-100">{formattedSavedAt}</p>
            </div>
            <div className="mt-2 border-t border-white/10 pt-2">
              <p className="text-[11px] text-stone-400">{TEXT.lastLoadout}</p>
              <div className="mt-1 flex flex-wrap gap-1">
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-stone-300">
                  {TEXT.partOfSpeech}: {sessionConfigLabels.partOfSpeech}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-stone-300">
                  {TEXT.difficulty}: {sessionConfigLabels.difficulty}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-stone-300">
                  {TEXT.quizMode}: {sessionConfigLabels.quizMode}
                </span>
              </div>
            </div>

            {snapshot ? (
              <div className="mt-2 border-t border-white/10 pt-2">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-[13px] font-semibold text-white">{TEXT.priorityReviewList}</h3>
                  <span className="text-[11px] text-stone-400">
                    {new Date(snapshot.savedAt).toLocaleString("ko-KR")}
                  </span>
                </div>
                <div className="mt-1.5 space-y-1">
                  {sortedReviewItems.map((item) => (
                    <div key={item.wordId} className="rounded-[0.85rem] border border-white/10 bg-white/5 px-2 py-1">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-[13px] font-medium">{item.wordId}</p>
                        <span className="rounded-full border border-white/10 bg-white/10 px-2 py-0.5 text-[11px] text-stone-200">
                          {getStageLabel(item.reviewStage)}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-2 py-0.5 text-[11px] text-amber-100">
                          {TEXT.priorityLabel}: {item.priorityScore}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-stone-300">
                          {TEXT.lastResultLabel}: {getLastResultLabel(item.lastResult)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {snapshot ? null : (
        <div className="rounded-[1.75rem] border border-dashed border-white/15 bg-white/6 p-5 text-sm leading-6 text-stone-300">
          {TEXT.noReviewData}
        </div>
      )}

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
    <div className={`rounded-2xl border border-white/10 bg-white/8 text-center ${compact ? "p-1.5" : "p-2.5"}`}>
      <p className="text-[11px] text-stone-400">{label}</p>
      <p className={`mt-0.5 font-bold ${compact ? "text-[14px] sm:text-[15px]" : "text-[17px] sm:text-lg"}`}>{value}</p>
    </div>
  );
}
