import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

type RecorderState = "idle" | "recording" | "paused";
type Theme = "light" | "dark";
export type TextSize = "small" | "medium" | "large";

type A11ySettings = {
  highContrast: boolean;
  largeText: boolean;
  dyslexia: boolean;
  captions: boolean;
  readAloud: boolean;
};

type AppCtx = {
  theme: Theme;
  toggleTheme: () => void;
  recorder: {
    state: RecorderState;
    seconds: number;
    start: () => void;
    pause: () => void;
    resume: () => void;
    stop: () => void;
  };
  commandOpen: boolean;
  setCommandOpen: (b: boolean) => void;
  a11yOpen: boolean;
  setA11yOpen: (b: boolean) => void;
  chatOpen: boolean;
  setChatOpen: (b: boolean) => void;
  a11y: A11ySettings;
  setA11y: (patch: Partial<A11ySettings>) => void;
  language: string;
  setLanguage: (l: string) => void;
  textSize: TextSize;
  setTextSize: (s: TextSize) => void;
  hydrated: boolean;
};

const Ctx = createContext<AppCtx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [state, setState] = useState<RecorderState>("idle");
  const [seconds, setSeconds] = useState(0);
  const [commandOpen, setCommandOpen] = useState(false);
  const [a11yOpen, setA11yOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [a11y, setA11yState] = useState<A11ySettings>({
    highContrast: false, largeText: false, dyslexia: false, captions: false, readAloud: false,
  });
  const [language, setLanguage] = useState<string>("English");
  const [textSize, setTextSizeState] = useState<TextSize>("medium");
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
    try {
      const saved = localStorage.getItem("accessai:textSize") as TextSize | null;
      if (saved === "small" || saved === "medium" || saved === "large") setTextSizeState(saved);
    } catch {}
  }, []);
  const setTextSize = (s: TextSize) => {
    setTextSizeState(s);
    try { localStorage.setItem("accessai:textSize", s); } catch {}
  };
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.classList.toggle("high-contrast", a11y.highContrast);
    root.classList.toggle("large-text", a11y.largeText);
    root.classList.toggle("dyslexia", a11y.dyslexia);
    root.classList.remove("text-size-small", "text-size-medium", "text-size-large");
    root.classList.add(`text-size-${textSize}`);
  }, [theme, a11y, textSize]);

  useEffect(() => {
    if (state === "recording") {
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const value = useMemo<AppCtx>(() => ({
    theme,
    toggleTheme: () => setTheme((t) => (t === "light" ? "dark" : "light")),
    recorder: {
      state,
      seconds,
      start: () => { setSeconds(0); setState("recording"); },
      pause: () => setState("paused"),
      resume: () => setState("recording"),
      stop: () => { setState("idle"); setSeconds(0); },
    },
    commandOpen, setCommandOpen,
    a11yOpen, setA11yOpen,
    chatOpen, setChatOpen,
    a11y,
    setA11y: (patch) => setA11yState((s) => ({ ...s, ...patch })),
    language, setLanguage,
    textSize, setTextSize,
    hydrated,
  }), [theme, state, seconds, commandOpen, a11yOpen, chatOpen, a11y, language, textSize, hydrated]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const c = useContext(Ctx);
  if (!c) throw new Error("AppProvider missing");
  return c;
}

export function formatTime(secs: number) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}
