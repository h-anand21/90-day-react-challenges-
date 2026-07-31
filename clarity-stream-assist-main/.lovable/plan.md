
## Goal
Wire the requested pipeline end-to-end. Most stages already exist as modular services (`InterpreterService`, Deepgram, `LanguageDetectionService`, Gemini, ElevenLabs, `AudioPlaybackQueue`). The missing pieces are: client-side VAD + denoise before upload, embeddings, persistent storage of segments/embeddings, and a diarization hook using the pyannoteAI key.

## Constraints / decisions
- **Runtime is Cloudflare Workers** — Silero VAD and DeepFilterNet2 cannot run natively on the backend. They belong in the browser:
  - Silero VAD → `@ricky0123/vad-web` (WASM, ONNX).
  - DeepFilterNet2 → `@timephy/df-wasm` / equivalent WASM build; if it fails to bundle for Workers/Vite we fall back to a WebAudio noise-suppression node so the pipeline stage still exists.
- **bge-m3 is not in Lovable AI Gateway's allowlist.** Options:
  1. Substitute `google/gemini-embedding-001` (default Gateway embedder, 3072-d) — zero new secrets, works today.
  2. Call bge-m3 via a third-party inference host (HF/Deepinfra) — needs a new API key from you.
  Plan uses **option 1** unless you say otherwise; the embeddings service is provider-agnostic so bge-m3 can drop in later.
- **pyannoteAI** isn't in the ASCII diagram but the key was provided — I'll add it as a diarization stage that annotates segments with speaker labels (stored on the segment row). Saved as `PYANNOTE_API_KEY` via secrets tool.
- **Lovable Database** = the existing Supabase project. Adds `pgvector` + a `transcript_segments` table.

## Changes

### 1. Client audio front-end (`src/lib/wav-recorder.ts` + new `src/core/AudioFrontend.ts`)
- Mic capture → Silero VAD → only speech frames enter the encoder.
- Speech frames run through DeepFilterNet2 WASM (or WebAudio fallback) before being packaged as WAV chunks for `/api/transcribe`.
- Emits `SpeechStart` / `SpeechEnd` events on `EventBus` so the UI can show a live VAD indicator.

### 2. Diarization (`src/lib/ai/providers/diarization/pyannote.ts` + `src/lib/diarize.functions.ts`)
- Server function posts the captured WAV to pyannoteAI, returns `[{ start, end, speaker }]`.
- `LiveSessionManager` tags each `TranscriptSegment.speaker` from the overlapping window.

### 3. Embeddings (`src/lib/ai/providers/embeddings/gateway.ts` + `src/lib/embeddings.functions.ts`)
- `IEmbeddingsProvider` interface (`embed(text) → number[]`).
- Default impl: Lovable AI Gateway `/v1/embeddings` with `google/gemini-embedding-001`.
- Adapter shape allows swapping to bge-m3 later without touching callers.

### 4. Persistence (new migration)
```sql
create extension if not exists vector;
create table public.transcript_segments (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null,
  seq int not null,
  speaker text,
  source_language text,
  target_language text,
  source_text text not null,
  translated_text text,
  embedding vector(3072),
  audio_url text,
  created_at timestamptz not null default now()
);
grant select, insert on public.transcript_segments to anon, authenticated;
grant all on public.transcript_segments to service_role;
alter table public.transcript_segments enable row level security;
create policy "public read"  on public.transcript_segments for select to anon, authenticated using (true);
create policy "public write" on public.transcript_segments for insert to anon, authenticated with check (true);
create index on public.transcript_segments using ivfflat (embedding vector_cosine_ops);
```
- Public policies match the app's "no auth" stance you set earlier.

### 5. Pipeline wiring (`src/core/LiveSessionManager.ts` + `InterpreterService`)
Order on each finalized segment:
```
VAD-gated audio → Deepgram → LanguageDetectionService
  → Gemini translate → embed(translated) → insert row (segment + embedding + speaker)
  → ElevenLabs synth → AudioPlaybackQueue (streaming)
```
Each stage stays behind its interface; a failure in embeddings/DB never blocks TTS playback.

### 6. Secrets
- Add `PYANNOTE_API_KEY = sk_0cc1b03110c74a58b3f6ceae62ba61f7` via `set_secret`.
- Everything else already present (`DEEPGRAM_API_KEY`, `GOOGLE_API_KEY`, `ELEVENLABS_API_KEY`, `LOVABLE_API_KEY`).

## Out of scope for this pass
- UI panel for semantic search over embeddings (schema will be ready; searching can come next).
- Replacing the `google/gemini-embedding-001` embedder with real bge-m3 (needs a hosting decision from you).

## Questions before I build
1. OK to substitute **`google/gemini-embedding-001`** for bge-m3 (option 1 above), or do you want to provide a HuggingFace/Deepinfra key so I can use the real bge-m3?
2. OK with **public RLS policies** on `transcript_segments` (matches current no-auth app), or should I gate writes/reads to a session id only the client knows?
