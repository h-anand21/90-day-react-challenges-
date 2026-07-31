import { useEffect, useState } from "react";
import { Analytics, type AnalyticsSnapshot } from "@/core/Analytics";

export function useAnalytics(): AnalyticsSnapshot {
  const [snap, setSnap] = useState<AnalyticsSnapshot>(() => Analytics.snapshot());
  useEffect(() => Analytics.subscribe(setSnap), []);
  return snap;
}
