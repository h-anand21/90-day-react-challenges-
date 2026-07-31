import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { InterpreterService } from "@/core/InterpreterService";
import { translateSentences } from "@/lib/translate.functions";
import { persistSegment } from "@/lib/persist-segment.functions";
import type { SessionState } from "@/core/types";

/**
 * React binding for the InterpreterService facade. The UI never imports a
 * concrete provider — it only talks to this service.
 *
 * Voice output no longer goes through a request/response TTS server fn:
 * the conversational interpreter streams sentences directly to
 * /api/tts-stream inside InterpreterService for the lowest possible latency.
 */
export function useLiveSession(outputLanguage: string, speak: boolean = false) {
  const translate = useServerFn(translateSentences);
  const persist = useServerFn(persistSegment);
  const [state, setState] = useState<SessionState>(() => InterpreterService.getState());

  useEffect(() => {
    InterpreterService.configure({
      translateFn: async (input) => {
        const res = await translate({ data: input });
        return { translations: res.translations };
      },
      outputLanguage,
      persistFn: async (input) => persist({ data: input }),
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

