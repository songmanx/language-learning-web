import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { readDailyStatsSnapshot } from "../services/sessionRecovery";
import { useAuthStore } from "../stores/authStore";
import { useLanguageStore } from "../stores/languageStore";

const TEXT = {
  statsEnglish: "Daily Stats",
  statsTitle: "\uAE30\uBCF8 \uD1B5\uACC4",
  statsDescription:
    "\uCD5C\uADFC \uC138\uC158 \uB204\uC801 \uAE30\uC900\uC73C\uB85C \uC810\uC218, \uC815\uB2F5\uB960, \uC5F0\uC2B5 \uD750\uB984\uC744 \uAC04\uB2E8\uD788 \uD655\uC778\uD569\uB2C8\uB2E4.",
  noStats:
    "\uC544\uC9C1 \uD45C\uC2DC\uD560 \uD1B5\uACC4\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4. \uBA3C\uC800 \uD50C\uB808\uC774 \uB610\uB294 \uC5F0\uC2B5 \uC138\uC158\uC744 \uC644\uB8CC\uD574 \uC8FC\uC138\uC694.",
  selectedLanguage: "\uC120\uD0DD \uC5B8\uC5B4",
  snapshotStatus: "\uD1B5\uACC4 \uC2A4\uB0C5\uC0F7",
  statsReady: "\uB204\uC801 \uC9D1\uACC4 \uC644\uB8CC",
  statsEmpty: "\uD1B5\uACC4 \uB370\uC774\uD130 \uB300\uAE30 \uC911",
  performanceSummary: "\uC131\uACFC \uC694\uC57D",
  nextActionTitle: "\uB2E4\uC74C \uD559\uC2B5 \uC81C\uC548",
  quickActionsTitle: "\uBC14\uB85C \uC774\uB3D9",
  recommendedRoute: "\uCD94\uCC9C \uACBD\uB85C",
  recentFlow: "\uCD5C\uADFC \uD750\uB984",
  lastSessionGuide:
    "\uD1B5\uACC4\uB97C \uAE30\uC900\uC73C\uB85C \uBCF5\uC2B5 \uC13C\uD130\uB85C \uC774\uC5B4\uAC00\uAC70\uB098 \uD55C \uD310 \uB354 \uC9C4\uD589\uD560 \uC9C0 \uBC14\uB85C \uD310\uB2E8\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
  noStatsGuide:
    "\uC544\uC9C1 \uB204\uC801 \uD1B5\uACC4\uAC00 \uC5C6\uC5B4 \uBA3C\uC800 \uD50C\uB808\uC774 \uB610\uB294 \uC5F0\uC2B5 \uC138\uC158\uC744 \uC9C4\uD589\uD558\uBA74 \uD750\uB984\uC774 \uC313\uC785\uB2C8\uB2E4.",
  reviewActionDetail:
    "\uC6B0\uC120 \uBCF5\uC2B5 \uBAA9\uB85D\uC744 \uD655\uC778\uD558\uACE0 \uD5F7\uAC08\uB9B0 \uD56D\uBAA9\uC744 \uC815\uB9AC\uD558\uAE30 \uC88B\uC2B5\uB2C8\uB2E4.",
  playAction: "\uB2E4\uC2DC \uD50C\uB808\uC774",
  playActionDetail:
    "\uC9C0\uAE08 \uD750\uB984\uC744 \uADF8\uB300\uB85C \uC774\uC5B4\uAC00 \uC810\uC218\uC640 \uC815\uB2F5\uB960\uC744 \uB354 \uC62C\uB824\uBCFC \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
  homeActionDetail:
    "\uD648\uC73C\uB85C \uB3CC\uC544\uAC00 \uB2E4\uB978 \uBAA8\uB4DC\uB97C \uACE0\uB974\uAC70\uB098 \uC5B8\uC5B4\uB97C \uBC14\uAFC0 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
  recommendedBadge: "\uCD94\uCC9C",
  accuracyExcellent: "\uC815\uB2F5\uB960 \uD750\uB984\uC774 \uC88B\uC2B5\uB2C8\uB2E4.",
  accuracyPractice: "\uBCF5\uC2B5\uACFC \uC5F0\uC2B5\uC744 \uD568\uAED8 \uAC00\uC838\uAC00\uBA74 \uC88B\uC2B5\uB2C8\uB2E4.",
  accuracyRetry: "\uBCF5\uC2B5 \uC13C\uD130\uB85C \uD750\uB984\uC744 \uB2E4\uC2DC \uC7A1\uC544\uBCF4\uC138\uC694.",
  totalSessions: "\uB204\uC801 \uC138\uC158",
  practiceSessions: "\uC5F0\uC2B5 \uC138\uC158",
  totalScore: "\uB204\uC801 \uC810\uC218",
  bestScore: "\uCD5C\uACE0 \uC810\uC218",
  accuracy: "\uD3C9\uADE0 \uC815\uB2F5\uB960",
  totalQuestions: "\uB204\uC801 \uBB38\uC81C \uC218",
  correctAnswers: "\uB204\uC801 \uC815\uB2F5 \uC218",
  lastPlayedAt: "\uB9C8\uC9C0\uB9C9 \uD50C\uB808\uC774",
  reviewCenter: "\uBCF5\uC2B5\uC13C\uD130\uB85C \uC774\uB3D9",
  backHome: "\uD648\uC73C\uB85C \uB3CC\uC544\uAC00\uAE30",
} as const;

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("ko-KR");
}

