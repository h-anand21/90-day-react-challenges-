import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Video,
  Users,
  Zap,
  Sparkles,
  Check,
  Loader2,
  RefreshCw,
  AlertCircle,
  FileText,
  Wand2,
  Languages,
  Mic2,
  FileAudio,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import * as React from "react";
import { AppShell } from "@/components/AppShell";
import { listFirefliesTranscripts } from "@/lib/fireflies.functions";

export const Route = createFileRoute("/fireflies")({
  head: () => ({
    meta: [
      { title: "AI Meeting Integration · AccessAI" },
      { name: "description", content: "Connect Google Meet, Microsoft Teams, Zoom and Fireflies to import meetings, transcripts and recordings automatically." },
      { property: "og:title", content: "AI Meeting Integration · AccessAI" },
      { property: "og:description", content: "Automatically import your meetings, transcripts and recordings into AccessAI." },
    ],
  }),
  component: MeetingsPage,
});

type ServiceKey = "google_meet" | "ms_teams" | "zoom" | "fireflies";

type Service = {
  key: ServiceKey;
  name: string;
  blurb: string;
  Logo: (props: { className?: string }) => React.ReactElement;
};

const SERVICES: Service[] = [
  { key: "google_meet", name: "Google Meet", blurb: "Import Meet recordings and captions.", Logo: GoogleMeetLogo },
  { key: "ms_teams", name: "Microsoft Teams", blurb: "Bring Teams meetings and transcripts in.", Logo: TeamsLogo },
  { key: "zoom", name: "Zoom", blurb: "Sync Zoom cloud recordings automatically.", Logo: ZoomLogo },
  { key: "fireflies", name: "Fireflies.ai", blurb: "Pull in AI notes from your Fireflies notetaker.", Logo: FirefliesLogo },
];

function formatDate(ms: number | null) {
  if (!ms) return "—";
  return new Date(ms).toLocaleString();
}

