import { createFileRoute, Link, Outlet, useMatches } from "@tanstack/react-router";
import { Clock, Languages, Play, Search } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { recordings } from "@/lib/mock-data";
import { useState } from "react";

export const Route = createFileRoute("/library")({
  head: () => ({
    meta: [
      { title: "Library · AccessAI" },
      { name: "description", content: "Browse your recorded lectures, meetings and seminars with transcripts, summaries and bookmarks." },
      { property: "og:title", content: "Library · AccessAI" },
      { property: "og:description", content: "All your recordings, transcripts and AI summaries in one place." },
    ],
  }),
  component: LibraryLayout,
});

function LibraryLayout() {
  const matches = useMatches();
  const isChild = matches.some((m) => m.routeId === "/library/$id");
  if (isChild) return <Outlet />;
  return <LibraryIndex />;
}

function LibraryIndex() {
  const [q, setQ] = useState("");
  const items = recordings.filter((r) =>
    r.title.toLowerCase().includes(q.toLowerCase()) ||
    r.keywords.some((k) => k.toLowerCase().includes(q.toLowerCase())),
  );
  return (
    <AppShell>
      <div className="pt-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Your <span className="gradient-text">Library</span></h1>
          <p className="text-muted-foreground text-sm mt-1">{recordings.length} recordings · fully searchable</p>
        </div>
        <div className="glass rounded-full flex items-center gap-2 px-4 py-2.5 md:w-80">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title or keyword…" className="bg-transparent outline-none text-sm w-full" />
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((r, i) => (
          <Link
            key={r.id}
            to="/library/$id"
            params={{ id: r.id }}
            className="glass rounded-3xl p-5 hover-lift float-in block"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl glass grid place-items-center shadow-sm"><Play className="w-4 h-4 text-primary fill-primary" /></div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold leading-snug truncate">{r.title}</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">{r.date}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {r.duration}</span>
              <span className="inline-flex items-center gap-1"><Languages className="w-3 h-3" /> {r.language}</span>
              <span className="ml-auto px-2 py-0.5 rounded-full bg-success/15 text-success">Processed</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {r.keywords.slice(0, 4).map((k) => (
                <span key={k} className="text-[10px] px-2 py-0.5 rounded-full bg-muted">{k}</span>
              ))}
            </div>
          </Link>
        ))}
        {items.length === 0 && (
          <div className="col-span-full glass rounded-3xl p-10 text-center text-sm text-muted-foreground">
            No recordings match "{q}".
          </div>
        )}
      </div>
    </AppShell>
  );
}
