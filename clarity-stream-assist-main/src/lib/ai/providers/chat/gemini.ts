import type { ChatMessage, IChatProvider } from "../../interfaces";
import { callGatewayChat } from "../text-gateway";

export class GeminiChatProvider implements IChatProvider {
  readonly name = "gemini";
  private model = "google/gemini-2.5-flash";

  isAvailable(): boolean {
    return !!process.env.LOVABLE_API_KEY || !!process.env.GOOGLE_API_KEY;
  }

  async askQuestion({ question, context, history }: {
    question: string;
    context?: string;
    history?: ChatMessage[];
  }): Promise<string> {
    const sys =
      "You are AccessAI's assistant. Answer clearly and concisely. " +
      (context ? "Use the provided transcript as ground truth. If the answer isn't in it, say so." : "");
    const messages: ChatMessage[] = [
      { role: "system", content: sys },
      ...(context ? [{ role: "user" as const, content: `Transcript context:\n${context.slice(0, 12000)}` }] : []),
      ...(history ?? []),
      { role: "user", content: question },
    ];
    return callGatewayChat({ model: this.model, messages });
  }

  async searchTranscript({ query, transcript }: { query: string; transcript: string }): Promise<string> {
    return callGatewayChat({
      model: this.model,
      messages: [
        {
          role: "system",
          content:
            "You extract the most relevant passages from a transcript that answer a query. Return up to 5 short quoted excerpts, each on its own line prefixed with '> '.",
        },
        { role: "user", content: `Query: ${query}\n\nTranscript:\n${transcript.slice(0, 16000)}` },
      ],
    });
  }
}
