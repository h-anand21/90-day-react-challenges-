/**
 * Session-scoped translation memory / glossary.
 *
 * Ensures that recurring terms (product names, technical jargon, user-defined
 * vocabulary) are rendered consistently across every translated segment.
 * Gemini and OpenAI translators read the current glossary before each batch
 * and are instructed to reuse the mappings verbatim.
 */

const DEFAULT_GLOSSARY_KEEP_AS_IS = [
  // Tech
  "AccessAI", "ChatGPT", "GPT", "Deepgram", "Gemini", "OpenAI", "TensorFlow",
  "PyTorch", "Kubernetes", "Docker", "GitHub", "GitLab", "TypeScript", "JavaScript",
  "Python", "React", "Node.js", "Whisper", "Nano Banana",
  // Education
  "MAKAUT", "IIT", "NIT",
  // Common acronyms
  "AI", "ML", "LLM", "NLP", "API", "SDK", "REST", "GraphQL", "SQL", "NoSQL",
];

class TranslationMemoryImpl {
  private glossary: Record<string, string> = {};
  private perTargetMap: Map<string, Map<string, string>> = new Map();
  private userTerms: Set<string> = new Set();

  reset(): void {
    this.glossary = {};
    this.perTargetMap.clear();
    // keep userTerms across sessions
  }

  /** Terms the translator must keep verbatim, regardless of target language. */
  getKeepAsIs(): string[] {
    return [...DEFAULT_GLOSSARY_KEEP_AS_IS, ...this.userTerms];
  }

  addUserTerm(term: string): void {
    const t = term.trim();
    if (t) this.userTerms.add(t);
  }

  /** Canonical-casing glossary for the transcript refiner. */
  getCasingGlossary(): Record<string, string> {
    const out: Record<string, string> = {};
    for (const t of this.getKeepAsIs()) out[t.toLowerCase()] = t;
    return out;
  }

  /** Learn a mapping the model just produced (for future consistency). */
  learn(target: string, source: string, translated: string): void {
    const key = source.trim().toLowerCase();
    if (!key || !translated) return;
    if (key.length < 3 || key.length > 60) return;
    if (!this.perTargetMap.has(target)) this.perTargetMap.set(target, new Map());
    const m = this.perTargetMap.get(target)!;
    if (!m.has(key)) m.set(key, translated.trim());
  }

  /** Get a compact glossary snippet for the translator prompt. */
  getPromptGlossary(target: string): { keepAsIs: string[]; mappings: Array<[string, string]> } {
    const mappings: Array<[string, string]> = [];
    const m = this.perTargetMap.get(target);
    if (m) {
      let i = 0;
      for (const [src, dst] of m.entries()) {
        mappings.push([src, dst]);
        if (++i >= 20) break;
      }
    }
    return { keepAsIs: this.getKeepAsIs(), mappings };
  }
}

export const TranslationMemory = new TranslationMemoryImpl();
