import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { getTranslationService } from "@/lib/ai/services";

export default defineTool({
  name: "translate_text",
  title: "Translate text",
  description:
    "Translate arbitrary text into a target language. Delegates to the configured translation provider (Gemini by default).",
  inputSchema: {
    text: z.string().min(1).describe("The source text to translate."),
    target_language: z
      .string()
      .min(2)
      .describe("Target language name, e.g. 'Spanish', 'French', 'Japanese'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: false, openWorldHint: false },
  handler: async ({ text, target_language }) => {
    try {
      const translated = await getTranslationService().translate({
        text,
        target: target_language,
      });
      return { content: [{ type: "text", text: translated }] };
    } catch (err) {
      return { content: [{ type: "text", text: (err as Error).message }], isError: true };
    }
  },
});
