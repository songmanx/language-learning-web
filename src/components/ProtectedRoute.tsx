import type { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { appLogger } from "../services/logger";
import { useAuthStore } from "../stores/authStore";

export function ProtectedRoute({ children }: PropsWithChildren) {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const playerId = useAuthStore((state) => state.playerId);
  const location = useLocation();

  if (!isLoggedIn) {
    appLogger.warning("route", "인증이 풀려 로그인 화면으로 이동", {
      from: location.pathname,
      playerId,
    });
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
