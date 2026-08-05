import { Accessibility, X, Eye, Type, BookOpen, Volume2, Captions, Keyboard, Palette } from "lucide-react";
import { useApp } from "@/lib/app-store";

export function AccessibilityFab() {
  const { setA11yOpen } = useApp();
  return (
    <button
      onClick={() => setA11yOpen(true)}
      aria-label="Accessibility options"
      className="fixed left-5 bottom-24 md:bottom-5 z-30 w-12 h-12 rounded-full glass-strong grid place-items-center hover:scale-105 transition shadow-lg"
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
    <div className="fixed inset-0 z-[100] flex" onClick={() => setA11yOpen(false)}>
      {/* Dark backdrop blur covering the whole screen */}
      <div className="flex-1 bg-black/70 backdrop-blur-md transition-opacity" />
      
      {/* Opaque side drawer eliminating any text bleed-through */}
      <aside
        className="w-full max-w-sm bg-card border-l border-border h-full p-6 overflow-y-auto shadow-2xl relative z-10 text-card-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
          <div>
            <h2 className="text-lg font-extrabold text-foreground">Accessibility</h2>
            <p className="text-xs text-muted-foreground">Tailor ClarityStream AI to your needs</p>
          </div>
          <button
            onClick={() => setA11yOpen(false)}
            className="p-2 rounded-xl bg-muted/60 hover:bg-muted text-foreground transition"
            aria-label="Close panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mb-4 p-4 rounded-2xl bg-muted/40 border border-border">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-9 h-9 rounded-xl bg-primary/10 grid place-items-center text-primary">
              <Type className="w-4 h-4" />
            </span>
            <div className="flex-1">
              <div className="text-sm font-bold text-foreground">Text Size</div>
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
                  className={`rounded-xl border transition py-2.5 flex flex-col items-center gap-0.5 ${
                    active
                      ? "gradient-primary text-white border-transparent shadow-lg"
                      : "bg-card border-border hover:bg-muted text-foreground"
                  }`}
                >
                  <span className={`${s.key === "small" ? "text-xs" : s.key === "medium" ? "text-sm" : "text-base"} font-extrabold`}>
                    {s.sample}
                  </span>
                  <span className="text-[11px] opacity-90 font-medium">{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.label}
              className="p-3.5 rounded-2xl bg-muted/40 border border-border flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-card border border-border grid place-items-center text-primary">
                  {item.icon}
                </span>
                <span className="text-xs font-bold text-foreground">{item.label}</span>
              </div>

              {item.hint ? (
                <span className="text-[11px] text-muted-foreground font-medium">{item.hint}</span>
              ) : (
                <button
                  onClick={item.toggle}
                  aria-pressed={item.on}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    item.on ? "bg-primary" : "bg-muted-foreground/30"
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      item.on ? "translate-x-5" : ""
                    }`}
                  />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 rounded-2xl bg-primary/5 border border-primary/20 text-xs text-muted-foreground leading-relaxed">
          Voice commands coming soon — speak &ldquo;start recording&rdquo; to control ClarityStream AI hands-free.
        </div>
      </aside>
    </div>
  );
}
