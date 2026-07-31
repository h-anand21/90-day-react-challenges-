import { EventBus } from "./EventBus";
import type { LogLevel } from "./types";

interface LogEntry {
  level: LogLevel;
  scope: string;
  event: string;
  data?: unknown;
  at: number;
}

class LoggingServiceImpl {
  private ring: LogEntry[] = [];
  private capacity = 500;

  log(level: LogLevel, scope: string, event: string, data?: unknown): void {
    const entry: LogEntry = { level, scope, event, data, at: Date.now() };
    this.ring.push(entry);
    if (this.ring.length > this.capacity) this.ring.shift();

    const fmt = `[${scope}] ${event}`;
    // eslint-disable-next-line no-console
    const fn = level === "error" ? console.error
      : level === "warn" ? console.warn
      : level === "debug" ? console.debug
      : console.info;
    if (data !== undefined) fn(fmt, data); else fn(fmt);

    EventBus.emit("Log", entry);
  }

  debug(scope: string, event: string, data?: unknown) { this.log("debug", scope, event, data); }
  info(scope: string, event: string, data?: unknown)  { this.log("info",  scope, event, data); }
  warn(scope: string, event: string, data?: unknown)  { this.log("warn",  scope, event, data); }
  error(scope: string, event: string, data?: unknown) { this.log("error", scope, event, data); }

  snapshot(): LogEntry[] { return this.ring.slice(); }
  clear(): void { this.ring = []; }
}

export const Logging = new LoggingServiceImpl();
export type { LogEntry };
