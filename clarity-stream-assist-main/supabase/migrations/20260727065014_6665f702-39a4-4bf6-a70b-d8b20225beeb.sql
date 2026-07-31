DROP POLICY IF EXISTS "public insert transcript_segments" ON public.transcript_segments;

CREATE POLICY "public insert transcript_segments"
ON public.transcript_segments
FOR INSERT
WITH CHECK (
  session_id IS NOT NULL
  AND length(session_id) BETWEEN 1 AND 120
  AND seq >= 0
  AND source_text IS NOT NULL
  AND length(source_text) BETWEEN 1 AND 8000
  AND (translated_text IS NULL OR length(translated_text) <= 8000)
  AND (speaker IS NULL OR length(speaker) <= 80)
  AND (source_language IS NULL OR length(source_language) <= 60)
  AND (target_language IS NULL OR length(target_language) <= 60)
);