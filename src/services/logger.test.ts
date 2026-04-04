import { beforeEach, describe, expect, it } from "vitest";
import { appLogger, clearDebugLogs, readDebugLogs } from "./logger";

describe("logger", () => {
  beforeEach(() => {
    window.localStorage.clear();
    clearDebugLogs();
  });

  it("stores recent debug logs in localStorage", () => {
    appLogger.warning("route", "인증이 풀려 로그인 화면으로 이동", {
      from: "/play",
    });

    const logs = readDebugLogs();

    expect(logs).toHaveLength(1);
    expect(logs[0]?.scope).toBe("route");
    expect(logs[0]?.level).toBe("WARNING");
    expect(logs[0]?.message).toContain("인증이 풀려");
    expect(logs[0]?.path).toBeTruthy();
    expect(logs[0]?.meta).toMatchObject({
      from: "/play",
    });
  });
});
