import type { ISummaryProvider, SummaryFormat } from "../../interfaces";
import { callGatewayChat } from "../text-gateway";

const STYLES: Record<SummaryFormat, string> = {
  quick: "Write a concise 2–3 sentence summary capturing the essence.",
  detailed: "Write a thorough multi-paragraph summary covering context, key discussion, and conclusions.",
  bullets: "Return 5–8 crisp bullet points. Start each line with '- '.",
  concepts: "List the 5–8 most important concepts as '**Concept** — short explanation.' one per line.",
  minutes:
    "Write formal meeting minutes with sections: Attendees (unknown), Agenda, Discussion, Decisions, Next Steps.",
  actions:
    "Extract action items only. Return a numbered list. Each item: 'Owner (or Team) — action — due (if mentioned).' If none, say 'No explicit action items.'",
};

export class GeminiSummaryProvider implements ISummaryProvider {
  readonly name = "gemini";
  private model = "google/gemini-2.5-flash";

  isAvailable(): boolean {
    return !!process.env.LOVABLE_API_KEY || !!process.env.GOOGLE_API_KEY;
  }

  async summarize({ transcript, format, targetLanguage }: {
    transcript: string;
    format: SummaryFormat;
    targetLanguage: string;
  }): Promise<string> {
    const sys = `You are a professional meeting/lecture summarizer. ${STYLES[format]} Respond in ${targetLanguage}. Use clean markdown. Do not invent facts not in the transcript.`;
    return callGatewayChat({
      model: this.model,
      messages: [
        { role: "system", content: sys },
        { role: "user", content: transcript.slice(0, 20000) },
      ],
    });
  }

  generateMeetingMinutes(transcript: string, targetLanguage = "English") {
    return this.summarize({ transcript, format: "minutes", targetLanguage });
  }
  extractActionItems(transcript: string, targetLanguage = "English") {
    return this.summarize({ transcript, format: "actions", targetLanguage });
  }
  generateKeyConcepts(transcript: string, targetLanguage = "English") {
    return this.summarize({ transcript, format: "concepts", targetLanguage });
  }
}
