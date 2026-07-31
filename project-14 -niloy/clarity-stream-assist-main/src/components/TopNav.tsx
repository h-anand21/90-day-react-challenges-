import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, Moon, Search, Sun, Sparkles, Globe, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useApp } from "@/lib/app-store";
import { languages } from "@/lib/mock-data";

export function TopNav() {
  const { theme, toggleTheme, setCommandOpen, language, setLanguage } = useApp();
  const navigate = useNavigate();
  const [langOpen, setLangOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const langRef = useRef<HTMLDivElement | null>(null);
  const notifRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (langRef.current && !langRef.current.contains(t)) setLangOpen(false);
      if (notifRef.current && !notifRef.current.contains(t)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <header className="sticky top-0 z-40 px-4 pt-4">
      <div className="mx-auto max-w-7xl glass rounded-2xl px-4 py-3 flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl gradient-primary grid place-items-center shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="hidden sm:block leading-tight">
            <div className="font-bold text-[15px]">AccessAI</div>
            <div className="text-[10px] text-muted-foreground -mt-0.5">Real-time accessibility</div>
          </div>
        </Link>

        <button
          onClick={() => setCommandOpen(true)}
          className="flex-1 max-w-xl mx-auto flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/60 hover:bg-muted transition text-sm text-muted-foreground"
        >
          <Search className="w-4 h-4" />
          <span className="truncate">Search transcripts, bookmarks, commands…</span>
          <span className="ml-auto hidden sm:inline text-[10px] px-1.5 py-0.5 rounded-md bg-background/70 border border-border">⌘K</span>
        </button>

        <div className="flex items-center gap-1.5">
          {/* Language */}
          <div className="relative" ref={langRef}>
            <button
              aria-label="Change language"
              onClick={() => { setLangOpen((v) => !v); setNotifOpen(false); }}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-2 rounded-xl hover:bg-muted transition text-xs font-medium"
            >
              <Globe className="w-4 h-4" />
              <span>{language}</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>
            {langOpen && (
              <div className="absolute right-0 mt-2 w-52 max-h-80 overflow-auto glass rounded-2xl p-1.5 shadow-xl z-50">
                {languages.map((l) => (
                  <button
                    key={l}
                    onClick={() => { setLanguage(l); setLangOpen(false); }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm hover:bg-muted transition ${language === l ? "bg-primary/10 text-primary font-medium" : ""}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              aria-label="Notifications"
              onClick={() => { setNotifOpen((v) => !v); setLangOpen(false); }}
              className="p-2 rounded-xl hover:bg-muted transition relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
            </button>
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-72 glass rounded-2xl p-3 shadow-xl z-50">
                <div className="text-xs font-semibold text-muted-foreground px-1 mb-2">Notifications</div>
                <div className="space-y-1.5">
                  <div className="p-2.5 rounded-xl hover:bg-muted/60 transition">
                    <div className="text-sm font-medium">Session ready</div>
                    <div className="text-[11px] text-muted-foreground">Your lecture transcript is processed.</div>
                  </div>
                  <div className="p-2.5 rounded-xl hover:bg-muted/60 transition">
                    <div className="text-sm font-medium">Weekly summary</div>
                    <div className="text-[11px] text-muted-foreground">3 recordings · 2h 14m · 12 bookmarks.</div>
                  </div>
                </div>
                <button
                  onClick={() => { setNotifOpen(false); navigate({ to: "/settings" }); }}
                  className="mt-2 w-full text-center text-xs text-primary hover:underline py-1.5"
                >
                  Manage notifications
                </button>
              </div>
            )}
          </div>

          {/* Theme */}
          <button aria-label="Toggle theme" onClick={toggleTheme} className="p-2 rounded-xl hover:bg-muted transition">
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <Link
            to="/settings"
            aria-label="Settings"
            className="hidden sm:inline-flex items-center gap-1.5 gradient-primary text-white px-3.5 py-2 rounded-full text-xs font-semibold shadow hover:opacity-95"
          >
            <Sparkles className="w-3.5 h-3.5" /> Settings
          </Link>
        </div>
      </div>
    </header>
  );
}
