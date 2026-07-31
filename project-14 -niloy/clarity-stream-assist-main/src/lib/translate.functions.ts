import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getTranslationService } from "./ai/services";

const Input = z.object({
  sentences: z.array(z.string().min(1)).min(1).max(20),
  target: z.string().min(2).max(20),
  sourceHint: z.string().optional(),
  glossary: z
    .object({
      keepAsIs: z.array(z.string()).optional(),
      mappings: z.array(z.tuple([z.string(), z.string()])).optional(),
    })
    .optional(),
});

export const translateSentences = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data }) => {
    const translations = await getTranslationService().translateBatch({
      sentences: data.sentences,
      target: data.target,
      sourceHint: data.sourceHint,
      glossary: data.glossary,
    });
    return { translations };
  });
