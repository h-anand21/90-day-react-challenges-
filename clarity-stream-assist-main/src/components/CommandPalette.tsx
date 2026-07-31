import { Command } from "cmdk";
import { useNavigate } from "@tanstack/react-router";
import { Home, Mic, Upload, Library, Moon, Bookmark, Search } from "lucide-react";
import { useApp } from "@/lib/app-store";
import { recordings } from "@/lib/mock-data";
import { useEffect } from "react";

export function CommandPalette() {
  const { commandOpen, setCommandOpen, toggleTheme } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setCommandOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setCommandOpen]);

  if (!commandOpen) return null;
  const go = (to: string) => { setCommandOpen(false); navigate({ to }); };

  return (
    <div className="fixed inset-0 z-50 grid place-items-start pt-24 px-4 bg-foreground/10 backdrop-blur-sm" onClick={() => setCommandOpen(false)}>
      <Command
        className="mx-auto w-full max-w-xl glass-strong rounded-2xl overflow-hidden float-in"
        onClick={(e) => e.stopPropagation()}
        label="Command palette"
      >
        <div className="flex items-center gap-2 px-4 border-b border-border/60">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Command.Input placeholder="Type a command or search…" className="w-full py-4 bg-transparent outline-none text-sm placeholder:text-muted-foreground" />
        </div>
        <Command.List className="max-h-96 overflow-y-auto p-2">
          <Command.Empty className="p-6 text-sm text-muted-foreground text-center">No results.</Command.Empty>
          <Command.Group heading="Actions" className="text-xs text-muted-foreground px-2 py-1">
            <Item icon={<Mic className="w-4 h-4" />} onSelect={() => go("/record")}>Start Live Recording</Item>
            <Item icon={<Upload className="w-4 h-4" />} onSelect={() => go("/upload")}>Upload Recording</Item>
            <Item icon={<Library className="w-4 h-4" />} onSelect={() => go("/library")}>Open Library</Item>
            <Item icon={<Home className="w-4 h-4" />} onSelect={() => go("/")}>Go Home</Item>
            
            <Item icon={<Moon className="w-4 h-4" />} onSelect={() => { toggleTheme(); setCommandOpen(false); }}>Toggle Dark Mode</Item>
          </Command.Group>
          <Command.Group heading="Recordings" className="text-xs text-muted-foreground px-2 py-1 mt-2">
            {recordings.map((r) => (
              <Item key={r.id} icon={<Bookmark className="w-4 h-4" />} onSelect={() => go(`/library/${r.id}`)}>
                {r.title}
              </Item>
            ))}
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}

function Item({ children, icon, onSelect }: { children: React.ReactNode; icon: React.ReactNode; onSelect: () => void }) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm data-[selected=true]:bg-muted"
    >
      <span className="text-muted-foreground">{icon}</span>
      <span>{children}</span>
    </Command.Item>
  );
}
