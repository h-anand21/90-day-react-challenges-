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
  const translate = useServerFn(translateSentences);
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
          const t = res.translations[i];
          if (t) map[s.id] = t;
          doneRef.current.add(s.id);
        });
        setTranslations((prev) => ({ ...prev, ...map }));
        setError(null);
      } catch (e: any) {
        setError(e?.message ?? "Translation error");
        // release so we can retry
        batch.forEach((s) => doneRef.current.add(s.id));
      } finally {
        batch.forEach((s) => inFlight.current.delete(s.id));
        setBusy(false);
      }
    })();
  }, [sentences, enabled, target, translate]);

  return { translations, busy, error };
}
