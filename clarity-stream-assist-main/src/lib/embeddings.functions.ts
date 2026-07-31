import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { EmbeddingsProviderFactory } from "./ai/providers/embeddings/gateway";

const Input = z.object({
  text: z.string().min(1).max(20000),
  dimensions: z.number().int().positive().max(3072).optional(),
});

/** Embed a single string. Returns a 1536-d vector by default. */
export const embedText = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data }) => {
    const provider = EmbeddingsProviderFactory.create();
    const [vector] = await provider.embed({ text: data.text, dimensions: data.dimensions });
    return { provider: provider.name, dimensions: vector.length, vector };
  });
