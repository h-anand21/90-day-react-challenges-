import type { ChatMessage, IChatProvider } from "../../interfaces";
import { callGatewayChat } from "../text-gateway";

export class OpenAIChatProvider implements IChatProvider {
  readonly name = "openai";
  private model = "openai/gpt-5-mini";

  isAvailable(): boolean {
    return !!process.env.LOVABLE_API_KEY || !!process.env.OPENAI_API_KEY;
  }

  async askQuestion({ question, context, history }: {
    question: string;
    context?: string;
    history?: ChatMessage[];
  }): Promise<string> {
    const messages: ChatMessage[] = [
      { role: "system", content: "You are AccessAI's assistant. Be concise. Ground answers in provided transcript when available." },
      ...(context ? [{ role: "user" as const, content: `Transcript:\n${context.slice(0, 12000)}` }] : []),
      ...(history ?? []),
      { role: "user", content: question },
    ];
    return callGatewayChat({ model: this.model, messages });
  }

  async searchTranscript({ query, transcript }: { query: string; transcript: string }): Promise<string> {
    return callGatewayChat({
      model: this.model,
      messages: [
        { role: "system", content: "Return up to 5 relevant excerpts. Each on its own line prefixed with '> '." },
        { role: "user", content: `Query: ${query}\n\nTranscript:\n${transcript.slice(0, 16000)}` },
      ],
    });
  }
}
