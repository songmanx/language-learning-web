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

      {snapshot ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label={TEXT.totalSessions} value={String(snapshot.sessionCount)} />
            <StatCard label={TEXT.practiceSessions} value={String(snapshot.practiceSessionCount)} />
            <StatCard label={TEXT.totalScore} value={String(snapshot.totalScore)} />
            <StatCard label={TEXT.bestScore} value={String(snapshot.bestScore)} />
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-white/8 p-5 sm:rounded-[2rem] sm:p-6">
            <h3 className="text-lg font-semibold">{TEXT.accuracy}</h3>
            <p className="mt-3 text-4xl font-bold text-emerald-200">{snapshot.averageAccuracy}%</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <DetailRow label={TEXT.totalQuestions} value={String(snapshot.totalQuestions)} />
              <DetailRow label={TEXT.correctAnswers} value={String(snapshot.correctAnswers)} />
              <DetailRow label={TEXT.lastPlayedAt} value={formatDateTime(snapshot.lastPlayedAt)} />
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-[1.75rem] border border-dashed border-white/15 bg-white/6 p-5 text-sm leading-6 text-stone-300">
          {TEXT.noStats}
        </div>
      )}

      <div className="grid gap-3">
        <button
          className="min-h-14 rounded-2xl bg-amber-400 px-4 py-4 text-base font-semibold text-stone-950"
          type="button"
          onClick={() => navigate("/review")}
        >
          {TEXT.reviewCenter}
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

type StatCardProps = {
  label: string;
  value: string;
};

function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/8 p-4 text-center">
      <p className="text-xs text-stone-400">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
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
