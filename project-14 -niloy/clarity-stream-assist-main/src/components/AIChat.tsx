import { MessageSquare, Send, Sparkles, X, Bot, CheckCircle2, Zap } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useApp } from "@/lib/app-store";

const QUICK_SUGGESTIONS = [
  "How do I record live audio?",
  "How does live translation work?",
  "How to export notes to PDF/Notion?",
  "Is my voice data private and secure?",
  "Hindi me kaise kaam karega?",
  "Accessibility features kya hain?",
];

export function AIChatFab() {
  const { setChatOpen, chatOpen } = useApp();
  if (chatOpen) return null;

  return (
    <button
      onClick={() => setChatOpen(true)}
      aria-label="24/7 AI Assistant Guide"
      className="fixed right-5 bottom-24 md:bottom-6 z-40 px-4 py-3 rounded-full gradient-primary text-white flex items-center gap-2.5 shadow-2xl hover:scale-105 active:scale-95 transition-all border border-white/20"
    >
      <div className="relative">
        <Sparkles className="w-5 h-5 animate-pulse text-white" />
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
      </div>
      <span className="text-xs sm:text-sm font-extrabold tracking-tight">24/7 AI Guide</span>
    </button>
  );
}

export function AIChat() {
  const { chatOpen, setChatOpen } = useApp();
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string; time: string }[]>([
    {
      role: "ai",
      text: "👋 Namaste! I am your 24/7 ClarityStream AI Guide. Ask me anything about how live recording, real-time translation, AI summaries, exports, or accessibility features work!",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (chatOpen) scrollToBottom();
  }, [messages, chatOpen]);

  if (!chatOpen) return null;

  const handleSend = (userText: string) => {
    if (!userText.trim()) return;
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg = { role: "user" as const, text: userText, time };
    const aiAnswer = getClarityStreamAIAnswer(userText);
    const aiMsg = { role: "ai" as const, text: aiAnswer, time };

    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setInput("");
  };

  return (
    <div className="fixed right-4 bottom-24 md:bottom-6 z-[100] w-[min(94vw,400px)] h-[560px] bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col backdrop-blur-2xl text-left">
      {/* Chat Header */}
      <div className="p-4 bg-muted/60 border-b border-border flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl gradient-primary text-white flex items-center justify-center shadow-md">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-black text-foreground flex items-center gap-1.5">
              <span>ClarityStream AI Guide</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="text-[10px] text-muted-foreground font-medium">24/7 Live Automated Assistant</div>
          </div>
        </div>

        <button
          onClick={() => setChatOpen(false)}
          className="p-2 rounded-xl bg-muted/80 hover:bg-muted text-foreground transition"
          aria-label="Close AI Chat"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
            <div
              className={`max-w-[88%] px-4 py-3 rounded-2xl leading-relaxed ${
                m.role === "user"
                  ? "gradient-primary text-white rounded-br-none shadow-md font-semibold"
                  : "bg-muted/80 text-foreground border border-border/60 rounded-bl-none font-medium"
              }`}
            >
              {m.text}
            </div>
            <span className="text-[9px] text-muted-foreground mt-1 px-1">{m.time}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestion Pills & Input Form */}
      <div className="p-3 bg-muted/40 border-t border-border space-y-2.5">
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {QUICK_SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => handleSend(s)}
              className="shrink-0 text-[11px] font-bold px-3 py-1.5 rounded-full bg-card hover:bg-muted border border-border text-foreground transition-all shadow-sm active:scale-95"
            >
              {s}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="flex items-center gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about ClarityStream AI…"
            className="flex-1 px-3.5 py-2.5 rounded-2xl bg-card border border-border text-xs text-foreground placeholder-muted-foreground outline-none focus:ring-2 focus:ring-primary/40"
          />
          <button
            type="submit"
            className="w-10 h-10 rounded-2xl gradient-primary text-white flex items-center justify-center shrink-0 shadow-md hover:scale-105 active:scale-95 transition-transform"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

function getClarityStreamAIAnswer(query: string): string {
  const q = query.toLowerCase();

  if (q.includes("record") || q.includes("recording") || q.includes("start")) {
    return "🎙️ How Live Recording Works:\n1. Click the orange 'Start Live Session' button on the homepage or top bar.\n2. Allow microphone access when prompted by your browser.\n3. Speak naturally into your mic — live transcripts appear in real-time under 50ms latency with 97%+ precision!";
  }

  if (q.includes("translate") || q.includes("translation") || q.includes("hindi")) {
    return "🌐 How Live Translation Works:\nSelect your target language from the 'Output Language' dropdown (Hindi 🇮🇳, Spanish 🇪🇸, French 🇫🇷, German 🇩🇪, Japanese 🇯🇵, etc.). Spoken audio is translated line-by-line in real-time!";
  }

  if (q.includes("summary") || q.includes("notes") || q.includes("action") || q.includes("summarize")) {
    return "📝 How AI Notes & Summaries Work:\nInside the AI Summary panel, click any of the 6 format pills: Quick Summary, Detailed Summary, Bullet Points, Key Concepts, Meeting Minutes, or Action Items. The GPT-4o engine compiles structured notes in 2 seconds!";
  }

  if (q.includes("export") || q.includes("notion") || q.includes("pdf") || q.includes("save")) {
    return "📥 How Export Works:\nGo to 'Open My Library', click on any saved session, and select 'Export'. You can download transcripts & AI notes as PDF, Notion page, Markdown, DOCX, or SRT subtitle files!";
  }

  if (q.includes("secure") || q.includes("privacy") || q.includes("private") || q.includes("data")) {
    return "🔒 Security & Privacy:\nYour audio stream is protected using end-to-end TLS 1.3 encryption and Zero-Retention local processing. We never store raw voice audio or sell user data!";
  }

  if (q.includes("access") || q.includes("font") || q.includes("contrast") || q.includes("dyslexia")) {
    return "♿ Accessibility Options:\nClick the 'Text' icon in the floating dock or sidebar to customize text sizes (Small, Medium, Large), toggle High Contrast mode, enable Dyslexia-friendly fonts, or turn on Caption Mode!";
  }

  if (q.includes("contact") || q.includes("email") || q.includes("support") || q.includes("mail")) {
    return "📬 Direct Contact Details:\nYou can email our official support & engineering team directly at:\n📧 Email: cricketfan18v.k98742@gmail.com\n⏱️ Response Time: Under 2 hours (24/7 active support).";
  }

  if (q.includes("kaise") || q.includes("kya") || q.includes("hindi")) {
    return "🇮🇳 ClarityStream AI कैसे काम करता है:\n1. 'Start Live Session' दबाएं और माइक में बोलें।\n2. स्क्रीन पर 97% Accuracy के साथ Hindi/English टेक्स्ट लाइव दिखेगा।\n3. 'Output Language' में हिंदी चुनकर लाइव अनुवाद पाएं और 1-Click में PDF/Notion में नोट्स सेव करें!\n📧 Support Email: cricketfan18v.k98742@gmail.com";
  }

  return "✨ ClarityStream AI is your real-time speech assistant! You can record live lectures, translate speech into 20+ languages, generate automated meeting notes, and export directly to PDF or Notion. For direct support, email us at cricketfan18v.k98742@gmail.com!";
}
