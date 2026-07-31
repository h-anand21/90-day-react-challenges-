/**
 * Persist a finalized transcript segment (with its embedding) to Lovable
 * Database via the publishable Supabase client. The RLS policies on
 * `public.transcript_segments` allow anon inserts by design — the app is
 * public-by-default and never stores PII.
 *
 * Embedding is computed inside the same server function so the browser
 * never sees `LOVABLE_API_KEY`, and the DB write only happens after both
 * the vector and translation are ready.
 */

import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { EmbeddingsProviderFactory } from "./ai/providers/embeddings/gateway";

const Input = z.object({
  sessionId: z.string().min(1).max(120),
  seq: z.number().int().nonnegative(),
  speaker: z.string().max(80).optional(),
  sourceLanguage: z.string().max(60).optional(),
  targetLanguage: z.string().max(60).optional(),
  sourceText: z.string().min(1).max(8000),
  translatedText: z.string().max(8000).optional(),
  audioUrl: z.string().url().optional(),
  meta: z.record(z.string(), z.unknown()).optional(),
});

export const persistSegment = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data }) => {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) throw new Error("Supabase publishable client not configured");

    const supabase = createClient(url, key, {
      auth: { persistSession: false },
      global: {
        fetch: (input, init) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
            h.delete("Authorization");
          }
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });

    // Embed the translated text when available, otherwise the source.
    // The vector is what powers cross-language semantic search across sessions.
    const embedTarget = (data.translatedText || data.sourceText).slice(0, 8000);
    let embedding: number[] | null = null;
    try {
      const embedder = EmbeddingsProviderFactory.create();
      const [vec] = await embedder.embed({ text: embedTarget, dimensions: 1536 });
      embedding = vec;
    } catch (err) {
      // Never block the write on embedding failure — segment is still valuable.
      // eslint-disable-next-line no-console
      console.warn("[persistSegment] embedding failed:", (err as Error)?.message);
    }

    const { data: row, error } = await supabase
      .from("transcript_segments")
      .insert({
        session_id: data.sessionId,
        seq: data.seq,
        speaker: data.speaker ?? null,
        source_language: data.sourceLanguage ?? null,
        target_language: data.targetLanguage ?? null,
        source_text: data.sourceText,
        translated_text: data.translatedText ?? null,
        embedding: embedding ? (embedding as unknown as string) : null,
        audio_url: data.audioUrl ?? null,
        meta: data.meta ?? {},
      })
      .select("id")
      .single();

    if (error) throw new Error(`persist HTTP: ${error.message}`);
    return { id: row?.id as string, embedded: !!embedding };
  });
