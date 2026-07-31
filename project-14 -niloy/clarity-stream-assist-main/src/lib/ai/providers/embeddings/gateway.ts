/**
 * Embeddings provider — routes through the Lovable AI Gateway.
 *
 * Default model: `google/gemini-embedding-001` with `dimensions: 1536` so
 * the resulting vectors fit an HNSW index directly and match the
 * `transcript_segments.embedding vector(1536)` column.
 *
 * The interface intentionally mirrors OpenAI-style embeddings so a real
 * bge-m3 host can drop in later without touching callers.
 */

export interface EmbedInput {
  text: string | string[];
  model?: string;
  dimensions?: number;
}

export interface IEmbeddingsProvider {
  readonly name: string;
  isAvailable(): boolean;
  embed(input: EmbedInput): Promise<number[][]>;
}

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/embeddings";

export class GatewayEmbeddingsProvider implements IEmbeddingsProvider {
  readonly name = "lovable-gateway";
  private defaultModel = "google/gemini-embedding-001";
  private defaultDims = 1536;

  isAvailable(): boolean {
    return !!process.env.LOVABLE_API_KEY;
  }

  async embed({ text, model, dimensions }: EmbedInput): Promise<number[][]> {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY not configured");
    const input = Array.isArray(text) ? text : [text];
    const body: Record<string, unknown> = {
      model: model ?? this.defaultModel,
      input,
    };
    // gemini-embedding accepts `dimensions` via OpenRouter's shape.
    if (dimensions ?? this.defaultDims) body.dimensions = dimensions ?? this.defaultDims;

    const res = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`embeddings HTTP ${res.status}: ${detail.slice(0, 300)}`);
    }
    const json = (await res.json()) as { data?: { embedding: number[]; index: number }[] };
    const rows = json.data ?? [];
    rows.sort((a, b) => a.index - b.index);
    return rows.map((r) => r.embedding);
  }
}

export const EmbeddingsProviderFactory = {
  create(): IEmbeddingsProvider {
    return new GatewayEmbeddingsProvider();
  },
};
