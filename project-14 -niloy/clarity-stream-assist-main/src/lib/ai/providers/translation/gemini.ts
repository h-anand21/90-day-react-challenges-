import type { ITranslationProvider, TranslationGlossary } from "../../interfaces";
import { callGatewayChat } from "../text-gateway";
import { LanguageQualityRegistry } from "@/core/LanguageQualityRegistry";

/**
 * Gemini as a professional real-time interpreter (not a word-for-word MT).
 *
 * The prompt is tuned for meeting/interview contexts: preserve intent,
 * tone, technical terminology, and idiom equivalents. Session glossary
 * (translation memory) is passed in so recurring terms translate the
 * same way every time.
 */
export class GeminiTranslationProvider implements ITranslationProvider {
  readonly name = "gemini";
  private model = "google/gemini-2.5-flash";

  isAvailable(): boolean {
    return !!process.env.LOVABLE_API_KEY || !!process.env.GOOGLE_API_KEY;
  }

  async translate({ text, target, sourceHint, glossary }: {
    text: string;
    target: string;
    sourceHint?: string;
    glossary?: TranslationGlossary;
  }): Promise<string> {
    const [t] = await this.translateBatch({ sentences: [text], target, sourceHint, glossary });
    return t ?? "";
  }

  async translateBatch({ sentences, target, sourceHint, glossary }: {
    sentences: string[];
    target: string;
    sourceHint?: string;
    glossary?: TranslationGlossary;
  }): Promise<string[]> {
    const sys =
      "You are a professional real-time human interpreter for a live meeting assistant. " +
      "Your output will be spoken aloud by a neural voice, so it must read as if a native speaker " +
      "were speaking it — not as if it were translated. " +
      "Rules:\n" +
      "1. Interpret meaning, not words. Preserve the speaker's intent, emotion, tone and register.\n" +
      "2. Never translate word-for-word. Restructure the sentence to sound native in the target language.\n" +
      "3. Preserve technical terminology and named entities. Do NOT translate items in KEEP_AS_IS.\n" +
      "4. Reuse any GLOSSARY mappings exactly — the same source term must always map to the same target.\n" +
      "5. If an idiom or fixed expression exists in the target language, prefer it.\n" +
      "6. Handle code-switching (mixed languages): integrate foreign words naturally.\n" +
      "7. Prosody preparation: use natural sentence-level punctuation so the TTS engine inflects correctly — " +
      "end questions with '?' (or the language's native question mark), exclamations with '!', use commas " +
      "for natural breath pauses, and '…' for hesitation. Do NOT insert SSML tags or bracketed stage directions.\n" +
      "8. Keep sentence length conversational (avoid one giant run-on) so the interpreter voice can breathe.\n" +
      "9. Never add commentary, notes, or explanations. Never invent information not present in the source.\n" +
      'Return STRICT JSON: {"items":[{"i":<number>,"t":"<interpretation>"}]}. Match the item count exactly.';

    const keepAsIs = glossary?.keepAsIs?.length ? glossary.keepAsIs.join(", ") : "";
    const mappings = glossary?.mappings?.length
      ? glossary.mappings.map(([s, t]) => `  "${s}" → "${t}"`).join("\n")
      : "";

    const profile = LanguageQualityRegistry.get(target);
    const user =
      `Target language: ${target} (${profile.nativeName}, locale ${profile.bcp47})\n` +
      `Localization guidance: ${profile.localizationNote}\n` +
      (sourceHint ? `Source language (hint, may be mixed): ${sourceHint}\n` : "") +
      (keepAsIs ? `KEEP_AS_IS (do not translate): ${keepAsIs}\n` : "") +
      (mappings ? `GLOSSARY (source → target):\n${mappings}\n` : "") +
      `Sentences:\n${sentences.map((s, i) => `${i + 1}. ${s}`).join("\n")}`;

    const raw = await callGatewayChat({
      model: this.model,
      temperature: 0.3,
      jsonMode: true,
      messages: [
        { role: "system", content: sys },
        { role: "user", content: user },
      ],
    });
    let parsed: any;
    try { parsed = JSON.parse(raw); } catch { parsed = {}; }
    const items: { i: number; t: string }[] = Array.isArray(parsed.items) ? parsed.items : [];
    return sentences.map((_, i) => {
      const hit = items.find((x) => Number(x.i) === i + 1);
      return (hit?.t ?? "").toString();
    });
  }
}
