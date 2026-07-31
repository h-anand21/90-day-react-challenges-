import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { getSummaryService } from "@/lib/ai/services";

export default defineTool({
  name: "summarize_text",
  title: "Summarize text",
  description:
    "Produce a concise summary of a transcript or arbitrary text. Delegates to the configured summary provider (Gemini by default).",
  inputSchema: {
    text: z.string().min(1).describe("The text or transcript to summarize."),
    style: z
      .enum(["bullets", "paragraph", "tldr"])
      .optional()
      .describe("Preferred summary shape. Defaults to bullets."),
  },
  annotations: { readOnlyHint: true, idempotentHint: false, openWorldHint: false },
  handler: async ({ text, style }) => {
    try {
      const format = style === "paragraph" ? "detailed" : style === "tldr" ? "quick" : "bullets";
      const summary = await getSummaryService().summarize({
        transcript: text,
        format,
        targetLanguage: "English",
      });
      return { content: [{ type: "text", text: summary }] };
    } catch (err) {
      return { content: [{ type: "text", text: (err as Error).message }], isError: true };
    }
  },
});
