import { EventBus } from "./EventBus";
import type { ProviderHealthRecord, ProviderHealthStatus, ProviderKind } from "./types";

const WINDOW = 20; // rolling window for latency + errors

interface RollingStats {
  latencies: number[];
  outcomes: (0 | 1)[]; // 0 ok, 1 error
}

class ProviderHealthImpl {
  private records = new Map<string, ProviderHealthRecord>();
  private stats = new Map<string, RollingStats>();

  private key(kind: ProviderKind, name: string) { return `${kind}:${name}`; }

  ensure(kind: ProviderKind, name: string): ProviderHealthRecord {
    const k = this.key(kind, name);
    let rec = this.records.get(k);
    if (!rec) {
      rec = {
        kind, provider: name,
        status: "healthy",
        avgLatencyMs: 0,
        errorRate: 0,
        lastSuccessAt: null,
        lastErrorAt: null,
        connectionState: "disconnected",
        totalRequests: 0,
        totalErrors: 0,
      };
      this.records.set(k, rec);
      this.stats.set(k, { latencies: [], outcomes: [] });
    }
    return rec;
  }

  recordSuccess(kind: ProviderKind, name: string, latencyMs: number): void {
    const rec = this.ensure(kind, name);
    const s = this.stats.get(this.key(kind, name))!;
    s.latencies.push(latencyMs); if (s.latencies.length > WINDOW) s.latencies.shift();
    s.outcomes.push(0);          if (s.outcomes.length > WINDOW) s.outcomes.shift();
    rec.totalRequests++;
    rec.lastSuccessAt = Date.now();
    rec.connectionState = "connected";
    this.recompute(rec, s);
  }

  recordError(kind: ProviderKind, name: string, err: unknown): void {
    const rec = this.ensure(kind, name);
    const s = this.stats.get(this.key(kind, name))!;
    s.outcomes.push(1); if (s.outcomes.length > WINDOW) s.outcomes.shift();
    rec.totalRequests++;
    rec.totalErrors++;
    rec.lastErrorAt = Date.now();
    rec.lastError = (err as Error)?.message ?? String(err);
    this.recompute(rec, s);
  }

  setConnectionState(kind: ProviderKind, name: string, state: ProviderHealthRecord["connectionState"]) {
    const rec = this.ensure(kind, name);
    rec.connectionState = state;
    EventBus.emit("ProviderHealthUpdated", { record: { ...rec } });
  }

  private recompute(rec: ProviderHealthRecord, s: RollingStats): void {
    rec.avgLatencyMs = s.latencies.length
      ? s.latencies.reduce((a, b) => a + b, 0) / s.latencies.length : 0;
    rec.errorRate = s.outcomes.length
      ? s.outcomes.reduce<number>((a, b) => a + b, 0) / s.outcomes.length : 0;
    rec.status = classify(rec);
    EventBus.emit("ProviderHealthUpdated", { record: { ...rec } });
  }

  get(kind: ProviderKind, name: string): ProviderHealthRecord | undefined {
    return this.records.get(this.key(kind, name));
  }

  all(): ProviderHealthRecord[] {
    return Array.from(this.records.values()).map((r) => ({ ...r }));
  }
}

function classify(rec: ProviderHealthRecord): ProviderHealthStatus {
  if (rec.errorRate >= 0.75) return "offline";
  if (rec.errorRate >= 0.3 || rec.avgLatencyMs > 5000) return "degraded";
  return "healthy";
}

export const ProviderHealth = new ProviderHealthImpl();
