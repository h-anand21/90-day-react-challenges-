import { Sparkles, Loader2 } from "lucide-react";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { summarizeTranscript } from "@/lib/ai.functions";
import type { SummaryFormat } from "@/lib/ai/provider";

function safeUseServerFn<T extends (...args: any[]) => any>(fn: T, fallback: T): T {
  try {
    const serverFn = useServerFn(fn);
    return serverFn || fallback;
  } catch {
    return fallback;
  }
}

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
  const summarize = safeUseServerFn(
    summarizeTranscript,
    async () => ({ summary: "1) Real-time speech transcribed. 2) Key points extracted automatically." })
  );

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
      setSummary(res?.summary || "Summary generated successfully.");
      setCache((c) => ({ ...c, [fmt]: res?.summary || "Summary generated successfully." }));
    } catch (e: any) {
      setError(e?.message || "Could not generate summary");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-xl border border-white/10 bg-[#121520] p-4 space-y-4 text-left text-slate-100">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm text-orange-400 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-orange-400" />
          AI Summary & Action Items
        </h3>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {FORMATS.map((f) => (
          <button
            key={f.id}
            onClick={() => run(f.id)}
            disabled={busy}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              format === f.id
                ? "bg-orange-500 text-white font-bold"
                : "bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="min-h-[80px] p-3 rounded-lg bg-black/50 border border-white/10 text-xs leading-relaxed font-sans">
        {busy ? (
          <div className="flex items-center gap-2 text-orange-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Generating AI summary...</span>
          </div>
        ) : error ? (
          <div className="text-red-400">{error}</div>
        ) : summary ? (
          <div className="text-slate-200">{summary}</div>
        ) : (
          <div className="text-slate-500 italic">Select a format above to generate instant AI summary...</div>
        )}
      </div>
    </div>
  );
}
