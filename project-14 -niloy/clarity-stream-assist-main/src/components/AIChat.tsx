import { MessageSquare, Send, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/lib/app-store";

const suggestions = ["Explain this topic", "Summarize", "Generate quiz", "Generate flashcards", "Translate"];

export function AIChatFab() {
  const { setChatOpen, chatOpen } = useApp();
  if (chatOpen) return null;
  return (
    <button
      onClick={() => setChatOpen(true)}
      aria-label="AI assistant"
      className="fixed right-5 bottom-24 md:bottom-5 z-30 h-12 pl-3 pr-4 rounded-full gradient-primary text-white grid grid-flow-col items-center gap-2 shadow-xl hover:scale-105 transition"
    >
      <Sparkles className="w-4 h-4" />
      <span className="text-sm font-medium">Ask AI</span>
    </button>
  );
}

export function AIChat() {
  const { chatOpen, setChatOpen } = useApp();
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "Hi! I can answer questions from your recordings. Ask me anything." },
  ]);
  const [input, setInput] = useState("");
  if (!chatOpen) return null;

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: "user", text }, { role: "ai", text: mockAnswer(text) }]);
    setInput("");
  };

  return (
    <div className="fixed right-4 bottom-24 md:bottom-20 z-40 w-[min(96vw,380px)] h-[520px] glass-strong rounded-3xl overflow-hidden flex flex-col float-in">
      <div className="p-4 flex items-center gap-2 border-b border-border/60">
        <div className="w-8 h-8 rounded-xl gradient-primary grid place-items-center">
          <MessageSquare className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold">AccessAI Assistant</div>
          <div className="text-[10px] text-muted-foreground">Answers grounded in your transcripts</div>
        </div>
        <button onClick={() => setChatOpen(false)} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm ${
              m.role === "user" ? "gradient-primary text-white rounded-br-md" : "bg-muted rounded-bl-md"
            }`}>{m.text}</div>
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-border/60 space-y-2">
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {suggestions.map((s) => (
            <button key={s} onClick={() => send(s)} className="shrink-0 text-[11px] px-2.5 py-1 rounded-full bg-muted hover:bg-accent transition">
              {s}
            </button>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your transcript…"
            className="flex-1 px-3 py-2 rounded-xl bg-muted outline-none text-sm"
          />
          <button type="submit" className="w-9 h-9 rounded-xl gradient-primary text-white grid place-items-center">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

function mockAnswer(q: string) {
  const lower = q.toLowerCase();
  if (lower.includes("summar")) return "Here's a quick summary: the lecture focused on backpropagation, the chain rule for gradient computation, and the practical benefits of ReLU activations.";
  if (lower.includes("quiz")) return "Quiz: 1) What problem does ReLU mitigate? 2) Which rule powers backpropagation? 3) Name one common loss function.";
  if (lower.includes("flashcard")) return "Flashcard 1 — Front: Backpropagation. Back: Algorithm that computes gradients layer-by-layer using the chain rule.";
  if (lower.includes("translate")) return "Sure — pick a target language in the Translation tab of any recording and I'll re-render the transcript instantly.";
  return "Based on your transcript, the key idea is that gradients flow backward through the network via the chain rule, and activation choice affects how well those gradients propagate.";
}