export function StatsPage() {
  const navigate = useNavigate();
  const playerId = useAuthStore((state) => state.playerId);
  const selectedLanguage = useLanguageStore((state) => state.selectedLanguage);
  const availableLanguages = useLanguageStore((state) => state.availableLanguages);

  const snapshot = useMemo(() => {
    if (!playerId || !selectedLanguage) {
      return null;
    }

    return readDailyStatsSnapshot(playerId, selectedLanguage);
  }, [playerId, selectedLanguage]);

  const selectedLanguageLabel = useMemo(() => {
    if (!selectedLanguage) {
      return "-";
    }

    return (
      availableLanguages.find((language) => language.languageCode === selectedLanguage)?.label ??
      selectedLanguage
    );
  }, [availableLanguages, selectedLanguage]);
  const flowMessage = !snapshot
    ? TEXT.noStatsGuide
    : snapshot.averageAccuracy >= 85
      ? TEXT.accuracyExcellent
      : snapshot.averageAccuracy >= 70
        ? TEXT.accuracyPractice
        : TEXT.accuracyRetry;
  const recommendedAction = snapshot && snapshot.averageAccuracy >= 85 ? TEXT.playAction : TEXT.reviewCenter;
  const actionCards = [
    {
      title: TEXT.reviewCenter,
      description: TEXT.reviewActionDetail,
      recommended: recommendedAction === TEXT.reviewCenter,
      toneClassName:
        recommendedAction === TEXT.reviewCenter
          ? "border-amber-300/30 bg-amber-300/10"
          : "border-white/10 bg-white/8",
      onClick: () => navigate("/review"),
    },
    {
      title: TEXT.playAction,
      description: TEXT.playActionDetail,
      recommended: recommendedAction === TEXT.playAction,
      toneClassName:
        recommendedAction === TEXT.playAction
          ? "border-emerald-300/30 bg-emerald-300/10"
          : "border-white/10 bg-white/8",
      onClick: () => navigate("/play"),
    },
    {
      title: TEXT.backHome,
      description: TEXT.homeActionDetail,
      recommended: false,
      toneClassName: "border-white/10 bg-white/8",
      onClick: () => navigate("/home"),
    },
  ];
  const recommendedActionDetail =
    actionCards.find((card) => card.recommended)?.description ?? TEXT.reviewActionDetail;

  return (
    <section className="space-y-4 pb-4">
      <div className="rounded-[1.75rem] border border-white/10 bg-stone-950/40 p-5 sm:rounded-[2rem] sm:p-6">
        <p className="text-sm text-amber-200">{TEXT.statsEnglish}</p>
        <h2 className="mt-2 text-2xl font-bold sm:text-3xl">{TEXT.statsTitle}</h2>
        <p className="mt-2 text-sm leading-6 text-stone-300">{TEXT.statsDescription}</p>
        <p className="mt-4 text-sm leading-6 text-stone-400">
          {TEXT.selectedLanguage}: {selectedLanguageLabel}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-[1.75rem] border border-white/10 bg-white/8 p-5 sm:rounded-[2rem] sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-amber-100">
              {TEXT.snapshotStatus}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-stone-200">
              {snapshot ? TEXT.statsReady : TEXT.statsEmpty}
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-stone-300">
            {snapshot ? TEXT.lastSessionGuide : TEXT.noStatsGuide}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <StatCard label={TEXT.totalSessions} value={String(snapshot?.sessionCount ?? 0)} compact />
            <StatCard label={TEXT.practiceSessions} value={String(snapshot?.practiceSessionCount ?? 0)} compact />
            <StatCard label={TEXT.totalScore} value={String(snapshot?.totalScore ?? 0)} compact />
            <StatCard label={TEXT.bestScore} value={String(snapshot?.bestScore ?? 0)} compact />
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-white/10 bg-white/8 p-5 sm:rounded-[2rem] sm:p-6">
          <p className="text-sm text-emerald-200">{TEXT.nextActionTitle}</p>
          <p className="mt-3 text-xl font-semibold text-white">{flowMessage}</p>
          <div className="mt-4 rounded-2xl border border-white/10 bg-stone-950/30 p-4">
            <p className="text-xs text-stone-400">{TEXT.recentFlow}</p>
            <p className="mt-2 text-sm leading-6 text-stone-100">
              {snapshot ? formatDateTime(snapshot.lastPlayedAt) : TEXT.noStats}
            </p>
          </div>
        </div>
      </div>

      {snapshot ? (
        <div className="rounded-[1.75rem] border border-white/10 bg-white/8 p-5 sm:rounded-[2rem] sm:p-6">
          <h3 className="text-lg font-semibold">{TEXT.performanceSummary}</h3>
          <p className="mt-3 text-4xl font-bold text-emerald-200">{snapshot.averageAccuracy}%</p>
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

      <div className="rounded-[1.75rem] border border-white/10 bg-white/8 p-5 sm:rounded-[2rem] sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold">{TEXT.quickActionsTitle}</h3>
          <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-stone-200">
            {TEXT.recommendedRoute}: {recommendedAction}
          </span>
        </div>
        <p className="mt-3 text-sm leading-6 text-stone-300">{recommendedActionDetail}</p>
        <div className="grid gap-3 lg:grid-cols-3">
          {actionCards.map((card) => (
            <button
              key={card.title}
              aria-label={card.title}
              className={`min-h-14 rounded-2xl border px-4 py-4 text-left ${card.toneClassName}`}
              type="button"
              onClick={card.onClick}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-base font-semibold">{card.title}</span>
                {card.recommended ? (
                  <span className="rounded-full border border-white/10 bg-white/10 px-2 py-1 text-[11px]">
                    {TEXT.recommendedBadge}
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-sm leading-6 text-stone-300">{card.description}</p>
            </button>
          ))}
        </div>
      </div>
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
