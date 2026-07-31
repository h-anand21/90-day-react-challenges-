import { defineMcp } from "@lovable.dev/mcp-js";
import echoTool from "./tools/echo";
import summarizeTextTool from "./tools/summarize-text";
import translateTextTool from "./tools/translate-text";

export default defineMcp({
  name: "accessai-mcp",
  title: "AccessAI",
  version: "0.1.0",
  instructions:
    "AccessAI tools for AI assistants. Use `echo` to verify connectivity, `summarize_text` to condense transcripts or long text, and `translate_text` to translate text into another language for accessibility use cases. These tools operate only on text passed in the call; they do not read AccessAI user recordings or account data.",
  tools: [echoTool, summarizeTextTool, translateTextTool],
});
