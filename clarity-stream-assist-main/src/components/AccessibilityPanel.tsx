import { Accessibility, X, Eye, Type, BookOpen, Volume2, Captions, Keyboard, Palette } from "lucide-react";
import { useApp } from "@/lib/app-store";

export function AccessibilityFab() {
  const { setA11yOpen } = useApp();
  return (
    <button
      onClick={() => setA11yOpen(true)}
      aria-label="Accessibility options"
      className="fixed left-5 bottom-24 md:bottom-5 z-30 w-12 h-12 rounded-full glass-strong grid place-items-center hover:scale-105 transition"
    >
      <Accessibility className="w-5 h-5 text-primary" />
    </button>
  );
}

export function AccessibilityPanel() {
  const { a11yOpen, setA11yOpen, a11y, setA11y, theme, toggleTheme, textSize, setTextSize } = useApp();
  if (!a11yOpen) return null;

  const items: { label: string; icon: React.ReactNode; on: boolean; toggle: () => void; hint?: string }[] = [
    { label: "Dark Mode", icon: <Palette className="w-4 h-4" />, on: theme === "dark", toggle: toggleTheme },
    { label: "High Contrast", icon: <Eye className="w-4 h-4" />, on: a11y.highContrast, toggle: () => setA11y({ highContrast: !a11y.highContrast }) },
    { label: "Dyslexia Font", icon: <BookOpen className="w-4 h-4" />, on: a11y.dyslexia, toggle: () => setA11y({ dyslexia: !a11y.dyslexia }) },
    { label: "Caption Mode", icon: <Captions className="w-4 h-4" />, on: a11y.captions, toggle: () => setA11y({ captions: !a11y.captions }) },
    { label: "Read Aloud", icon: <Volume2 className="w-4 h-4" />, on: a11y.readAloud, toggle: () => setA11y({ readAloud: !a11y.readAloud }) },
    { label: "Keyboard Navigation", icon: <Keyboard className="w-4 h-4" />, on: true, toggle: () => {}, hint: "Always on" },
  ];

  const sizes: { key: "small" | "medium" | "large"; label: string; sample: string }[] = [
    { key: "small", label: "Small", sample: "Aa" },
    { key: "medium", label: "Medium", sample: "Aa" },
    { key: "large", label: "Large", sample: "Aa" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex" onClick={() => setA11yOpen(false)}>
      <div className="flex-1 bg-foreground/10 backdrop-blur-sm" />
      <aside className="w-full max-w-sm glass-strong h-full p-6 overflow-y-auto float-in" onClick={(e) => e.stopPropagation()} style={{ animationDuration: "0.3s" }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold">Accessibility</h2>
            <p className="text-xs text-muted-foreground">Tailor AccessAI to your needs</p>
          </div>
          <button onClick={() => setA11yOpen(false)} className="p-2 rounded-xl hover:bg-muted"><X className="w-4 h-4" /></button>
        </div>

        <div className="mb-4 p-4 rounded-2xl bg-card/60 border border-border/60">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-9 h-9 rounded-xl bg-muted grid place-items-center text-primary"><Type className="w-4 h-4" /></span>
            <div className="flex-1">
              <div className="text-sm font-medium">Text Size</div>
              <div className="text-[11px] text-muted-foreground">Applies across the app</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {sizes.map((s) => {
              const active = textSize === s.key;
              return (
                <button
                  key={s.key}
                  onClick={() => setTextSize(s.key)}
                  aria-pressed={active}
                  className={`rounded-xl border transition py-2.5 flex flex-col items-center gap-0.5 ${active ? "gradient-primary text-white border-transparent shadow" : "bg-card/60 border-border/60 hover:bg-card"}`}
                >
                  <span className={`${s.key === "small" ? "text-xs" : s.key === "medium" ? "text-sm" : "text-base"} font-semibold`}>{s.sample}</span>
                  <span className="text-[11px] opacity-80">{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">

          {items.map((i) => (
            <button
              key={i.label}
              onClick={i.toggle}
              className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-card/60 hover:bg-card transition border border-border/60"
            >
              <span className="w-9 h-9 rounded-xl bg-muted grid place-items-center text-primary">{i.icon}</span>
              <span className="flex-1 text-left">
                <span className="block text-sm font-medium">{i.label}</span>
                {i.hint && <span className="block text-[11px] text-muted-foreground">{i.hint}</span>}
              </span>
              <span className={`w-10 h-6 rounded-full transition ${i.on ? "gradient-primary" : "bg-muted"} relative`}>
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition ${i.on ? "left-[18px]" : "left-0.5"}`} />
              </span>
            </button>
          ))}
        </div>
        <div className="mt-6 p-4 rounded-2xl bg-primary/5 border border-primary/20">
          <p className="text-xs text-muted-foreground">Voice commands coming soon — speak "start recording" to control AccessAI hands-free.</p>
        </div>
      </aside>
    </div>
  );
}
