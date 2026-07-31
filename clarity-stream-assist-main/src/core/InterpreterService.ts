/**
 * InterpreterService — the single facade the UI talks to.
 *
 * Speech-in → speech-out CONVERSATIONAL INTERPRETER (not a translator).
 *
 * When voice mode is ON, this service does NOT run "translate → synthesize".
 * Instead, for every finalized utterance:
 *
 *   1. Duck any currently playing interpretation (barge-in / interruption).
 *   2. Stream the utterance through /api/interpret against a reasoning
 *      LLM with rolling ConversationMemory — the model preserves intent,
 *      emotion, register, references, and terminology across turns.
 *   3. As soon as each sentence-boundary chunk arrives, POST it to
 *      /api/tts-stream (ElevenLabs turbo v2.5, stitched with previous_text)
 *      so speech begins BEFORE generation completes — the listener hears
 *      one continuous interpreter voice rather than a screen reader.
 *   4. On completion, update the transcript with the natural interpretation
 *      and push the turn into ConversationMemory for the next utterance.
 *
 * The text-only transcript path (TranslationCompleted) is unchanged so the
 * on-screen transcript still updates even when voice is off.
 */

import { EventBus } from "./EventBus";
import { Logging } from "./Logging";
import { LiveSessionManager, type LiveSessionOptions } from "./LiveSessionManager";
import { TranscriptStore } from "./TranscriptStore";
import { TranslationMemory } from "./TranslationMemory";
import { TerminologyManager, type TerminologyDomain } from "./TerminologyManager";
import { AudioPlaybackQueue } from "./AudioPlaybackQueue";
import { ConversationMemory } from "./ConversationMemory";
import { SpeakerProfile } from "./SpeakerProfile";
import { TurnManager } from "./TurnManager";
import type { AudienceProfile } from "@/lib/ai/interfaces";
import type { SessionState, TranscriptSegment } from "./types";

export type InterpreterOptions = {
  translateFn: LiveSessionOptions["translateFn"];
  outputLanguage: string;
  audience?: AudienceProfile;
  /** When true, run the conversational interpreter + streaming TTS pipeline. */
  speak?: boolean;
  /**
   * Persist a finalized segment (with its embedding) to Lovable Database.
   * Failures never affect playback or the UI transcript.
   */
  persistFn?: (input: {
    sessionId: string;
    seq: number;
    sourceText: string;
    translatedText?: string;
    sourceLanguage?: string;
    targetLanguage?: string;
    speaker?: string;
  }) => Promise<{ id: string; embedded: boolean }>;
};

class InterpreterServiceImpl {
  private audience: AudienceProfile = "general";
  private speak = false;
  private persistFn: InterpreterOptions["persistFn"];
  private persistSeq = 0;
  /** Segments already sent through the interpreter, to avoid double-firing. */
  private interpreted = new Set<string>();

  configure(opts: Partial<InterpreterOptions>): void {
    if (opts.audience) this.audience = opts.audience;
    if (typeof opts.speak === "boolean") {
      const wasOn = this.speak;
      this.speak = opts.speak;
      if (wasOn && !this.speak) AudioPlaybackQueue.clear();
    }
    if (opts.persistFn) this.persistFn = opts.persistFn;
    LiveSessionManager.configure({
      translateFn: opts.translateFn,
      outputLanguage: opts.outputLanguage,
    });
  }

  getState(): SessionState { return LiveSessionManager.getState(); }
  subscribe(fn: (s: SessionState) => void): () => void { return LiveSessionManager.subscribe(fn); }
  setOutputLanguage(lang: string): void { LiveSessionManager.setOutputLanguage(lang); }

  setAudience(profile: AudienceProfile): void { this.audience = profile; }
  getAudience(): AudienceProfile { return this.audience; }

  enableTerminologyDomain(d: TerminologyDomain): void { TerminologyManager.enableDomain(d); }
  loadEnterpriseTerms(terms: Iterable<string>): void { TerminologyManager.loadEnterpriseDictionary(terms); }
  addUserTerm(term: string): void { TranslationMemory.addUserTerm(term); }

  async start(): Promise<void> {
    ConversationMemory.clear();
    SpeakerProfile.reset();
    this.turnManager.reset();
    this.interpreted.clear();
    return LiveSessionManager.start();
  }
  async pause(): Promise<void> { return LiveSessionManager.pause(); }
  async resume(): Promise<void> { return LiveSessionManager.resume(); }
  async stop(): Promise<void> {
    this.turnManager.flushNow();
    await LiveSessionManager.stop();
    AudioPlaybackQueue.clear();
    ConversationMemory.clear();
    SpeakerProfile.reset();
    this.interpreted.clear();
  }

  onPlaybackStarted = AudioPlaybackQueue.onStarted.bind(AudioPlaybackQueue);
  onPlaybackEnded = AudioPlaybackQueue.onEnded.bind(AudioPlaybackQueue);

  private turnManager = new TurnManager({
    onTurn: ({ text, lastSegment }) => {
      // Interpret the COALESCED turn, but attribute the spoken output to the
      // last transcript segment so the on-screen highlight/scroll aligns
      // with the most recent transcript row.
      const composite: TranscriptSegment = {
        ...lastSegment,
        originalText: text,
      };
      void this.interpretAndSpeak(composite);
    },
  });

