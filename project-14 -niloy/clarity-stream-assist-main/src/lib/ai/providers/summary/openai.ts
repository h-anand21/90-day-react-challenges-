import type { ISummaryProvider, SummaryFormat } from "../../interfaces";
import { callGatewayChat } from "../text-gateway";

const STYLES: Record<SummaryFormat, string> = {
  quick: "Concise 2–3 sentence summary.",
  detailed: "Thorough multi-paragraph summary: context, discussion, conclusions.",
  bullets: "Return 5–8 bullets starting with '- '.",
  concepts: "5–8 concepts as '**Concept** — explanation.'",
  minutes: "Formal minutes: Attendees, Agenda, Discussion, Decisions, Next Steps.",
  actions: "Numbered action items: 'Owner — action — due'. If none, say so.",
};

export class OpenAISummaryProvider implements ISummaryProvider {
  readonly name = "openai";
  private model = "openai/gpt-5-mini";

  isAvailable(): boolean {
    return !!process.env.LOVABLE_API_KEY || !!process.env.OPENAI_API_KEY;
  }

  async summarize({ transcript, format, targetLanguage }: {
    transcript: string;
    format: SummaryFormat;
    targetLanguage: string;
  }): Promise<string> {
    const sys = `Professional summarizer. ${STYLES[format]} Respond in ${targetLanguage}. Clean markdown. No hallucination.`;
    return callGatewayChat({
      model: this.model,
      messages: [
        { role: "system", content: sys },
        { role: "user", content: transcript.slice(0, 20000) },
      ],
    });
  }
  generateMeetingMinutes(t: string, l = "English") { return this.summarize({ transcript: t, format: "minutes", targetLanguage: l }); }
  extractActionItems(t: string, l = "English") { return this.summarize({ transcript: t, format: "actions", targetLanguage: l }); }
  generateKeyConcepts(t: string, l = "English") { return this.summarize({ transcript: t, format: "concepts", targetLanguage: l }); }
}
