import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { appLogger } from "../services/logger";
import { useLanguageStore } from "../stores/languageStore";

const TEXT = {
  title: "\uC5B8\uC5B4 \uC120\uD0DD",
  description:
    "\uBA3C\uC800 \uD559\uC2B5\uD560 \uC5B8\uC5B4\uB97C \uACE0\uB974\uBA74 \uBB38\uC81C \uB370\uC774\uD130\uB97C \uBD88\uB7EC\uC628 \uB4A4 \uBC14\uB85C \uD648 \uD654\uBA74\uC73C\uB85C \uC774\uB3D9\uD569\uB2C8\uB2E4.",
  currentSupport: "\uD604\uC7AC \uC900\uBE44\uB41C \uC5B8\uC5B4",
  loading: "\uC5B8\uC5B4 \uBAA9\uB85D\uC744 \uBD88\uB7EC\uC624\uB294 \uC911...",
  totalQuestions: "\uC900\uBE44\uB41C \uBB38\uC81C",
  selectAction: "\uC774 \uC5B8\uC5B4\uB85C \uC2DC\uC791\uD558\uAE30",
} as const;

export function LanguageSelectPage() {
  const navigate = useNavigate();
  const { availableLanguages, isLoading, loadError, loadMeta, loadWords, selectLanguage } =
    useLanguageStore();

  useEffect(() => {
    void loadMeta();
  }, [loadMeta]);

  async function handleSelect(languageCode: string) {
    appLogger.info("language", "언어 선택 화면에서 단어 로드 시작", { languageCode });
    selectLanguage(languageCode);
    navigate("/home");
    void loadWords(languageCode);
  }

  return (
    <section className="space-y-4">
      <div className="rounded-[2rem] border border-white/10 bg-stone-950/40 p-6">
        <h2 className="text-2xl font-bold">{TEXT.title}</h2>
        <p className="mt-2 text-sm leading-6 text-stone-300">{TEXT.description}</p>
        <p className="mt-3 text-sm leading-6 text-stone-400">
          {TEXT.currentSupport}: {availableLanguages.length > 0 ? availableLanguages.length : 1}개
        </p>
        {loadError ? <p className="mt-3 text-sm text-amber-200">{loadError}</p> : null}
      </div>

      <div className="space-y-3">
        {isLoading ? <p className="text-sm text-stone-300">{TEXT.loading}</p> : null}
        {availableLanguages.map((language) => (
          <button
            key={language.languageCode}
            className="w-full rounded-[1.75rem] border border-white/10 bg-white/8 px-5 py-5 text-left transition hover:border-amber-300/50 hover:bg-white/12"
            type="button"
            onClick={() => void handleSelect(language.languageCode)}
          >
            <p className="text-lg font-semibold">{language.label}</p>
            <p className="mt-1 text-sm text-stone-300">
              {TEXT.totalQuestions}: {language.totalWords}문항
            </p>
            <p className="mt-3 text-sm font-medium text-amber-200">{TEXT.selectAction}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

