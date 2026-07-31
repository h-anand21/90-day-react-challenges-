import type { SessionEventMap, SessionEventName } from "./types";

/**
 * Tiny typed pub/sub. Every domain event in the app flows through this bus
 * so UI, analytics, logging, and integrations all subscribe instead of poll.
 */
type Handler<K extends SessionEventName> = (payload: SessionEventMap[K]) => void;

class EventBusImpl {
  private handlers = new Map<SessionEventName, Set<Handler<SessionEventName>>>();

  on<K extends SessionEventName>(event: K, handler: Handler<K>): () => void {
    let set = this.handlers.get(event);
    if (!set) {
      set = new Set();
      this.handlers.set(event, set);
    }
    set.add(handler as Handler<SessionEventName>);
    return () => {
      set!.delete(handler as Handler<SessionEventName>);
    };
  }

  emit<K extends SessionEventName>(event: K, payload: SessionEventMap[K]): void {
    const set = this.handlers.get(event);
    if (!set) return;
    for (const h of set) {
      try {
        (h as Handler<K>)(payload);
      } catch (err) {
        // Never let one bad subscriber break the bus.
        // eslint-disable-next-line no-console
        console.error(`[EventBus] handler for ${event} threw:`, err);
      }
    }
  }

  clear(): void {
    this.handlers.clear();
  }
}

/** Singleton — one bus per browser tab is exactly what we want. */
export const EventBus = new EventBusImpl();
export type { SessionEventMap, SessionEventName };
