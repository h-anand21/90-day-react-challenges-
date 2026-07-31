
create extension if not exists vector;

create table public.transcript_segments (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  seq integer not null,
  speaker text,
  source_language text,
  target_language text,
  source_text text not null,
  translated_text text,
  embedding vector(1536),
  audio_url text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

grant select, insert on public.transcript_segments to anon, authenticated;
grant all on public.transcript_segments to service_role;

alter table public.transcript_segments enable row level security;

create policy "public read transcript_segments"
  on public.transcript_segments for select
  to anon, authenticated
  using (true);

create policy "public insert transcript_segments"
  on public.transcript_segments for insert
  to anon, authenticated
  with check (true);

create index transcript_segments_session_idx
  on public.transcript_segments (session_id, seq);

create index transcript_segments_embedding_idx
  on public.transcript_segments using hnsw (embedding vector_cosine_ops);
