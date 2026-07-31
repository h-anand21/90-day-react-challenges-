import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getChatService } from "./ai/services";

const AskInput = z.object({
  question: z.string().min(1).max(2000),
  context: z.string().max(20000).optional(),
  history: z
    .array(
      z.object({
        role: z.enum(["system", "user", "assistant"]),
        content: z.string().min(1),
      }),
    )
    .max(20)
    .optional(),
});

export const askAssistant = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => AskInput.parse(d))
  .handler(async ({ data }): Promise<{ answer: string }> => {
    const answer = await getChatService().askQuestion({
      question: data.question,
      context: data.context,
      history: data.history,
    });
    return { answer };
  });

const SearchInput = z.object({
  query: z.string().min(1).max(500),
  transcript: z.string().min(10).max(30000),
});

export const searchTranscript = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => SearchInput.parse(d))
  .handler(async ({ data }): Promise<{ excerpts: string }> => {
    const excerpts = await getChatService().searchTranscript({
      query: data.query,
      transcript: data.transcript,
    });
    return { excerpts };
  });
