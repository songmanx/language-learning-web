import type { PropsWithChildren } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguageStore } from "../stores/languageStore";

const TEXT = {
  title: "YANG 언어공부 연습장",
  defaultLanguage: "일본어",
} as const;

function getLanguageTheme(languageCode: string | null) {
  if (languageCode === "en") {
    return {
      eyebrow: "ENGLISH TRACK",
      shell:
        "bg-[linear-gradient(140deg,rgba(10,19,32,0.96),rgba(18,68,92,0.82)_48%,rgba(35,128,164,0.72)_100%)] hover:shadow-[0_28px_70px_rgba(34,211,238,0.22)]",
      accentLeft: "bg-cyan-300/24",
      accentRight: "bg-sky-200/18",
      titleGradient: "from-white via-cyan-100 to-sky-100",
      chip: "border-cyan-200/20 bg-cyan-100/10 text-cyan-50",
    };
  }

  return {
    eyebrow: "JAPANESE TRACK",
    shell:
      "bg-[linear-gradient(140deg,rgba(16,17,28,0.96),rgba(45,32,74,0.82)_48%,rgba(108,76,174,0.72)_100%)] hover:shadow-[0_28px_70px_rgba(91,65,168,0.28)]",
    accentLeft: "bg-fuchsia-300/22",
    accentRight: "bg-cyan-300/18",
    titleGradient: "from-white via-fuchsia-100 to-cyan-100",
    chip: "border-white/14 bg-white/10 text-fuchsia-50",
  };
}

export function AppShell({ children }: PropsWithChildren) {
  const navigate = useNavigate();
  const selectedLanguage = useLanguageStore((state) => state.selectedLanguage);
  const availableLanguages = useLanguageStore((state) => state.availableLanguages);
  const languageLabel =
    availableLanguages.find((language) => language.languageCode === selectedLanguage)?.label ??
    availableLanguages[0]?.label ??
    selectedLanguage ??
    TEXT.defaultLanguage;
  const languageTheme = getLanguageTheme(selectedLanguage);

  return (
    <div className="min-h-screen bg-transparent text-stone-100">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-3 py-4 sm:px-4 sm:py-6">
        <button
          className={`relative mb-4 w-full overflow-hidden rounded-[1.65rem] border border-white/12 px-4 py-3.5 text-left shadow-[0_24px_60px_rgba(0,0,0,0.24)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 sm:mb-5 sm:px-5 sm:py-4 ${languageTheme.shell}`}
          type="button"
          onClick={() => navigate("/languages")}
        >
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute -left-4 top-1 h-16 w-16 rounded-full blur-2xl motion-safe:animate-pulse ${languageTheme.accentLeft}`}
          />
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute right-0 top-1 h-14 w-14 rounded-full blur-2xl motion-safe:animate-pulse ${languageTheme.accentRight}`}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
          />
          <div className="relative flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-white/70">
                {languageTheme.eyebrow}
              </p>
              <span
                className={`mt-0.5 block truncate bg-gradient-to-r bg-clip-text text-[1.18rem] font-black tracking-[-0.045em] text-transparent drop-shadow-[0_10px_24px_rgba(76,29,149,0.36)] sm:text-[1.3rem] ${languageTheme.titleGradient}`}
              >
                {TEXT.title}
              </span>
            </div>
            <span
              className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] ${languageTheme.chip}`}
            >
              {languageLabel}
            </span>
          </div>
        </button>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
