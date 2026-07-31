import { EventBus } from "./EventBus";
import { Logging } from "./Logging";
import { ProviderHealth } from "./ProviderHealth";
import { retryWithBackoff } from "./ErrorRecovery";
import type { ProviderKind } from "./types";

/**
 * Client-side provider manager. Wraps any async call that hits a remote
 * provider so we get: retry with backoff, health tracking, structured logs,
 * and provider-switch semantics — all without the UI knowing which vendor
 * is actually behind the call.
 *
 * Server-side provider failover across vendors (Deepgram → Whisper → …)
 * is still owned by `src/lib/ai/factory.ts`'s `withFailover` proxy; this
 * manager sits in front of the *call* the client makes to the server and
 * adds retry + health telemetry.
 */

export interface CallOptions {
  kind: ProviderKind;
  /** Logical provider label ("speech-primary", "translation", etc.) */
  provider: string;
  attempts?: number;
  signal?: AbortSignal;
}

class ProviderManagerImpl {
  private activeByKind = new Map<ProviderKind, string>();

  /**
   * Instrumented call. Retries up to `attempts` times with backoff; on
   * final failure records the error and rethrows so the caller can decide
   * to switch providers.
   */
  async call<T>(opts: CallOptions, fn: () => Promise<T>): Promise<T> {
    const { kind, provider } = opts;
    const attempts = opts.attempts ?? 3;
    ProviderHealth.ensure(kind, provider);
    ProviderHealth.setConnectionState(kind, provider, "connecting");
    const started = Date.now();

    try {
      const result = await retryWithBackoff(async () => fn(), {
        attempts, baseMs: 400, maxMs: 4000, factor: 2,
        signal: opts.signal, scope: `${kind}:${provider}`,
      });
      ProviderHealth.recordSuccess(kind, provider, Date.now() - started);
      this.setActive(kind, provider, "call succeeded");
      return result;
    } catch (err) {
      ProviderHealth.recordError(kind, provider, err);
      ProviderHealth.setConnectionState(kind, provider, "disconnected");
      Logging.error("provider", "call_failed_all_attempts", {
        kind, provider, error: (err as Error)?.message,
      });
      throw err;
    }
  }

  /** Announce which provider is currently servicing a kind. */
  setActive(kind: ProviderKind, provider: string, reason: string): void {
    const prev = this.activeByKind.get(kind) ?? null;
    if (prev === provider) return;
    this.activeByKind.set(kind, provider);
    Logging.info("provider", "changed", { kind, from: prev, to: provider, reason });
    EventBus.emit("ProviderChanged", { kind, from: prev, to: provider, reason });
  }

  getActive(kind: ProviderKind): string | null {
    return this.activeByKind.get(kind) ?? null;
  }
}

export const ProviderManager = new ProviderManagerImpl();