  constructor() {
    // Route every finalized utterance through the TurnManager. It coalesces
    // rapid fragments into ONE conversational turn before interpretation
    // fires — a real interpreter doesn't re-voice every sub-clause.
    EventBus.on("TranscriptUpdated", ({ segment }) => {
      if (!this.speak) return;
      if (segment.status !== "final" && segment.status !== "translated") return;
      if (this.interpreted.has(segment.id)) return;
      const text = segment.originalText?.trim();
      if (!text || text.length < 2 || text === "…") return;
      this.interpreted.add(segment.id);
      this.turnManager.push(segment);
    });
  }

  /**
   * Stream one utterance through the interpreter and ElevenLabs.
   *
   * TTS requests fire in parallel with generation but are enqueued to the
   * playback queue IN ORDER via a promise chain, so overlapping fetches
   * don't produce out-of-order speech.
   */
  private async interpretAndSpeak(seg: TranscriptSegment): Promise<void> {
    const state = LiveSessionManager.getState();
    const target = state.outputLanguage;
    if (!target || target === "off") return;

    const memory = ConversationMemory.recent(target, 8);
    let full = "";
    let prevSpokenText = "";
    // Serialize enqueueing so audio plays in the model's sentence order even
    // when TTS fetches complete out of order.
    let ttsChain: Promise<void> = Promise.resolve();

    const speakSentence = (sentence: string, previousText: string) => {
      const pending = (async () => {
        const r = await fetch("/api/tts-stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: sentence,
            previousText: previousText || undefined,
            language: target,
          }),
        });
        if (!r.ok) throw new Error(`tts ${r.status}`);
        return r.blob();
      })().catch((err) => {
        Logging.warn("interpreter", "tts_failed", { err: (err as Error).message });
        return null;
      });

      ttsChain = ttsChain.then(async () => {
        // If speak was turned off, or a newer utterance ducked, abandon.
        if (!this.speak) return;
        if (!this.interpreted.has(seg.id)) return;
        const blob = await pending;
        if (!blob || !this.speak) return;
        AudioPlaybackQueue.enqueue({
          segmentId: seg.id,
          blob,
          text: sentence,
          language: target,
        });
      });
    };

    // Observe the incoming utterance BEFORE the request so the profile card
    // reflects the current turn's register/terminology as well.
    SpeakerProfile.observe({
      source: seg.originalText,
      sourceLanguage: seg.language || state.inputLanguage || undefined,
      targetLanguage: target,
      wordCount: (seg.originalText.trim().match(/\S+/g) ?? []).length,
      at: Date.now(),
    });
    const speakerProfile = SpeakerProfile.toPromptCard();

    let res: Response;
    try {
      res = await fetch("/api/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          utterance: seg.originalText,
          sourceLanguage: seg.language || state.inputLanguage || undefined,
          targetLanguage: target,
          memory,
          speakerProfile: speakerProfile || undefined,
        }),
      });
    } catch (err) {
      Logging.warn("interpreter", "interpret_fetch_failed", { err: (err as Error).message });
      return;
    }
    if (!res.ok || !res.body) {
      const t = await res.text().catch(() => "");
      Logging.warn("interpreter", "interpret_upstream", { status: res.status, body: t.slice(0, 200) });
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let raw = "";

    const processEvents = () => {
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
        let payload: Record<string, unknown>;
        try { payload = JSON.parse(dataLines.join("\n")); } catch { continue; }

        if (name === "sentence") {
          const s = String(payload.text ?? "").trim();
          if (!s) continue;
          const prev = prevSpokenText;
          prevSpokenText = s;
          if (this.speak) speakSentence(s, prev);
        } else if (name === "done") {
          const t = String(payload.text ?? "").trim();
          if (t) full = t;
        } else if (name === "error") {
          Logging.warn("interpreter", "sse_error", { error: String(payload.error ?? "") });
        }
      }
    };

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        raw += decoder.decode(value, { stream: true });
        processEvents();
        // User toggled voice off mid-stream — stop consuming.
        if (!this.speak) { try { await reader.cancel(); } catch { /* noop */ } break; }
      }
      processEvents();
    } catch (err) {
      Logging.warn("interpreter", "interpret_stream_failed", { err: (err as Error).message });
    }

    // Wait for the last TTS clip to be enqueued so the transcript update
    // and persistence reflect what was actually spoken.
    await ttsChain;

    if (full) {
      TranscriptStore.updateSegment(seg.id, {
        translatedText: full,
        status: "translated",
      });
      ConversationMemory.push({
        source: seg.originalText,
        interpretation: full,
        sourceLanguage: seg.language || state.inputLanguage || undefined,
        targetLanguage: target,
        at: Date.now(),
      });
      EventBus.emit("TranslationCompleted", {
        segmentId: seg.id,
        target,
        text: full,
        latencyMs: 0,
      });
    }

    if (this.persistFn && full) {
      const sessionId = LiveSessionManager.getState().sessionId;
      if (sessionId) {
        const seq = ++this.persistSeq;
        this.persistFn({
          sessionId,
          seq,
          sourceText: seg.originalText,
          translatedText: full,
          sourceLanguage: seg.language || state.inputLanguage || undefined,
          targetLanguage: target,
          speaker: seg.speaker,
        }).catch((err) => {
          Logging.warn("interpreter", "persist_failed", {
            segmentId: seg.id, err: (err as Error).message,
          });
        });
      }
    }
  }

  /** Direct one-shot interpretation of an already-transcribed segment. */
  interpretSegment(seg: TranscriptSegment): void {
    LiveSessionManager.configure({ outputLanguage: LiveSessionManager.getState().outputLanguage });
    TranscriptStore.appendSegment(seg);
  }
}

export const InterpreterService = new InterpreterServiceImpl();
