/**
 * AudioPlaybackQueue — ordered, non-overlapping playback of synthesized audio
 * with full player controls (pause / resume / skip / replay / mute / volume /
 * rate). Non-blocking: audio playback never stalls the transcription pipeline.
 */

import { EventBus } from "./EventBus";
import { Logging } from "./Logging";

export type PlaybackItem = {
  segmentId: string;
  blob?: Blob;
  inline?: boolean;
  url?: string;
  /** Optional text — surfaced to the UI player so it can show what's spoken. */
  text?: string;
  /** Optional language tag — for the player badge. */
  language?: string;
};

export type PlayerState = {
  status: "idle" | "playing" | "paused";
  currentSegmentId: string | null;
  currentText: string | null;
  currentLanguage: string | null;
  progress: number;   // 0..1 within current clip
  duration: number;   // seconds
  currentTime: number;
  volume: number;     // 0..1
  muted: boolean;
  rate: number;       // 0.5..2
  queueLength: number;
  historyLength: number;
};

type ItemListener = (item: PlaybackItem) => void;
type StateListener = (s: PlayerState) => void;

class AudioPlaybackQueueImpl {
  private queue: PlaybackItem[] = [];
  private history: PlaybackItem[] = [];
  private current: PlaybackItem | null = null;
  private audio: HTMLAudioElement | null = null;
  private playing = false;

  private volume = 1;
  private muted = false;
  private rate = 1;
  private paused = false;
  private duckTimer: ReturnType<typeof setInterval> | null = null;


  private state: PlayerState = this.snapshot();

  private startedListeners = new Set<ItemListener>();
  private endedListeners = new Set<ItemListener>();
  private stateListeners = new Set<StateListener>();

  get currentSegmentId(): string | null { return this.current?.segmentId ?? null; }
  getState(): PlayerState { return { ...this.state }; }

  enqueue(item: PlaybackItem): void {
    this.queue.push(item);
    this.emitState();
    void this.pump();
  }

  clear(): void {
    this.queue = [];
    if (this.audio) { try { this.audio.pause(); } catch { /* noop */ } }
    this.audio = null;
    this.current = null;
    this.paused = false;
    this.playing = false;
    this.emitState();
  }

  pause(): void {
    if (!this.audio) { this.paused = true; this.emitState(); return; }
    try { this.audio.pause(); } catch { /* noop */ }
    this.paused = true;
    this.emitState();
  }

  resume(): void {
    this.paused = false;
    if (this.audio) { void this.audio.play().catch(() => {}); }
    else void this.pump();
    this.emitState();
  }

  skip(): void {
    if (this.audio) { try { this.audio.pause(); } catch { /* noop */ } }
    this.audio = null;
    // pump() will move on and finish the current item's promise via onended path;
    // but we manually resolve by resetting state.
    this.emitState();
  }

  /**
   * Duck for interruption: drain the pending queue, ramp current clip volume
   * to 0 over `finishMs`, then stop. Feels like a polite interpreter pausing
   * as soon as the speaker resumes talking, without an abrupt cutoff.
   */
  duck(finishMs: number = 300): void {
    // Drop everything queued behind the current clip.
    this.queue = [];
    const el = this.audio;
    if (!el) { this.emitState(); return; }
    if (this.duckTimer) { clearInterval(this.duckTimer); this.duckTimer = null; }
    const startVol = el.volume;
    const steps = 8;
    let i = 0;
    this.duckTimer = setInterval(() => {
      i++;
      const v = Math.max(0, startVol * (1 - i / steps));
      try { el.volume = v; } catch { /* noop */ }
      if (i >= steps) {
        if (this.duckTimer) { clearInterval(this.duckTimer); this.duckTimer = null; }
        try { el.pause(); } catch { /* noop */ }
        try { el.volume = this.volume; } catch { /* noop */ } // restore for next clip
        this.audio = null;
        this.current = null;
        this.emitState();
      }
    }, Math.max(20, Math.floor(finishMs / steps)));
  }

  /** Whether audio is currently rendering (used for interruption gating). */
  get isActive(): boolean { return this.current !== null || this.queue.length > 0; }

  replayPrevious(): void {

    const prev = this.history[this.history.length - 1];
    if (!prev) return;
    // Put back at the front, do not duplicate in history.
    this.queue.unshift(prev);
    this.history.pop();
    this.emitState();
    void this.pump();
  }

  setVolume(v: number): void {
    this.volume = Math.max(0, Math.min(1, v));
    if (this.audio) this.audio.volume = this.volume;
    this.emitState();
  }
  setMuted(m: boolean): void {
    this.muted = m;
    if (this.audio) this.audio.muted = m;
    this.emitState();
  }
  toggleMute(): void { this.setMuted(!this.muted); }
  setRate(r: number): void {
    this.rate = Math.max(0.5, Math.min(2, r));
    if (this.audio) this.audio.playbackRate = this.rate;
    this.emitState();
  }

