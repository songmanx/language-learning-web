import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../services/apiClient";
import { appLogger } from "../services/logger";
import { useAuthStore } from "../stores/authStore";
import { useLanguageStore } from "../stores/languageStore";

const IS_MOCK_MODE = apiClient.useMockApi;
const TEXT = {
  title: "로그인",
  loginId: "아이디",
  password: "비밀번호",
  submitting: "로그인 중...",
  submit: "로그인",
  failedPrefix: "로그인 실패:",
} as const;

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const loadMeta = useLanguageStore((state) => state.loadMeta);
  const [loginId, setLoginId] = useState(IS_MOCK_MODE ? "demo" : "");
  const [password, setPassword] = useState(IS_MOCK_MODE ? "1234" : "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (IS_MOCK_MODE) {
      return;
    }

    void apiClient.warmupConnection();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await login(loginId, password);
      void loadMeta();
      navigate("/languages");
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown error";
      appLogger.error("login", "로그인 처리 실패", {
        loginId,
        message,
      });
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 rounded-[1.6rem] border border-white/10 bg-stone-950/40 p-5 shadow-2xl shadow-black/20"
    >
      <div>
        <h2 className="text-2xl font-bold">{TEXT.title}</h2>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-sm text-stone-200">{TEXT.loginId}</span>
          <input
            className="w-full rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-base outline-none placeholder:text-stone-500"
            value={loginId}
            onChange={(event) => {
              setLoginId(event.target.value);
              setErrorMessage(null);
            }}
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-stone-200">{TEXT.password}</span>
          <input
            className="w-full rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-base outline-none placeholder:text-stone-500"
            type="password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setErrorMessage(null);
            }}
          />
        </label>

        {errorMessage ? (
          <div className="rounded-[1.25rem] border border-rose-300/30 bg-rose-400/10 px-4 py-3 text-sm leading-6 text-rose-100">
            {TEXT.failedPrefix} {errorMessage}
          </div>
        ) : null}

        <button
          className="w-full rounded-2xl bg-amber-400 px-4 py-4 text-base font-semibold text-stone-950 transition hover:bg-amber-300 disabled:opacity-60"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? TEXT.submitting : TEXT.submit}
        </button>
      </form>
    </motion.section>
  );
}
