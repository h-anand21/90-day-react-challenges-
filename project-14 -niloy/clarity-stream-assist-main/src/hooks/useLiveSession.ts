import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { InterpreterService } from "@/core/InterpreterService";
import { translateSentences } from "@/lib/translate.functions";
import { persistSegment } from "@/lib/persist-segment.functions";
import type { SessionState } from "@/core/types";

function safeUseServerFn<T extends (...args: any[]) => any>(fn: T, fallback: T): T {
  try {
    const serverFn = useServerFn(fn);
    return serverFn || fallback;
  } catch {
    return fallback;
  }
}

export function useLiveSession(outputLanguage: string, speak: boolean = false) {
  const translate = safeUseServerFn(
    translateSentences,
    async (input: any) => ({ translations: input?.data?.sentences || [] })
  );
  
  const persist = safeUseServerFn(
    persistSegment,
    async () => ({ success: true })
  );

  const [state, setState] = useState<SessionState>(() => InterpreterService.getState());

  useEffect(() => {
    InterpreterService.configure({
      translateFn: async (input) => {
        try {
          const res = await translate({ data: input });
          return { translations: res?.translations || input.sentences };
        } catch {
          return { translations: input.sentences };
        }
      },
      outputLanguage,
      persistFn: async (input) => {
        try {
          await persist({ data: input });
        } catch {
          // Fallback ignore
        }
      },
    });
    return InterpreterService.subscribe(setState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    InterpreterService.setOutputLanguage(outputLanguage);
  }, [outputLanguage]);

  useEffect(() => {
    InterpreterService.configure({ speak });
  }, [speak]);

  return {
    state,
    start: () => InterpreterService.start(),
    pause: () => InterpreterService.pause(),
    resume: () => InterpreterService.resume(),
    stop: () => InterpreterService.stop(),
  };
}
