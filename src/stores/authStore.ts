import { create } from "zustand";
import { apiClient } from "../services/apiClient";
import { appLogger } from "../services/logger";
import { readJsonStorage, writeJsonStorage } from "../services/storage";

const AUTH_STORAGE_KEY = "study-web-auth";

type AuthSnapshot = {
  isLoggedIn: boolean;
  token: string | null;
  playerId: string | null;
  nickname: string | null;
};

type AuthStore = AuthSnapshot & {
  login: (loginId: string, password: string) => Promise<void>;
  logout: () => void;
};

const initialState: AuthSnapshot = readJsonStorage<AuthSnapshot>(AUTH_STORAGE_KEY, {
  isLoggedIn: false,
  token: null,
  playerId: null,
  nickname: null,
});

export const useAuthStore = create<AuthStore>((set) => ({
  ...initialState,
  async login(loginId, password) {
    appLogger.info("auth", "로그인 요청 시작", { loginId });
    const result = await apiClient.login({ loginId, password });
    const nextState: AuthSnapshot = {
      isLoggedIn: true,
      token: result.token,
      playerId: result.playerId,
      nickname: result.nickname,
    };

    writeJsonStorage(AUTH_STORAGE_KEY, nextState);
    set(nextState);
    appLogger.info("auth", "로그인 성공", {
      loginId,
      playerId: result.playerId,
    });
  },
  logout() {
    const nextState: AuthSnapshot = {
      isLoggedIn: false,
      token: null,
      playerId: null,
      nickname: null,
    };

    writeJsonStorage(AUTH_STORAGE_KEY, nextState);
    set(nextState);
    appLogger.info("auth", "로그아웃 완료");
  },
}));
