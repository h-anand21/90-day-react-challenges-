import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSpeechService, getSummaryService } from "./ai/services";
import type { SummaryFormat, TranscriptSegment } from "./ai/interfaces";

export const detectLanguage = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ text: z.string().min(1).max(4000) }).parse(d))
  .handler(async ({ data }) => ({ language: await getSpeechService().detectLanguage(data.text) }));

/**
 * Upload-file pipeline. Real byte-level STT for uploaded audio is served by
 * `/api/transcribe` (which uses the SpeechProviderFactory). This server fn
 * keeps the demo timeline synthesis for the upload preview UI — it never
 * touches a concrete provider directly.
 */
const MOCK_LINES = [
  "Welcome everyone to today's session on accessibility in modern web apps.",
  "We'll start by reviewing what happened in our last conversation about screen readers.",
  "The key insight is that semantic HTML gives you accessibility almost for free.",
  "When you use proper heading levels, focus states, and ARIA roles, the platform helps you.",
  "Let's look at a live example of a form that fails basic keyboard navigation.",
  "Notice how the tab order jumps around unpredictably — that's a real barrier.",
  "Fixing it took only a few lines: correct label associations and a visible focus ring.",
  "Next we'll talk about live captions and real-time translation for lectures.",
  "The goal is that anyone, in any language, can participate on equal footing.",
  "We'll close with a demo of AccessAI running on a recorded classroom session.",
];

export const transcribeFile = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        fileName: z.string().min(1),
        mimeType: z.string().default("application/octet-stream"),
        sizeBytes: z.number().int().nonnegative(),
      })
      .parse(d),
  )
  .handler(async ({ data }): Promise<{
    detectedLanguage: string;
    segments: TranscriptSegment[];
    durationSec: number;
  }> => {
    const approxDuration = Math.max(30, Math.min(900, Math.round(data.sizeBytes / 16000)));
    const count = Math.max(4, Math.min(MOCK_LINES.length, Math.round(approxDuration / 12)));
    const step = approxDuration / count;
    const segments: TranscriptSegment[] = Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      text: MOCK_LINES[i % MOCK_LINES.length],
      ts: Math.round(i * step),
      confidence: 0.92 + Math.random() * 0.06,
    }));
    // Detect language from the synthesised transcript via the configured provider.
    const detectedLanguage = await getSpeechService().detectLanguage(
      segments.map((s) => s.text).join(" "),
    );
    return { detectedLanguage, segments, durationSec: approxDuration };
  });

export const summarizeTranscript = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        transcript: z.string().min(10),
        format: z.enum(["quick", "detailed", "bullets", "concepts", "minutes", "actions"]),
        targetLanguage: z.string().min(2),
      })
      .parse(d),
  )
  .handler(async ({ data }): Promise<{ summary: string }> => {
    const summary = await getSummaryService().summarize({
      transcript: data.transcript,
      format: data.format as SummaryFormat,
      targetLanguage: data.targetLanguage,
    });
    return { summary };
  });
