import { readJsonStorage, removeStorageItem, writeJsonStorage } from "./storage";

type LogLevel = "INFO" | "WARNING" | "ERROR";
type LogMeta = Record<string, unknown> | undefined;

const DEBUG_LOG_STORAGE_KEY = "study-web-debug-logs";
const MAX_DEBUG_LOGS = 200;

type DebugLogEntry = {
  timestamp: string;
  level: LogLevel;
  scope: string;
  message: string;
  path: string | null;
  meta?: Record<string, unknown>;
};

function writePersistentLog(entry: DebugLogEntry) {
  if (typeof window === "undefined") {
    return;
  }

  const nextEntries = [...readJsonStorage<DebugLogEntry[]>(DEBUG_LOG_STORAGE_KEY, []), entry].slice(-MAX_DEBUG_LOGS);
  writeJsonStorage(DEBUG_LOG_STORAGE_KEY, nextEntries);
}

function printLog(level: LogLevel, scope: string, message: string, meta?: LogMeta) {
  const prefix = `[${level}] [${scope}]`;
  const entry: DebugLogEntry = {
    timestamp: new Date().toISOString(),
    level,
    scope,
    message,
    path: typeof window !== "undefined" ? window.location.hash || window.location.pathname : null,
    ...(meta ? { meta } : {}),
  };

  writePersistentLog(entry);

  if (meta !== undefined) {
    console.log(prefix, message, meta);
    return;
  }

  console.log(prefix, message);
}

export function logger(level: LogLevel, message: string, meta?: LogMeta) {
  printLog(level, "app", message, meta);
}

export function readDebugLogs() {
  return readJsonStorage<DebugLogEntry[]>(DEBUG_LOG_STORAGE_KEY, []);
}

export function clearDebugLogs() {
  removeStorageItem(DEBUG_LOG_STORAGE_KEY);
}

export const appLogger = {
  info(scope: string, message: string, meta?: LogMeta) {
    printLog("INFO", scope, message, meta);
  },
  warning(scope: string, message: string, meta?: LogMeta) {
    printLog("WARNING", scope, message, meta);
  },
  error(scope: string, message: string, meta?: LogMeta) {
    printLog("ERROR", scope, message, meta);
  },
};