function MeetingsPage() {
  const safeCall = <T extends (...args: any[]) => any>(fn: T, fallback: T): T => {
    try { return useServerFn(fn) || fallback; } catch { return fallback; }
  };
  const listFn = safeCall(listFirefliesTranscripts, async () => ({ transcripts: [] }));
  const list = useQuery({
    queryKey: ["fireflies", "list"],
    queryFn: () => listFn(),
    retry: false,
  });

  const firefliesConnected = !!list.data && !list.isError;

  const connected: Record<ServiceKey, boolean> = {
    google_meet: false,
    ms_teams: false,
    zoom: false,
    fireflies: firefliesConnected,
  };

  const [prefs, setPrefs] = useState({
    importTranscripts: true,
    importRecordings: true,
    aiSummaries: true,
    detectLanguage: true,
    translate: false,
  });

  const history = useMemo(() => {
    if (!list.data) return [];
    return list.data.items.slice(0, 8).map((t) => ({
      id: t.id,
      title: t.title ?? "Untitled meeting",
      date: t.date,
      source: "Fireflies.ai",
      transcriptReady: true,
      summaryReady: true,
    }));
  }, [list.data]);

  const anyConnected = Object.values(connected).some(Boolean);

  return (
    <AppShell>
      {/* Header */}
      <section className="pt-6 pb-2 float-in">
        <p className="text-sm text-muted-foreground">AI Meeting Integration</p>
        <h1 className="mt-1 text-3xl md:text-5xl font-extrabold tracking-tight">
          Connect your <span className="gradient-text">meeting platforms</span>
        </h1>
        <p className="mt-3 text-muted-foreground max-w-xl">
          Automatically import your meetings, transcripts and recordings into AccessAI.
        </p>
      </section>

      {/* Sync status banner */}
      <section className="mt-6">
        <StatusBanner
          loading={list.isFetching}
          connected={anyConnected}
          error={list.isError ? (list.error as Error)?.message : null}
          lastUpdated={list.dataUpdatedAt}
          onRefresh={() => list.refetch()}
        />
      </section>

      {/* Connected services */}
      <section className="mt-10">
        <div className="flex items-end justify-between">
          <h2 className="text-lg font-semibold">Connected services</h2>
          <span className="text-xs text-muted-foreground">
            {Object.values(connected).filter(Boolean).length} of {SERVICES.length} connected
          </span>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((s, i) => (
            <ServiceCard key={s.key} service={s} connected={connected[s.key]} index={i} />
          ))}
        </div>
      </section>

      {/* Automatic import preferences */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold">Automatic import</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Choose what happens whenever a new meeting arrives.
        </p>
        <div className="mt-4 glass rounded-3xl p-2 sm:p-3">
          <PrefRow
            icon={FileText}
            title="Automatically import meeting transcripts"
            desc="New transcripts show up in your Library as soon as they're ready."
            value={prefs.importTranscripts}
            onChange={(v) => setPrefs((p) => ({ ...p, importTranscripts: v }))}
          />
          <PrefRow
            icon={FileAudio}
            title="Automatically import meeting recordings"
            desc="Audio and video recordings are saved alongside each transcript."
            value={prefs.importRecordings}
            onChange={(v) => setPrefs((p) => ({ ...p, importRecordings: v }))}
          />
          <PrefRow
            icon={Wand2}
            title="Generate AI summaries after import"
            desc="Get a clean overview, key points and action items automatically."
            value={prefs.aiSummaries}
            onChange={(v) => setPrefs((p) => ({ ...p, aiSummaries: v }))}
          />
          <PrefRow
            icon={Mic2}
            title="Detect meeting language automatically"
            desc="Works across every supported language, no setup needed."
            value={prefs.detectLanguage}
            onChange={(v) => setPrefs((p) => ({ ...p, detectLanguage: v }))}
          />
          <PrefRow
            icon={Languages}
            title="Translate transcript to preferred language"
            desc="Read every meeting in the language you're most comfortable with."
            value={prefs.translate}
            onChange={(v) => setPrefs((p) => ({ ...p, translate: v }))}
            last
          />
        </div>
      </section>

      {/* Import history */}
      <section className="mt-10 mb-10">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-lg font-semibold">Import history</h2>
            <p className="text-sm text-muted-foreground mt-1">Your most recently imported meetings.</p>
          </div>
          <LastSync updatedAt={list.dataUpdatedAt} fetching={list.isFetching} />
        </div>

        <div className="mt-4 glass rounded-3xl overflow-hidden">
          {list.isLoading && (
            <div className="p-10 text-center text-sm text-muted-foreground inline-flex items-center gap-2 justify-center w-full">
              <Loader2 className="w-4 h-4 animate-spin" /> Checking for new meetings…
            </div>
          )}
          {!list.isLoading && !firefliesConnected && (
            <EmptyHistory reason="notConnected" />
          )}
          {!list.isLoading && firefliesConnected && history.length === 0 && (
            <EmptyHistory reason="empty" />
          )}
          {history.length > 0 && (
            <ul className="divide-y divide-border/60">
              {history.map((h, i) => (
                <li key={h.id} className="p-4 sm:p-5 flex items-center gap-4 hover:bg-muted/30 transition float-in" style={{ animationDelay: `${i * 40}ms` }}>
                  <div className="w-10 h-10 rounded-xl glass grid place-items-center shadow-sm shrink-0 text-primary">
                    <Video className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{h.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatDate(h.date)} · {h.source}</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                    <Badge tone="success" icon={CheckCircle2}>Transcript ready</Badge>
                    <Badge tone="primary" icon={Sparkles}>Summary ready</Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </AppShell>
  );
}

/* ------------------------------- Bits ------------------------------- */

function StatusBanner({
  loading, connected, error, lastUpdated, onRefresh,
}: {
  loading: boolean; connected: boolean; error: string | null; lastUpdated: number; onRefresh: () => void;
}) {
  let tone: "ok" | "warn" | "wait" | "idle" = "idle";
  let icon = <Check className="w-4 h-4" />;
  let msg = "Ready to connect your first meeting platform.";
  if (loading) { tone = "wait"; icon = <Loader2 className="w-4 h-4 animate-spin" />; msg = "Importing latest meeting…"; }
  else if (error) { tone = "warn"; icon = <AlertCircle className="w-4 h-4" />; msg = "Connection expired — reconnect to keep syncing."; }
  else if (connected) { tone = "ok"; icon = <Check className="w-4 h-4" />; msg = lastUpdated ? "All caught up. Your meetings are syncing automatically." : "Connected successfully."; }

  const toneCls = {
    ok: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
    warn: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
    wait: "bg-primary/10 text-primary",
    idle: "bg-muted text-muted-foreground",
  }[tone];

  return (
    <div className="glass rounded-2xl p-4 flex items-center gap-3">
      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${toneCls}`}>
        {icon} {tone === "ok" ? "Connected" : tone === "warn" ? "Attention" : tone === "wait" ? "Syncing" : "Idle"}
      </span>
      <p className="text-sm text-foreground/90 flex-1 min-w-0 truncate">{msg}</p>
      <button
        onClick={onRefresh}
        disabled={loading}
        className="hidden sm:inline-flex items-center gap-2 text-sm px-3.5 py-2 rounded-full hover:bg-muted disabled:opacity-60"
      >
        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
      </button>
    </div>
  );
}

function ServiceCard({ service, connected, index }: { service: Service; connected: boolean; index: number }) {
  const { Logo, name, blurb } = service;
  return (
    <div className="glass rounded-3xl p-5 hover-lift float-in flex flex-col" style={{ animationDelay: `${index * 60}ms` }}>
      <div className="flex items-center justify-between">
        <Logo className="w-10 h-10" />
        <StatusPill connected={connected} />
      </div>
      <h3 className="mt-4 font-semibold">{name}</h3>
      <p className="text-sm text-muted-foreground mt-1 flex-1">{blurb}</p>
      <div className="mt-4 flex items-center gap-2">
        {connected ? (
          <button className="text-sm px-3.5 py-2 rounded-full bg-muted hover:bg-muted/80 font-medium">
            Disconnect
          </button>
        ) : (
          <button className="text-sm px-3.5 py-2 rounded-full gradient-primary text-white font-medium shadow-sm hover:opacity-95">
            Connect
          </button>
        )}
      </div>
    </div>
  );
}

function StatusPill({ connected }: { connected: boolean }) {
  return connected ? (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Connected
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60" /> Not connected
    </span>
  );
}

function PrefRow({
  icon: Icon, title, desc, value, onChange, last,
}: {
  icon: any; title: string; desc: string; value: boolean; onChange: (v: boolean) => void; last?: boolean;
}) {
  return (
    <label className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer hover:bg-muted/40 transition ${last ? "" : ""}`}>
      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
      </div>
      <Toggle checked={value} onChange={onChange} />
    </label>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={(e) => { e.preventDefault(); onChange(!checked); }}
      className={`relative w-11 h-6 rounded-full transition-colors ${checked ? "gradient-primary" : "bg-muted"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : ""}`}
      />
    </button>
  );
}

function Badge({ tone, icon: Icon, children }: { tone: "success" | "primary"; icon: any; children: React.ReactNode }) {
  const cls = tone === "success"
    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
    : "bg-primary/10 text-primary";
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full ${cls}`}>
      <Icon className="w-3 h-3" /> {children}
    </span>
  );
}

function EmptyHistory({ reason }: { reason: "notConnected" | "empty" }) {
  return (
    <div className="p-10 text-center">
      <div className="mx-auto w-12 h-12 rounded-2xl bg-muted grid place-items-center">
        <CalendarIcon />
      </div>
      <p className="mt-4 font-medium">
        {reason === "notConnected" ? "Connect a service to see your meetings here" : "No meetings imported yet"}
      </p>
      <p className="text-sm text-muted-foreground mt-1">
        {reason === "notConnected"
          ? "Once a platform is connected, new meetings will appear automatically."
          : "New meetings will show up here right after they finish."}
      </p>
    </div>
  );
}

function LastSync({ updatedAt, fetching }: { updatedAt: number; fetching: boolean }) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);
  if (!updatedAt) return <span className="text-xs text-muted-foreground inline-flex items-center gap-1.5"><Clock className="w-3 h-3" /> Not synced yet</span>;
  return (
    <span className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
      <Clock className="w-3 h-3" />
      {fetching ? "Syncing…" : `Last synced ${formatRelative(updatedAt)}`}
    </span>
  );
}

function formatRelative(ts: number) {
  const diff = Math.max(0, Date.now() - ts);
  const s = Math.round(diff / 1000);
  if (s < 10) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  return new Date(ts).toLocaleString();
}

function CalendarIcon() {
  return <Video className="w-4 h-4 text-white" />;
}

/* --------------------------- Service logos --------------------------- */

function GoogleMeetLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`${className} rounded-xl grid place-items-center glass text-emerald-500`}>
      <Video className="w-5 h-5" />
    </div>
  );
}
function TeamsLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`${className} rounded-xl grid place-items-center glass text-indigo-500`}>
      <Users className="w-5 h-5" />
    </div>
  );
}
function ZoomLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`${className} rounded-xl grid place-items-center glass text-sky-500`}>
      <Video className="w-5 h-5" />
    </div>
  );
}
function FirefliesLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`${className} rounded-xl grid place-items-center glass text-amber-500`}>
      <Zap className="w-5 h-5" />
    </div>
  );
}