  onStarted(fn: ItemListener): () => void { this.startedListeners.add(fn); return () => this.startedListeners.delete(fn); }
  onEnded(fn: ItemListener): () => void { this.endedListeners.add(fn); return () => this.endedListeners.delete(fn); }
  onState(fn: StateListener): () => void { this.stateListeners.add(fn); fn(this.getState()); return () => this.stateListeners.delete(fn); }

  private async pump(): Promise<void> {
    if (this.playing) return;
    this.playing = true;
    try {
      while (this.queue.length) {
        if (this.paused) {
          await new Promise<void>((r) => setTimeout(r, 120));
          continue;
        }
        const item = this.queue.shift()!;
        this.current = item;
        this.emit(this.startedListeners, item);
        this.emitState();
        try {
          if (!item.inline) await this.playOne(item);
        } catch (err) {
          Logging.warn("playback", "item_failed", {
            segmentId: item.segmentId, err: (err as Error)?.message,
          });
        }
        this.history.push(item);
        if (this.history.length > 20) this.history.shift();
        this.emit(this.endedListeners, item);
        this.current = null;
        this.emitState();
      }
    } finally {
      this.playing = false;
      this.current = null;
      this.emitState();
    }
  }

  private playOne(item: PlaybackItem): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (typeof window === "undefined") return resolve();
      const url = item.url || (item.blob ? URL.createObjectURL(item.blob) : "");
      if (!url) return resolve();
      const el = new Audio(url);
      const targetVol = this.volume;
      // Start silent, ramp up over ~90ms so consecutive chunks don't start
      // with an abrupt "click". Mirrors a natural breath into the next phrase.
      el.volume = 0;
      el.muted = this.muted;
      el.playbackRate = this.rate;
      this.audio = el;
      let fadeInTimer: ReturnType<typeof setInterval> | null = null;
      let fadeOutTimer: ReturnType<typeof setInterval> | null = null;
      const clearFades = () => {
        if (fadeInTimer) { clearInterval(fadeInTimer); fadeInTimer = null; }
        if (fadeOutTimer) { clearInterval(fadeOutTimer); fadeOutTimer = null; }
      };
      const cleanup = () => {
        clearFades();
        el.onended = null; el.onerror = null; el.ontimeupdate = null; el.onloadedmetadata = null;
        if (item.blob) { try { URL.revokeObjectURL(url); } catch { /* noop */ } }
      };
      el.onloadedmetadata = () => this.emitState();
      el.ontimeupdate = () => {
        this.emitState();
        // Fade out in the last ~150ms — but only if there's another clip
        // queued, so a final phrase still ends on its natural amplitude.
        const dur = el.duration || 0;
        if (
          !fadeOutTimer &&
          dur > 0.4 &&
          this.queue.length > 0 &&
          dur - el.currentTime <= 0.15
        ) {
          const start = el.volume;
          const steps = 4;
          let i = 0;
          fadeOutTimer = setInterval(() => {
            i++;
            try { el.volume = Math.max(0, start * (1 - i / steps)); } catch { /* noop */ }
            if (i >= steps) { if (fadeOutTimer) { clearInterval(fadeOutTimer); fadeOutTimer = null; } }
          }, 40);
        }
      };
      el.onended = () => { cleanup(); resolve(); };
      el.onerror = () => { cleanup(); reject(new Error("audio playback error")); };
      el.play().then(() => {
        // Ramp volume up from 0 → targetVol over 90ms.
        const steps = 6;
        let i = 0;
        fadeInTimer = setInterval(() => {
          i++;
          try { el.volume = Math.min(targetVol, targetVol * (i / steps)); } catch { /* noop */ }
          if (i >= steps) { if (fadeInTimer) { clearInterval(fadeInTimer); fadeInTimer = null; } }
        }, 15);
      }).catch((err) => { cleanup(); reject(err); });
    });
  }

  private snapshot(): PlayerState {
    return {
      status: this.paused ? "paused" : (this.current ? "playing" : "idle"),
      currentSegmentId: this.current?.segmentId ?? null,
      currentText: this.current?.text ?? null,
      currentLanguage: this.current?.language ?? null,
      progress: this.audio && this.audio.duration ? (this.audio.currentTime / this.audio.duration) : 0,
      duration: this.audio?.duration || 0,
      currentTime: this.audio?.currentTime || 0,
      volume: this.volume,
      muted: this.muted,
      rate: this.rate,
      queueLength: this.queue.length,
      historyLength: this.history.length,
    };
  }

  private emitState(): void {
    this.state = this.snapshot();
    for (const l of this.stateListeners) { try { l(this.state); } catch { /* noop */ } }
  }

  private emit(set: Set<ItemListener>, item: PlaybackItem): void {
    for (const fn of set) { try { fn(item); } catch { /* noop */ } }
    EventBus.emit("Log", {
      level: "debug", scope: "playback",
      event: set === this.startedListeners ? "started" : "ended",
      data: { segmentId: item.segmentId }, at: Date.now(),
    });
  }
}

export const AudioPlaybackQueue = new AudioPlaybackQueueImpl();
