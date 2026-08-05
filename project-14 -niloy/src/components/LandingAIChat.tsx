import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, MessageSquare, Send, X, Bot, CheckCircle2 } from 'lucide-react';

const QUICK_SUGGESTIONS = [
  "How do I start a live session?",
  "How does 20+ language translation work?",
  "How to export notes to Notion/PDF?",
  "Is my voice data private?",
  "Hindi me kaise kaam karega?",
];

export const LandingAIChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string; time: string }[]>([
    {
      role: 'ai',
      text: "👋 Welcome to ClarityStream AI! I am your 24/7 AI Guide. Ask me anything about live recording, real-time translations, automated lecture notes, or university plans!",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { role: 'user' as const, text, time };
    const aiAnswer = getLandingAnswer(text);
    const aiMsg = { role: 'ai' as const, text: aiAnswer, time };

    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setInput('');
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="24/7 AI Guide Chatbot"
          className="fixed right-6 bottom-6 z-50 px-4 py-3 rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white flex items-center gap-2.5 shadow-2xl hover:scale-105 active:scale-95 transition-all border border-white/20"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 animate-pulse text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <span className="text-xs sm:text-sm font-extrabold tracking-tight">24/7 AI Guide Chat</span>
        </button>
      )}

      {/* Chatbot Window Drawer */}
      {isOpen && (
        <div className="fixed right-6 bottom-6 z-50 w-[min(92vw,400px)] h-[560px] bg-slate-900 border border-white/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col backdrop-blur-2xl text-left">
          {/* Header */}
          <div className="p-4 bg-slate-800/80 border-b border-white/10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-black text-white flex items-center gap-1.5">
                  <span>ClarityStream AI Assistant</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className="text-[10px] text-slate-400 font-medium">24/7 Automated Studio Assistant</div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
              aria-label="Close Chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-[88%] px-4 py-3 rounded-2xl leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-br-none shadow-md font-semibold'
                      : 'bg-slate-800 text-slate-100 border border-white/10 rounded-bl-none font-medium'
                  }`}
                >
                  {m.text}
                </div>
                <span className="text-[9px] text-slate-500 mt-1 px-1">{m.time}</span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions & Input */}
          <div className="p-3 bg-slate-950 border-t border-white/10 space-y-2.5">
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {QUICK_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="shrink-0 text-[11px] font-bold px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-200 transition-all active:scale-95"
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
                placeholder="Ask about live recording, translation, notes..."
                className="flex-1 px-3.5 py-2.5 rounded-2xl bg-slate-800 border border-white/15 text-xs text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-orange-500/40"
              />
              <button
                type="submit"
                className="w-10 h-10 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white flex items-center justify-center shrink-0 shadow-md hover:scale-105 active:scale-95 transition-transform"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

function getLandingAnswer(query: string): string {
  const q = query.toLowerCase();

  if (q.includes("record") || q.includes("start") || q.includes("live")) {
    return "🎙️ How Live Recording Works:\nClick 'Get Started' to open the Live Studio. Press 'Start Live Session', allow microphone access, and captions stream in real-time under 50ms latency with 97%+ precision!";
  }

  if (q.includes("translate") || q.includes("translation") || q.includes("language")) {
    return "🌐 Multi-Language Live Translation:\nClarityStream AI supports 20+ languages including Hindi 🇮🇳, Spanish 🇪🇸, French 🇫🇷, German 🇩🇪, Japanese 🇯🇵, and English 🇺🇸 with line-by-line real-time translation.";
  }

  if (q.includes("export") || q.includes("notion") || q.includes("pdf")) {
    return "📥 1-Click Exports:\nExport all live transcripts & AI summaries directly into PDF, Notion page, Markdown, DOCX, or SRT video subtitle format!";
  }

  if (q.includes("secure") || q.includes("private") || q.includes("privacy")) {
    return "🔒 Enterprise Security:\nAll audio streams are encrypted using end-to-end TLS 1.3 with Zero-Retention local processing. We never store raw voice audio or sell user data.";
  }

  if (q.includes("contact") || q.includes("email") || q.includes("support") || q.includes("mail")) {
    return "📬 Direct Contact Information:\nYou can reach our official support & engineering team directly at:\n📧 Email: cricketfan18v.k98742@gmail.com\n⏱️ Response Time: Under 2 hours (24/7 active support).";
  }

  if (q.includes("hindi") || q.includes("kaise")) {
    return "🇮🇳 ClarityStream AI कैसे काम करता है:\nमाइक में बोलें, 97% Accuracy के साथ स्क्रीन पर टेक्स्ट देखें, और 1-Click में Hindi Translation और Notion/PDF Summary प्राप्त करें!\n📧 Support Email: cricketfan18v.k98742@gmail.com";
  }

  return "✨ ClarityStream AI is your real-time speech accessibility assistant for lectures, meetings, and webinars. For direct support, email us at cricketfan18v.k98742@gmail.com!";
}
