import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Bookmark, Clock, Copy, Download, Languages, Search, Share2 } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { recordings, languages, type Recording } from "@/lib/mock-data";

export const Route = createFileRoute("/library/$id")({
  head: ({ params }) => {
    const r = recordings.find((x) => x.id === params.id);
    return {
      meta: [
        { title: `${r?.title ?? "Recording"} · AccessAI` },
        { name: "description", content: r?.summary?.slice(0, 155) ?? "AccessAI recording details." },
        { property: "og:title", content: `${r?.title ?? "Recording"} · AccessAI` },
        { property: "og:description", content: r?.summary?.slice(0, 155) ?? "AccessAI recording details." },
      ],
    };
  },
  loader: ({ params }) => {
    const r = recordings.find((x) => x.id === params.id);
    if (!r) throw notFound();
    return r;
  },
  component: RecordingDetail,
});

const tabs = ["Transcript", "Summary", "Translation", "AI Chat", "Bookmarks", "Keywords", "Export"] as const;
type Tab = (typeof tabs)[number];

function RecordingDetail() {
  const r = Route.useLoaderData() as Recording;
  const [tab, setTab] = useState<Tab>("Transcript");
  const [lang, setLang] = useState("English");

  return (
    <AppShell>
      <Link to="/library" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground pt-2"><ArrowLeft className="w-4 h-4" /> Library</Link>

      <div className="mt-4 glass rounded-3xl p-6 float-in">
        <div className="flex flex-col md:flex-row md:items-start gap-4">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{r.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{r.duration}</span>
              <span className="inline-flex items-center gap-1"><Languages className="w-3.5 h-3.5" />{r.language}</span>
              <span>{r.date}</span>
              <span className="px-2 py-0.5 rounded-full bg-success/15 text-success">Processed</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="glass px-3 py-2 rounded-xl text-xs inline-flex items-center gap-1.5"><Share2 className="w-3.5 h-3.5" /> Share</button>
            <button className="gradient-primary text-white px-3 py-2 rounded-xl text-xs inline-flex items-center gap-1.5"><Download className="w-3.5 h-3.5" /> Export</button>
          </div>
        </div>

        <div className="mt-5 flex gap-1.5 overflow-x-auto pb-2">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`shrink-0 text-sm px-3.5 py-1.5 rounded-full transition ${tab === t ? "gradient-primary text-white shadow" : "bg-muted hover:bg-accent"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        {tab === "Transcript" && (
          <div className="glass rounded-3xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="glass rounded-full flex items-center gap-2 px-3 py-1.5 flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 text-muted-foreground" />
                <input placeholder="Search this transcript…" className="bg-transparent outline-none text-sm w-full" />
              </div>
            </div>
            <div className="space-y-4">
              {r.transcript.map((l, i) => (
                <div key={i} className="flex gap-3 group">
                  <div className="shrink-0 w-9 h-9 rounded-full gradient-primary text-white text-[11px] grid place-items-center font-semibold">
                    {l.speaker.split(" ").map((s) => s[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1">
                    <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                      <span className="font-medium text-foreground">{l.speaker}</span>
                      <span>·</span>
                      <span>{l.time}</span>
                      <span className="ml-1 px-1.5 py-0.5 rounded-md bg-success/10 text-success">{Math.round(l.confidence * 100)}%</span>
                      <div className="ml-auto opacity-0 group-hover:opacity-100 transition flex gap-1">
                        <button className="p-1 rounded-md hover:bg-muted" aria-label="Copy"><Copy className="w-3 h-3" /></button>
                        <button className="p-1 rounded-md hover:bg-muted" aria-label="Bookmark"><Bookmark className="w-3 h-3" /></button>
                      </div>
                    </div>
                    <p className="mt-1 text-[15px] leading-relaxed">{l.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "Summary" && (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="glass rounded-3xl p-5">
              <h3 className="font-semibold mb-2">Quick Summary</h3>
              <p className="text-sm leading-relaxed">{r.summary}</p>
            </div>
            <div className="glass rounded-3xl p-5">
              <h3 className="font-semibold mb-2">Bullet Points</h3>
              <ul className="text-sm space-y-2">
                {r.bullets.map((b) => (
                  <li key={b} className="flex gap-2"><span className="mt-1.5 w-1.5 h-1.5 rounded-full gradient-primary shrink-0" />{b}</li>
                ))}
              </ul>
            </div>
            <div className="glass rounded-3xl p-5 md:col-span-2">
              <h3 className="font-semibold mb-2">Action Items</h3>
              <div className="space-y-2 text-sm">
                {r.actions.map((a) => (
                  <label key={a} className="flex items-start gap-2.5">
                    <input type="checkbox" className="mt-1 accent-[oklch(0.6_0.19_275)]" />
                    <span>{a}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "Translation" && (
          <div className="glass rounded-3xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Languages className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Translate to</span>
              <select value={lang} onChange={(e) => setLang(e.target.value)} className="ml-2 px-3 py-1.5 rounded-full bg-muted text-sm outline-none">
                {languages.map((l) => <option key={l}>{l}</option>)}
              </select>
              <span className="ml-auto text-[11px] text-muted-foreground">Instant translation</span>
            </div>
            <div className="space-y-3">
              {r.transcript.map((l, i) => (
                <div key={i} className="text-sm">
                  <span className="text-muted-foreground text-[11px] mr-2">{l.time} · {l.speaker}</span>
                  <span>{translateMock(l.text, lang)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "AI Chat" && (
          <div className="glass rounded-3xl p-5 text-sm text-muted-foreground">
            Open the <b className="text-foreground">Ask AI</b> button in the bottom-right to chat about this recording.
          </div>
        )}

        {tab === "Bookmarks" && (
          <div className="glass rounded-3xl p-5">
            {r.bookmarks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No bookmarks yet — hover any transcript line and click the bookmark icon.</p>
            ) : (
              <ul className="divide-y divide-border/50">
                {r.bookmarks.map((b) => (
                  <li key={b.time} className="py-3 flex items-center gap-3">
                    <span className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary tabular-nums">{b.time}</span>
                    <span className="text-sm">{b.label}</span>
                    <button className="ml-auto text-xs text-primary">Jump →</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {tab === "Keywords" && (
          <div className="glass rounded-3xl p-5">
            <div className="flex flex-wrap gap-2">
              {r.keywords.map((k) => (
                <span key={k} className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm">#{k}</span>
              ))}
            </div>
          </div>
        )}

        {tab === "Export" && (
          <div className="grid md:grid-cols-2 gap-3">
            {["PDF", "DOCX", "TXT", "Markdown", "Share Link"].map((f) => (
              <button key={f} className="glass rounded-2xl p-4 flex items-center gap-3 hover-lift text-left">
                <div className="w-10 h-10 rounded-xl gradient-primary grid place-items-center"><Download className="w-4 h-4 text-white" /></div>
                <div>
                  <div className="font-medium text-sm">Export as {f}</div>
                  <div className="text-[11px] text-muted-foreground">Includes transcript, summary, bookmarks</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function translateMock(t: string, lang: string) {
  if (lang === "English") return t;
  const tag = { Spanish: "[es]", French: "[fr]", German: "[de]", Japanese: "[ja]", Hindi: "[hi]" }[lang] ?? `[${lang.slice(0, 2).toLowerCase()}]`;
  return `${tag} ${t}`;
}
