import { Logging } from "./Logging";

export interface RetryOptions {
  attempts?: number;
  baseMs?: number;
  maxMs?: number;
  factor?: number;
  jitter?: boolean;
  scope?: string;
  signal?: AbortSignal;
  onAttempt?: (attempt: number, err: unknown) => void;
}

/**
 * Exponential backoff retry. Only after `attempts` failures should the caller
 * switch providers — this helper never switches on its own.
 */
export async function retryWithBackoff<T>(
  fn: (attempt: number) => Promise<T>,
  opts: RetryOptions = {},
): Promise<T> {
  const attempts = opts.attempts ?? 3;
  const base = opts.baseMs ?? 400;
  const max = opts.maxMs ?? 4000;
  const factor = opts.factor ?? 2;
  const scope = opts.scope ?? "retry";

  let lastErr: unknown;
  for (let i = 1; i <= attempts; i++) {
    if (opts.signal?.aborted) throw new Error("aborted");
    try {
      return await fn(i);
    } catch (err) {
      lastErr = err;
      opts.onAttempt?.(i, err);
      Logging.warn(scope, "attempt_failed", {
        attempt: i, of: attempts, error: (err as Error)?.message ?? String(err),
      });
      if (i === attempts) break;
      const delay = Math.min(max, base * Math.pow(factor, i - 1));
      const jitter = opts.jitter === false ? 0 : Math.random() * delay * 0.25;
      await sleep(delay + jitter, opts.signal);
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

export function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new Error("aborted"));
    const t = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(t);
      reject(new Error("aborted"));
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}
