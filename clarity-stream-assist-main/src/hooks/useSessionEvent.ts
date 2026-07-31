import { useEffect } from "react";
import { EventBus } from "@/core/EventBus";
import type { SessionEventMap, SessionEventName } from "@/core/types";

export function useSessionEvent<K extends SessionEventName>(
  event: K,
  handler: (payload: SessionEventMap[K]) => void,
  deps: React.DependencyList = [],
): void {
  useEffect(() => {
    return EventBus.on(event, handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
