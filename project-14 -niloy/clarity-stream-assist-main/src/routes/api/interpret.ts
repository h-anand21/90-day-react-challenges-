/**
 * /api/interpret — streaming CONVERSATIONAL INTERPRETER endpoint.
 *
 * This is NOT a translation endpoint. It renders the speaker's utterance the
 * way a professional human interpreter would speak it out loud, preserving
 * intent, emotion, tone, register and terminology consistency across turns.
 *
 * Runs on the Lovable AI Gateway Responses API against `openai/gpt-5.6-terra`
 * (reasoning model, streaming required). The upstream OpenAI SSE format is
 * parsed here and reprojected into a small, stable event stream:
 *
 *   event: sentence        data: {"text":"..."}     // sentence-boundary chunk
 *   event: delta           data: {"text":"..."}     // raw token delta (optional)
 *   event: done            data: {"text":"..."}     // full interpretation
 *   event: error           data: {"error":"..."}
 *
 * The client pipes each `sentence` event straight into ElevenLabs so speech
 * starts flowing while the model is still generating — mirroring how a real
 * simultaneous interpreter speaks over the source.
 */

import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { NativeStyleLibrary } from "@/core/NativeStyleLibrary";

const BodySchema = z.object({
  utterance: z.string().min(1).max(4000),
  sourceLanguage: z.string().max(80).optional(),
  targetLanguage: z.string().min(2).max(80),
  memory: z.array(z.object({
    source: z.string().max(2000),
    interpretation: z.string().max(2000),
  })).max(16).optional(),
  glossary: z.array(z.tuple([z.string(), z.string()])).max(64).optional(),
  /** Compact one-shot speaker profile card (register, terminology, style). */
  speakerProfile: z.string().max(1200).optional(),
});

