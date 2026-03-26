import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { appLogger } from "../services/logger";
import { useAuthStore } from "../stores/authStore";
import { useLanguageStore } from "../stores/languageStore";

const TEXT = {
  title: "언어 선택",
  loading: "언어 목록을 불러오는 중...",
  accent: "JAPANESE",
  select: "선택",
  logout: "로그아웃",
} as const;

export function LanguageSelectPage() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const { availableLanguages, isLoading, loadError, loadMeta, loadWords, selectLanguage } =
    useLanguageStore();

  useEffect(() => {
    void loadMeta();
  }, [loadMeta]);

  async function handleSelect(languageCode: string) {
    appLogger.info("language", "언어 선택 화면에서 언어 로드 시작", { languageCode });
    selectLanguage(languageCode);
    navigate("/home");
    void loadWords(languageCode);
  }

  return (
    <section className="space-y-4">
      <div className="rounded-[1.7rem] border border-white/10 bg-stone-950/40 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.16)]">
        <h2 className="text-[1.08rem] font-black tracking-[-0.04em] text-white sm:text-[1.2rem]">
          {TEXT.title}
        </h2>
        {loadError ? <p className="mt-3 text-sm text-amber-200">{loadError}</p> : null}
      </div>

      <div className="space-y-3">
        {isLoading ? <p className="text-sm text-stone-300">{TEXT.loading}</p> : null}
        {availableLanguages.map((language) => (
          <button
            key={language.languageCode}
            className="group relative w-full overflow-hidden rounded-[1.7rem] border border-white/12 bg-[linear-gradient(135deg,rgba(255,245,214,0.18),rgba(255,255,255,0.06)_35%,rgba(148,163,184,0.08)_100%)] px-5 py-5 text-left shadow-[0_24px_60px_rgba(0,0,0,0.18)] transition duration-300 hover:-translate-y-0.5 hover:scale-[1.01] hover:border-amber-200/35 hover:shadow-[0_28px_70px_rgba(245,158,11,0.14)]"
            type="button"
            onClick={() => void handleSelect(language.languageCode)}
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -left-4 top-0 h-20 w-20 rounded-full bg-amber-300/18 blur-2xl transition duration-300 group-hover:bg-amber-200/24 motion-safe:animate-pulse"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-1 top-3 h-14 w-14 rounded-full bg-sky-300/14 blur-2xl transition duration-300 group-hover:bg-sky-200/18 motion-safe:animate-pulse"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-4 bottom-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
            />
            <span className="relative flex items-center justify-between gap-4">
              <span className="min-w-0">
                <span className="block text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-200/80">
                  {TEXT.accent}
                </span>
                <span className="mt-1 block text-[1.28rem] font-black tracking-[-0.045em] text-white drop-shadow-[0_8px_20px_rgba(0,0,0,0.16)] sm:text-[1.45rem]">
                  {language.label}
                </span>
              </span>
              <span className="shrink-0 rounded-full border border-white/14 bg-white/10 px-3 py-2 text-[12px] font-semibold text-amber-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
                {TEXT.select}
              </span>
            </span>
          </button>
        ))}
      </div>

      <div className="flex justify-center pt-2">
        <button
          className="text-[14px] font-medium text-stone-400 underline decoration-white/10 underline-offset-4 transition hover:text-stone-200"
          type="button"
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          {TEXT.logout}
        </button>
      </div>
    </section>
  );
}
