// Rolling WAV recorder using the Web Audio API.
// Emits self-contained 16-bit mono WAV blobs every `segmentMs` milliseconds.
// Using PCM/WAV (not WebM/Opus) is required by the Lovable AI STT models —
// Opus chunks are commonly rejected or hallucinated into gibberish.

const TARGET_SAMPLE_RATE = 16000;

function floatTo16BitPCM(input: Float32Array): Int16Array {
  const out = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return out;
}

function downsample(buffer: Float32Array, from: number, to: number): Float32Array {
  if (to === from) return buffer;
  const ratio = from / to;
  const newLen = Math.round(buffer.length / ratio);
  const result = new Float32Array(newLen);
  let offsetResult = 0;
  let offsetBuffer = 0;
  while (offsetResult < newLen) {
    const nextOffsetBuffer = Math.round((offsetResult + 1) * ratio);
    let accum = 0, count = 0;
    for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
      accum += buffer[i]; count++;
    }
    result[offsetResult] = count > 0 ? accum / count : 0;
    offsetResult++;
    offsetBuffer = nextOffsetBuffer;
  }
  return result;
}

function encodeWav(samples: Int16Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeStr = (o: number, s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i)); };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, samples.length * 2, true);
  const out = new Uint8Array(buffer);
  const pcm = new Uint8Array(samples.buffer);
  out.set(pcm, 44);
  return new Blob([out], { type: "audio/wav" });
}

export type WavRecorder = {
  stop: () => Promise<void>;
};

export async function startWavRecorder(opts: {
  segmentMs: number;
  onSegment: (blob: Blob) => void;
}): Promise<WavRecorder> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 },
  });
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  const ctx: AudioContext = new AudioCtx();
  const source = ctx.createMediaStreamSource(stream);
  // ScriptProcessor is deprecated but universally supported and adequate for STT.
  const node = ctx.createScriptProcessor(4096, 1, 1);
  let buffer: Float32Array[] = [];
  let stopped = false;

  node.onaudioprocess = (e) => {
    if (stopped) return;
    const ch = e.inputBuffer.getChannelData(0);
    buffer.push(new Float32Array(ch));
  };
  source.connect(node);
  node.connect(ctx.destination);

  const flush = () => {
    if (!buffer.length) return;
    const total = buffer.reduce((n, b) => n + b.length, 0);
    const merged = new Float32Array(total);
    let off = 0;
    for (const b of buffer) { merged.set(b, off); off += b.length; }
    buffer = [];
    const down = downsample(merged, ctx.sampleRate, TARGET_SAMPLE_RATE);
    // Skip near-silent segments (avoids model hallucination on empty audio).
    let peak = 0;
    for (let i = 0; i < down.length; i++) { const a = Math.abs(down[i]); if (a > peak) peak = a; }
    if (peak < 0.01) return;
    const pcm = floatTo16BitPCM(down);
    const wav = encodeWav(pcm, TARGET_SAMPLE_RATE);
    if (wav.size > 2048) opts.onSegment(wav);
  };

  const interval = setInterval(flush, opts.segmentMs);

  return {
    stop: async () => {
      stopped = true;
      clearInterval(interval);
      flush();
      try { node.disconnect(); } catch { /* noop */ }
      try { source.disconnect(); } catch { /* noop */ }
      stream.getTracks().forEach((t) => t.stop());
      try { await ctx.close(); } catch { /* noop */ }
    },
  };
}
