type LogLevel = "INFO" | "WARNING" | "ERROR";

type LogMeta = Record<string, unknown> | undefined;

function printLog(level: LogLevel, scope: string, message: string, meta?: LogMeta) {
  const prefix = `[${level}] [${scope}]`;

  if (meta !== undefined) {
    console.log(prefix, message, meta);
    return;
  }

  console.log(prefix, message);
}

export function logger(level: LogLevel, message: string, meta?: LogMeta) {
  printLog(level, "app", message, meta);
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
