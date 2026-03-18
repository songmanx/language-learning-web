import type { PropsWithChildren } from "react";
import { getRuntimeConfig } from "../services/runtimeConfig";

const runtimeConfig = getRuntimeConfig();

const TEXT = {
  phaseLabel: "Japanese MVP",
  title: "\uC77C\uBCF8\uC5B4 \uACF5\uBD80 \uD750\uB984",
  description:
    "\uB85C\uADF8\uC778, \uC5B8\uC5B4 \uC120\uD0DD, \uAE30\uBCF8 \uD50C\uB808\uC774 \uB8E8\uD504\uAE4C\uC9C0 \uC774\uC5B4\uC9C0\uB294 \uD559\uC2B5 \uB370\uBAA8\uC785\uB2C8\uB2E4.",
  connectionLabel: "\uC5F0\uACB0 \uC0C1\uD0DC",
  mockConnection: "Mock API \uBAA8\uB4DC",
  jsonConnection: "\uC815\uC801 JSON \uC77D\uAE30 + GAS \uC800\uC7A5 \uBAA8\uB4DC",
  gasConnection: "GAS \uC2E4\uC5F0\uB3D9 \uBAA8\uB4DC",
} as const;

const connectionLabel =
  runtimeConfig.readDataMode === "mock"
    ? TEXT.mockConnection
    : runtimeConfig.readDataMode === "json"
      ? TEXT.jsonConnection
      : TEXT.gasConnection;

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-transparent text-stone-100">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-3 py-4 sm:px-4 sm:py-6">
        <header className="mb-4 rounded-[1.75rem] border border-white/10 bg-white/8 px-4 py-4 backdrop-blur sm:mb-6 sm:rounded-3xl sm:px-5">
          <p className="text-xs uppercase tracking-[0.35em] text-amber-200/80">{TEXT.phaseLabel}</p>
          <h1 className="mt-2 text-xl font-bold text-stone-50 sm:text-2xl">{TEXT.title}</h1>
          <p className="mt-1 text-sm leading-6 text-stone-300">{TEXT.description}</p>
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-[11px] tracking-[0.25em] text-stone-500">{TEXT.connectionLabel}</p>
            <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-100">
              {connectionLabel}
            </span>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
