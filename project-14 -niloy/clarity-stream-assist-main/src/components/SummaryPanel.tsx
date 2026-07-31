import { Sparkles, Loader2 } from "lucide-react";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { summarizeTranscript } from "@/lib/ai.functions";
import type { SummaryFormat } from "@/lib/ai/provider";

const FORMATS: { id: SummaryFormat; label: string }[] = [
  { id: "quick", label: "Quick Summary" },
  { id: "detailed", label: "Detailed Summary" },
  { id: "bullets", label: "Bullet Points" },
  { id: "concepts", label: "Key Concepts" },
  { id: "minutes", label: "Meeting Minutes" },
  { id: "actions", label: "Action Items" },
];

export function SummaryPanel({
  transcript,
  targetLanguage,
}: {
  transcript: string;
  targetLanguage: string;
}) {
  const summarize = useServerFn(summarizeTranscript);
  const [format, setFormat] = useState<SummaryFormat>("quick");
  const [busy, setBusy] = useState(false);
  const [summary, setSummary] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [cache, setCache] = useState<Partial<Record<SummaryFormat, string>>>({});

  const run = async (fmt: SummaryFormat) => {
    setFormat(fmt);
    setError(null);
    if (cache[fmt]) { setSummary(cache[fmt]!); return; }
    setBusy(true);
    setSummary("");
    try {
      const res = await summarize({ data: { transcript, format: fmt, targetLanguage } });
      setSummary(res.summary);
      setCache((c) => ({ ...c, [fmt]: res.summary }));
    } catch (e: any) {
      setError(e?.message ?? "Failed to summarize");
    } finally {
      setBusy(false);
    }
  };

  const started = busy || summary || error;

  return (
    <div className="glass rounded-3xl p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-9 h-9 shrink-0 rounded-xl glass grid place-items-center shadow-sm">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-sm sm:text-base truncate">AI Summary</h3>
            <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
              {started ? `Format: ${FORMATS.find((f) => f.id === format)?.label}` : "Ready to Summarize…"}
            </p>
          </div>
        </div>
        {!started && (
          <button
            onClick={() => run("quick")}
            className="px-4 py-2 rounded-full gradient-primary text-white text-xs sm:text-sm font-medium inline-flex items-center gap-2 shadow shrink-0"
          >
            <Sparkles className="w-4 h-4" /> Summarize with AI
          </button>
        )}
      </div>

      {started && (
        <>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {FORMATS.map((f) => (
              <button
                key={f.id}
                onClick={() => run(f.id)}
                disabled={busy}
                className={`text-[11px] px-3 py-1.5 rounded-full border transition ${
                  format === f.id
                    ? "gradient-primary text-white border-transparent shadow"
                    : "bg-muted/50 hover:bg-muted border-border/60"
                } disabled:opacity-60`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="mt-4 min-h-[80px] text-sm sm:text-base leading-relaxed whitespace-pre-wrap text-pretty break-words">
            {busy && (
              <div className="flex items-center gap-2 text-muted-foreground italic">
                <Loader2 className="w-4 h-4 animate-spin" /> Generating summary in {targetLanguage}…
              </div>
            )}
            {!busy && error && <div className="text-destructive text-sm">{error}</div>}
            {!busy && !error && summary && <div>{summary}</div>}
          </div>
        </>
      )}
    </div>
  );
}
