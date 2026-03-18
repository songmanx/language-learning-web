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
  phase: "로그인",
  title: "학습을 시작해 봅시다",
  mockDescription:
    "지금은 데모 계정으로 바로 시작할 수 있습니다. 로그인 후 언어를 고르고 곧바로 문제 풀이를 이어갈 수 있습니다.",
  realDescription:
    "지금은 실제 Google Sheets 계정으로 로그인합니다. Users 시트에 넣어 둔 로그인ID와 비밀번호를 입력해 주세요.",
  mockHintTitle: "바로 써볼 수 있는 데모 계정",
  mockHintBody: "아이디 `demo`, 비밀번호 `1234`로 바로 로그인할 수 있습니다.",
  realHintTitle: "실연동 모드 로그인",
  realHintBody: "지금은 Users 시트의 `login_id`, `password_plain_or_hash` 값을 그대로 입력해야 합니다.",
  loginId: "아이디",
  password: "비밀번호",
  mockLoginIdPlaceholder: "demo",
  mockPasswordPlaceholder: "1234",
  realLoginIdPlaceholder: "Users 시트의 login_id",
  realPasswordPlaceholder: "Users 시트의 password_plain_or_hash",
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
      className="space-y-5 rounded-[2rem] border border-white/10 bg-stone-950/40 p-6 shadow-2xl shadow-black/20"
    >
      <div>
        <p className="text-sm text-amber-200">{TEXT.phase}</p>
        <h2 className="mt-2 text-3xl font-bold">{TEXT.title}</h2>
        <p className="mt-2 text-sm leading-6 text-stone-300">
          {IS_MOCK_MODE ? TEXT.mockDescription : TEXT.realDescription}
        </p>
      </div>

      <div className="rounded-[1.75rem] border border-sky-200/20 bg-sky-300/10 p-4 text-sm leading-6 text-sky-50">
        <p className="font-semibold">{IS_MOCK_MODE ? TEXT.mockHintTitle : TEXT.realHintTitle}</p>
        <p className="mt-2">{IS_MOCK_MODE ? TEXT.mockHintBody : TEXT.realHintBody}</p>
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
            placeholder={IS_MOCK_MODE ? TEXT.mockLoginIdPlaceholder : TEXT.realLoginIdPlaceholder}
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
            placeholder={IS_MOCK_MODE ? TEXT.mockPasswordPlaceholder : TEXT.realPasswordPlaceholder}
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
