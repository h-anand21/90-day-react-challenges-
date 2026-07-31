/**
 * Legacy compatibility shim.
 *
 * Older code imported a single `defaultProvider` (`AIProvider`) that mixed
 * transcription + summarization + language detection. The app is now built on
 * discrete provider interfaces (`ITranscriptionProvider`, `ITranslationProvider`,
 * `ISummaryProvider`, `IChatProvider`) instantiated by factories that read
 * `AIConfig`. New code MUST import from `./services` — this shim only exists
 * so pre-refactor imports keep compiling.
 */

export type {
  SummaryFormat,
  TranscribeResult,
  TranscriptSegment,
} from "./interfaces";

import type { SummaryFormat, TranscribeResult } from "./interfaces";
import { getSpeechService, getSummaryService } from "./services";

export const defaultProvider = {
  name: "composite",

  async detectLanguage(text: string): Promise<string> {
    return getSpeechService().detectLanguage(text);
  },

  async transcribeFile(input: {
    fileName: string;
    mimeType: string;
    sizeBytes: number;
  }): Promise<TranscribeResult & { detectedLanguage: string; segments: NonNullable<TranscribeResult["segments"]>; durationSec: number }> {
    // File-based transcription without the raw bytes is not something a real
    // provider can serve — this legacy path exists for the upload demo only.
    // Callers on the new API pass a Blob directly via getSpeechService().
    throw new Error(
      "defaultProvider.transcribeFile is deprecated; call getSpeechService().transcribe({ audio }) with the file blob.",
    );
    void input;
  },

  async summarize(input: {
    transcript: string;
    format: SummaryFormat;
    targetLanguage: string;
  }): Promise<string> {
    return getSummaryService().summarize(input);
  },
};
