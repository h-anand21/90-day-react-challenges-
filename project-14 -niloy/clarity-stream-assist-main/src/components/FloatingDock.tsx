import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Mic, Upload, Library, CalendarDays, Type } from "lucide-react";
import { useApp } from "@/lib/app-store";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/record", label: "Record", icon: Mic },
  { to: "/upload", label: "Upload", icon: Upload },
  { to: "/library", label: "Library", icon: Library },
  { to: "/fireflies", label: "Meetings", icon: CalendarDays },
] as const;


export function FloatingDock() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { setA11yOpen } = useApp();
  return (
    <nav className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40">
      <div className="glass-strong rounded-full px-2 py-2 flex items-center gap-1 shadow-2xl">
        {items.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? path === "/" : path.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              aria-label={label}
              className={`group relative flex items-center gap-2 px-3.5 py-2.5 rounded-full transition-all ${
                active ? "gradient-primary text-white shadow-lg" : "hover:bg-muted text-foreground"
              }`}
            >
              <Icon className="w-[18px] h-[18px]" />
              <span className={`text-xs font-medium ${active ? "inline" : "hidden md:inline"}`}>{label}</span>
            </Link>
          );
        })}
        <span aria-hidden className="mx-1 h-6 w-px bg-border/60" />
        <button
          type="button"
          onClick={() => setA11yOpen(true)}
          aria-label="Text size and accessibility"
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-full hover:bg-muted text-foreground transition-all"
        >
          <Type className="w-[18px] h-[18px]" />
          <span className="text-xs font-medium hidden md:inline">Text</span>
        </button>
      </div>
    </nav>
  );
}
