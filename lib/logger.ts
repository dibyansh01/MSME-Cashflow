export type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function getMinLevel(): LogLevel {
  const envLevel = (process.env.LOG_LEVEL || "").toLowerCase() as LogLevel;
  if (envLevel in LOG_LEVEL_PRIORITY) return envLevel;
  return process.env.NODE_ENV === "production" ? "info" : "debug";
}

export function sanitize(data: unknown): unknown {
  if (!data || typeof data !== "object") return data;
  if (Array.isArray(data)) return data.map(sanitize);

  const sanitized: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(data as Record<string, unknown>)) {
    const lowerKey = key.toLowerCase();
    if (
      lowerKey.includes("password") ||
      lowerKey.includes("secret") ||
      lowerKey.includes("token") ||
      lowerKey.includes("authorization")
    ) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof val === "object" && val !== null) {
      sanitized[key] = sanitize(val);
    } else {
      sanitized[key] = val;
    }
  }
  return sanitized;
}

export function formatLogEntry(
  level: LogLevel,
  message: string,
  meta?: Record<string, unknown>
): {
  timestamp: string;
  level: LogLevel;
  message: string;
  meta?: Record<string, unknown>;
} {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(meta ? { meta: sanitize(meta) as Record<string, unknown> } : {}),
  };
}

function output(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  if (LOG_LEVEL_PRIORITY[level] < LOG_LEVEL_PRIORITY[getMinLevel()]) {
    return;
  }
  const entry = formatLogEntry(level, message, meta);
  if (process.env.NODE_ENV === "production") {
    const logFn = level === "debug" ? console.log : console[level];
    logFn(JSON.stringify(entry));
  } else {
    const metaStr = meta ? ` ${JSON.stringify(sanitize(meta))}` : "";
    const logFn = level === "debug" ? console.log : console[level];
    logFn(`[${entry.timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`);
  }
}

export const logger = {
  debug: (message: string, meta?: Record<string, unknown>) => output("debug", message, meta),
  info: (message: string, meta?: Record<string, unknown>) => output("info", message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => output("warn", message, meta),
  error: (message: string, meta?: Record<string, unknown>) => output("error", message, meta),
};