const SYSTEM_TEMPLATE = `You are a WORLD-CLASS SIMULTANEOUS INTERPRETER re-voicing what the speaker just said into {TARGET}, live, out loud, RIGHT NOW.

You do NOT perform literal translation. You listen for MEANING, EMOTION, HUMOUR, POLITENESS, TERMINOLOGY, REGISTER, and PERSONALITY, then you SPEAK it the way a fluent native speaker of {TARGET} would say it spontaneously in real conversation. Every character you emit will be spoken aloud within milliseconds — write for the EAR, not the page.

The listener must never be able to tell the original was in another language. The rhythm, word order, phrasing, pauses, and discourse markers MUST belong to {TARGET}, not to the source.

## Reformulate, do not translate
- Reorder the sentence to follow {TARGET}'s natural grammar and information flow (SOV vs SVO, topic-first, verb-final, particles, honorifics — whatever {TARGET} actually uses).
- Restructure long source sentences into shorter native-sized ones, or merge choppy ones — whichever sounds natural in {TARGET}.
- Replace source idioms and metaphors with the {TARGET} idioms a native would reach for. NEVER translate an idiom literally.
- Replace source discourse markers with {TARGET} equivalents. Use the marker native speakers actually use in casual/formal speech in {TARGET}, matching register.
- Drop source-language fillers ("um", "uh", "like", "you know") unless {TARGET} has a natural equivalent AND the speaker's hesitation is meaningful.
- Use contractions, particles, sentence-final markers, and colloquial forms {TARGET} speakers use in real speech.

## Preserve what matters
- PRESERVE intent, emotion, attitude, humour, politeness, and register. Excited stays excited. Formal stays formal.
- Keep every fact, name, number, and reference. Do NOT summarise, add, omit, or explain.
- Keep TERMINOLOGY consistent with prior turns shown as conversation history and the speaker profile.
- Resolve references ("she", "that one", "the same idea") using the history.
- If the utterance is ALREADY in {TARGET}, re-voice it lightly for natural spoken flow, not verbatim.
- If the utterance is filler, noise, or non-speech, output an empty response.

## Native prosody through {TARGET} punctuation ONLY
Punctuation is your ONLY prosody channel — the TTS engine reads it as breath, pauses, and intonation. Use the pause/emphasis conventions of {TARGET}, NOT the source's.
- "," and " — " at natural {TARGET} breath points, NOT where the source paused.
- "…" for real hesitation or trailing off.
- "?" and "!" for genuine {TARGET} intonation (some languages carry questions in particles rather than "?" — follow the native convention).
- Place pauses at native breath points (before a new clause, after a topic marker) — NOT mid-phrase because the source had a comma there.
- Write in NATURAL SPOKEN SENTENCES, roughly 12–22 words each, so the buffer flushes at real breath points.

## Output contract
- Output ONE utterance as plain spoken {TARGET} text. Nothing else.
- No markdown, no quotes, no brackets, no labels, no stage directions ("Interpreter:", "[calm]", "(pauses)"), no translator notes.
- Optimise for speech synthesis rather than written text.`;

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export const Route = createFileRoute("/api/interpret")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: z.infer<typeof BodySchema>;
        try {
          body = BodySchema.parse(await request.json());
        } catch (err) {
          return new Response(`Invalid body: ${(err as Error).message}`, { status: 400 });
        }
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const system = SYSTEM_TEMPLATE.replaceAll("{TARGET}", body.targetLanguage);
        const styleCard = NativeStyleLibrary.buildStyleCard(body.targetLanguage);
        const messages: ChatMessage[] = [
          { role: "system", content: system },
          // Concrete native reference for {TARGET}: word order, discourse
          // markers, register examples, idiom swaps, and things to avoid.
          // Kept as a separate system message so it's easy to see, cache, and
          // swap per language without rebuilding the main contract.
          { role: "system", content: styleCard },
        ];
        if (body.speakerProfile && body.speakerProfile.trim()) {
          messages.push({ role: "system", content: body.speakerProfile.trim() });
        }
        if (body.glossary?.length) {
          const lines = body.glossary.map(([a, b]) => `- "${a}" → "${b}"`).join("\n");
          messages.push({
            role: "system",
            content: `Terminology to keep consistent when they appear:\n${lines}`,
          });
        }
        for (const t of body.memory ?? []) {
          messages.push({ role: "user", content: t.source });
          messages.push({ role: "assistant", content: t.interpretation });
        }
        const srcTag = body.sourceLanguage ? `[source: ${body.sourceLanguage}] ` : "";
        messages.push({ role: "user", content: `${srcTag}${body.utterance}` });

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Lovable-API-Key": key,
            "X-Lovable-AIG-SDK": "fetch",
          },
          body: JSON.stringify({
            model: "openai/gpt-5.6-terra",
            input: messages,
            stream: true,
            // Low effort keeps the interpreter FAST — this is a real-time voice
            // pipeline, not a reasoning task. `summary` is required for shape
            // but we do not surface it in the UI.
            reasoning: { effort: "low", summary: "auto" },
          }),
        });

        if (!upstream.ok || !upstream.body) {
          const text = await upstream.text().catch(() => "");
          return new Response(
            `Interpreter upstream ${upstream.status}: ${text.slice(0, 300)}`,
            { status: 502 },
          );
        }

        const encoder = new TextEncoder();
        const decoder = new TextDecoder();

        const stream = new ReadableStream<Uint8Array>({
          async start(controller) {
            const reader = upstream.body!.getReader();
            let raw = "";
            let full = "";
            let sentBuf = "";
            let idleTimer: ReturnType<typeof setTimeout> | null = null;

            // Speech Buffer thresholds — designed so ElevenLabs never speaks
            // a fragment shorter than a complete conversational phrase.
            // ~12–22 words per chunk mirrors natural spoken cadence; the
            // ~1100 ms idle window matches the model's typical inter-sentence
            // pause on the reasoning path.
            const MIN_WORDS = 12;   // never speak a fragment shorter than this
            const SOFT_WORDS = 18;  // preferred natural chunk size at commas
            const HARD_WORDS = 28;  // force flush even without punctuation
            const IDLE_MS = 1100;   // flush tail if model pauses this long

            // Abbreviations that must NOT end a spoken chunk.
            const ABBR = new Set([
              "mr", "mrs", "ms", "dr", "prof", "sr", "jr", "st",
              "vs", "etc", "eg", "ie", "no", "fig", "inc", "ltd", "co",
              "a.m", "p.m", "u.s", "u.k", "e.g", "i.e",
            ]);

            const send = (event: string, data: unknown) => {
              controller.enqueue(
                encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
              );
            };

            const wordCount = (s: string) => (s.trim().match(/\S+/g) ?? []).length;

            const endsWithAbbrev = (s: string): boolean => {
              // Match the token immediately before the terminator.
              const m = s.match(/([A-Za-z][A-Za-z.]{0,5})\.$/);
              if (!m) return false;
              const tok = m[1].toLowerCase().replace(/\.+$/, "");
              if (ABBR.has(tok)) return true;
              // Single-letter initials ("J." in "J. Smith").
              if (tok.length === 1) return true;
              // Numeric like "3." — treat as list marker, not sentence end.
              if (/^\d+$/.test(tok)) return true;
              return false;
            };

            // Try to cut a natural chunk out of sentBuf. Returns the chunk
            // (and mutates sentBuf) or null if nothing is ready yet.
            const takeChunk = (final: boolean): string | null => {
              const buf = sentBuf;
              if (!buf.trim()) return null;

              // 1) Prefer a real sentence terminator that is NOT an abbreviation.
              const termRe = /[\.\!\?…](?:["')\]]*)(\s|$)/g;
              let m: RegExpExecArray | null;
              let bestEnd = -1;
              while ((m = termRe.exec(buf))) {
                const end = m.index + m[0].length;
                const candidate = buf.slice(0, end).trim();
                if (endsWithAbbrev(candidate)) continue;
                if (wordCount(candidate) < MIN_WORDS && !final) continue;
                bestEnd = end;
                break;
              }
              if (bestEnd > 0) {
                const chunk = buf.slice(0, bestEnd).trim();
                sentBuf = buf.slice(bestEnd);
                return chunk;
              }

              // 2) Soft break on a comma/semicolon once we've accumulated
              //    enough context — keeps speech flowing at natural pauses.
              const wc = wordCount(buf);
              if (!final && wc >= SOFT_WORDS) {
                const commaIdx = buf.lastIndexOf(",", buf.length - 1);
                if (commaIdx > 0 && wordCount(buf.slice(0, commaIdx)) >= MIN_WORDS) {
                  const chunk = buf.slice(0, commaIdx + 1).trim();
                  sentBuf = buf.slice(commaIdx + 1);
                  return chunk;
                }
              }

              // 3) Hard cap — force a break at the last space to avoid
              //    slicing a word in half.
              if (!final && wc >= HARD_WORDS) {
                const cut = buf.lastIndexOf(" ");
                if (cut > 0) {
                  const chunk = buf.slice(0, cut).trim();
                  sentBuf = buf.slice(cut + 1);
                  return chunk;
                }
              }

              // 4) Final flush — send whatever is left.
              if (final) {
                const chunk = buf.trim();
                sentBuf = "";
                return chunk || null;
              }
              return null;
            };

            // Prosody Planner — small polish pass tuned for TTS delivery:
            //  - collapse doubled spaces / stray whitespace
            //  - normalise ellipses to a single "…" so they read as ONE
            //    micro-pause instead of three staccato dots
            //  - drop a lone leading conjunction / marker (", and", "— but")
            //    left over from the previous chunk boundary
            //  - ensure the chunk ends on a real breath character so the
            //    audio doesn't cut mid-word.
            const polishForSpeech = (raw: string): string => {
              let t = raw.replace(/\s+/g, " ").trim();
              t = t.replace(/\.{3,}/g, "…").replace(/…\s*…+/g, "…");
              t = t.replace(/^[,—–\-]+\s*/, "");
              t = t.replace(/\s+([,.;:!?…])/gu, "$1");
              // If the chunk has no terminator at all, add a soft one so
              // ElevenLabs gives it a natural breath instead of running on.
              if (!/[.!?…,、。！？।۔]$/u.test(t)) t += ",";
              return t;
            };

            const emitReadyChunks = (final: boolean) => {
              while (true) {
                const chunk = takeChunk(final);
                if (!chunk) break;
                const polished = polishForSpeech(chunk);
                if (polished) send("sentence", { text: polished });
              }
            };

            const armIdleFlush = () => {
              if (idleTimer) clearTimeout(idleTimer);
              idleTimer = setTimeout(() => {
                idleTimer = null;
                // Idle flush behaves like a "final for now" tail — but only
                // if the tail already looks like a real phrase.
                if (wordCount(sentBuf) >= MIN_WORDS) emitReadyChunks(true);
              }, IDLE_MS);
            };

            try {
              while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                raw += decoder.decode(value, { stream: true });

                const events = raw.split("\n\n");
                raw = events.pop() ?? "";
                for (const evt of events) {
                  let name = "message";
                  const dataLines: string[] = [];
                  for (const line of evt.split("\n")) {
                    if (line.startsWith("event:")) name = line.slice(6).trim();
                    else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
                  }
                  if (!dataLines.length) continue;
                  const dataStr = dataLines.join("\n");
                  if (dataStr === "[DONE]") continue;
                  let payload: Record<string, unknown>;
                  try { payload = JSON.parse(dataStr); } catch { continue; }

                  if (name === "response.output_text.delta") {
                    const d = String(payload.delta ?? "");
                    if (!d) continue;
                    full += d;
                    sentBuf += d;
                    emitReadyChunks(false);
                    armIdleFlush();
                  } else if (name === "response.completed") {
                    const resp = (payload as { response?: { output_text?: string } }).response;
                    if (resp?.output_text) full = resp.output_text;
                  } else if (name === "response.failed" || name === "error") {
                    const errObj = (payload as { error?: { message?: string } }).error;
                    send("error", { error: errObj?.message ?? "upstream failure" });
                  }
                }
              }
              if (idleTimer) { clearTimeout(idleTimer); idleTimer = null; }
              emitReadyChunks(true);
              send("done", { text: full });
            } catch (err) {
              send("error", { error: (err as Error).message || "stream error" });
            } finally {
              if (idleTimer) { clearTimeout(idleTimer); idleTimer = null; }
              try { controller.close(); } catch { /* noop */ }
            }
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            "X-Accel-Buffering": "no",
          },
        });
      },
    },
  },
});
