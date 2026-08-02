import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { translateSentences } from "./translate.functions";
import type { Sentence } from "./use-live-transcript";

export type TranslationMap = Record<number, string>;

type Options = {
  sentences: Sentence[];
  target: string; // ISO language code or name; "off" disables
  enabled: boolean;
};

function safeUseServerFn<T extends (...args: any[]) => any>(fn: T, fallback: T): T {
  try {
    const serverFn = useServerFn(fn);
    return serverFn || fallback;
  } catch {
    return fallback;
  }
}

/**
 * Streams translations sentence-by-sentence, keeping them synchronized
 * with committed transcript sentences. Batches up to 6 pending sentences
 * per request for latency + cost balance.
 */
export function useLiveTranslation({ sentences, target, enabled }: Options) {
  const [translations, setTranslations] = useState<TranslationMap>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef<Set<number>>(new Set());
  const doneRef = useRef<Set<number>>(new Set());
  
  const translate = safeUseServerFn(
    translateSentences,
    async (input: any) => ({ translations: input?.data?.sentences || [] })
  );
  
  const targetRef = useRef(target);

  // Reset when target changes or disabled
  useEffect(() => {
    if (targetRef.current !== target) {
      targetRef.current = target;
      setTranslations({});
      doneRef.current = new Set();
      inFlight.current = new Set();
      setError(null);
    }
  }, [target]);

  useEffect(() => {
    if (!enabled || target === "off") return;
    const pending = sentences.filter(
      (s) => !doneRef.current.has(s.id) && !inFlight.current.has(s.id)
    );
    if (!pending.length) return;

    const batch = pending.slice(0, 6);
    batch.forEach((s) => inFlight.current.add(s.id));
    setBusy(true);

    (async () => {
      try {
        const res = await translate({
          data: {
            sentences: batch.map((s) => s.text),
            target,
          },
        });
        const map: TranslationMap = {};
        batch.forEach((s, i) => {
          const t = res?.translations?.[i] || s.text;
          map[s.id] = t;
          doneRef.current.add(s.id);
        });
        setTranslations((prev) => ({ ...prev, ...map }));
      } catch (err: any) {
        setError(err?.message || "Translation failed");
      } finally {
        batch.forEach((s) => inFlight.current.delete(s.id));
        setBusy(false);
      }
    })();
  }, [sentences, target, enabled, translate]);

  return { translations, busy, error };
}
