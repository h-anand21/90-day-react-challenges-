import type { ITranslationProvider, TranslationGlossary } from "../../interfaces";
import { callGatewayChat } from "../text-gateway";
import { LanguageQualityRegistry } from "@/core/LanguageQualityRegistry";

export class OpenAITranslationProvider implements ITranslationProvider {
  readonly name = "openai";
  private model = "openai/gpt-5-mini";

  isAvailable(): boolean {
    return !!process.env.LOVABLE_API_KEY || !!process.env.OPENAI_API_KEY;
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
      "You are a professional multilingual interpreter. Translate each numbered sentence " +
      "into the target language. Translate meaning, not words. Preserve intent, tone, " +
      "technical terminology and named entities. Never translate items in KEEP_AS_IS. " +
      "Reuse GLOSSARY mappings exactly. Use natural, native-sounding grammar. " +
      'Return STRICT JSON: {"items":[{"i":<n>,"t":"<translation>"}]}.';
    const keepAsIs = glossary?.keepAsIs?.length ? glossary.keepAsIs.join(", ") : "";
    const mappings = glossary?.mappings?.length
      ? glossary.mappings.map(([s, t]) => `  "${s}" → "${t}"`).join("\n")
      : "";
    const profile = LanguageQualityRegistry.get(target);
    const user =
      `Target: ${target} (${profile.nativeName}, ${profile.bcp47})\n` +
      `Localization: ${profile.localizationNote}\n` +
      (sourceHint ? `Source hint: ${sourceHint}\n` : "") +
      (keepAsIs ? `KEEP_AS_IS: ${keepAsIs}\n` : "") +
      (mappings ? `GLOSSARY:\n${mappings}\n` : "") +
      sentences.map((s, i) => `${i + 1}. ${s}`).join("\n");
    const raw = await callGatewayChat({
      model: this.model,
      temperature: 0.2,
      jsonMode: true,
      messages: [
        { role: "system", content: sys },
        { role: "user", content: user },
      ],
    });
    let parsed: any;
    try { parsed = JSON.parse(raw); } catch { parsed = {}; }
    const items: { i: number; t: string }[] = Array.isArray(parsed.items) ? parsed.items : [];
    return sentences.map((_, i) => items.find((x) => Number(x.i) === i + 1)?.t ?? "");
  }
}
