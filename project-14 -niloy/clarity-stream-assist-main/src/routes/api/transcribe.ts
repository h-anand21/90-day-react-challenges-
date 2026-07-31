import { createFileRoute } from "@tanstack/react-router";
import { getSpeechService } from "@/lib/ai/services";
import { LanguageDetectionService } from "@/core/LanguageDetectionService";

/**
 * Speech-to-text endpoint with multi-provider language fusion.
 *
 * Language detection is NOT delegated to the STT provider alone. The STT
 * result is treated as one voter, alongside a script-based detector (always
 * available, deterministic on non-Latin scripts) and an LLM text detector.
 * `LanguageDetectionService` fuses their confidence scores into a single
 * decision plus per-language candidates + a `mixed` flag for code-switching.
 */
export const Route = createFileRoute("/api/transcribe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const form = await request.formData();
        const file = form.get("file");
        if (!(file instanceof Blob)) return new Response("Missing file", { status: 400 });

        const name = (file as File).name || "recording.wav";
        const size = file.size;
        const mime = file.type;
        const t0 = Date.now();

        try {
          const provider = getSpeechService();
          const result = await provider.transcribe({ audio: file, fileName: name, mimeType: mime });

          const text = (result.text ?? "").toString().trim();
          const fused = await LanguageDetectionService.detect({
            text,
            sttHint: {
              language: result.detectedLanguage ?? null,
              confidence: result.languageConfidence ?? result.confidence ?? null,
            },
          });

          return Response.json({
            text,
            detectedLanguage: fused.language !== "unknown" ? fused.language : null,
            confidence: result.confidence ?? null,
            languageConfidence: fused.confidence,
            mixed: fused.mixed,
            candidates: fused.candidates,
            votes: fused.votes,
            provider: provider.name,
            model: result.model ?? null,
            status: 200,
            durationMs: Date.now() - t0,
            bytes: size,
            mime,
            raw: result.raw ?? null,
          });
        } catch (err: any) {
          return Response.json(
            {
              text: "",
              error: err?.message ?? String(err),
              status: 502,
              durationMs: Date.now() - t0,
              bytes: size,
              mime,
            },
            { status: 502 },
          );
        }
      },
    },
  },
});
