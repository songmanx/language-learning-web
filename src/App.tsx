import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { HomePage } from "./pages/HomePage";
import { LanguageSelectPage } from "./pages/LanguageSelectPage";
import { LoginPage } from "./pages/LoginPage";
import { OverallLeaderboardPage } from "./pages/OverallLeaderboardPage";
import { PlayPage } from "./pages/PlayPage";
import { ResultPage } from "./pages/ResultPage";
import { ReviewPage } from "./pages/ReviewPage";
import { StatsPage } from "./pages/StatsPage";
import { appLogger } from "./services/logger";

export default function App() {
  const location = useLocation();

  useEffect(() => {
    function handleError(event: ErrorEvent) {
      appLogger.error("runtime", "전역 런타임 오류 감지", {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    }

    function handleRejection(event: PromiseRejectionEvent) {
      appLogger.error("runtime", "처리되지 않은 Promise 오류 감지", {
        reason:
          event.reason instanceof Error
            ? {
                message: event.reason.message,
                stack: event.reason.stack,
              }
            : String(event.reason),
      });
    }

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  useEffect(() => {
    appLogger.info("route", "라우트 이동", {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
    });
  }, [location.hash, location.pathname, location.search]);

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/languages"
          element={
            <ProtectedRoute>
              <LanguageSelectPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <OverallLeaderboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/play"
          element={
            <ProtectedRoute>
              <PlayPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice"
          element={
            <ProtectedRoute>
              <PlayPage mode="practice" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/review"
          element={
            <ProtectedRoute>
              <ReviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/result"
          element={
            <ProtectedRoute>
              <ResultPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stats"
          element={
            <ProtectedRoute>
              <StatsPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AppShell>
  );
}
