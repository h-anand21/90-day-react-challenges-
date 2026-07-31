import { createServerFn } from "@tanstack/react-start";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/fireflies/graphql";

/**
 * Fireflies data (meeting titles, participants, summaries, transcripts) is
 * private to the account owner. Since this app has no user auth, these server
 * functions are gated behind an explicit server-side opt-in flag.
 *
 * Set FIREFLIES_PUBLIC_ACCESS=true in the server environment ONLY if you
 * intentionally want every anonymous visitor to read the connected Fireflies
 * account's meetings. Otherwise these endpoints return an empty result and
 * cannot be used to exfiltrate meeting content via direct HTTP calls.
 */
function firefliesAccessAllowed(): boolean {
  return process.env.FIREFLIES_PUBLIC_ACCESS === "true";
}

async function firefliesQuery<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const lovableKey = process.env.LOVABLE_API_KEY;
  const ffKey = process.env.FIREFLIES_API_KEY;
  if (!lovableKey) throw new Error("LOVABLE_API_KEY is not configured.");
  if (!ffKey) throw new Error("FIREFLIES_API_KEY is not configured. Connect Fireflies first.");

  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": ffKey,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Fireflies request failed (${res.status}): ${body.slice(0, 300)}`);
  }
  const json = (await res.json()) as { data?: T; errors?: Array<{ message: string }> };
  if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join("; "));
  return json.data as T;
}

export type FirefliesTranscriptSummary = {
  id: string;
  title: string | null;
  date: number | null;
  duration: number | null;
  participants: string[] | null;
};

export const listFirefliesTranscripts = createServerFn({ method: "GET" })
  .handler(async () => {
    if (!firefliesAccessAllowed()) {
      // Do not leak meeting metadata to anonymous callers.
      return { items: [] as FirefliesTranscriptSummary[], restricted: true as const };
    }
    const data = await firefliesQuery<{ transcripts: FirefliesTranscriptSummary[] }>(
      `query { transcripts(limit: 25) { id title date duration participants } }`,
    );
    return { items: data.transcripts ?? [], restricted: false as const };
  });

export type FirefliesTranscriptDetail = {
  id: string;
  title: string | null;
  date: number | null;
  duration: number | null;
  participants: string[] | null;
  summary: { overview: string | null; bullet_gist: string | null; action_items: string | null } | null;
  sentences: Array<{ index: number; speaker_name: string | null; text: string; start_time: number | null }> | null;
};

export const getFirefliesTranscript = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    if (!firefliesAccessAllowed()) {
      throw new Error("Fireflies access is restricted. Enable FIREFLIES_PUBLIC_ACCESS server-side to expose meeting data.");
    }
    const res = await firefliesQuery<{ transcript: FirefliesTranscriptDetail }>(
      `query($id: String!) {
        transcript(id: $id) {
          id title date duration participants
          summary { overview bullet_gist action_items }
          sentences { index speaker_name text start_time }
        }
      }`,
      { id: data.id },
    );
    return { transcript: res.transcript };
  });
