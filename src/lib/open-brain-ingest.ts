/**
 * Open Brain lead ingest client.
 *
 * POST to the Open Brain leads-ingest Edge Function. Caller should `await`
 * (Vercel tears down lambdas before fire-and-forget Promises complete).
 * Any failure is logged but never thrown — caller flow must not break if
 * OB is down or env vars are missing.
 *
 * Required env vars:
 *   OPEN_BRAIN_INGEST_URL    — full URL to the edge function
 *   LEAD_INGEST_TOKEN        — shared secret
 */

export type OpenBrainBusiness = "ld" | "nga" | "coaching" | "dd" | "mocopb";

export interface OpenBrainIngestPayload {
  email?: string;
  name?: string;
  phone?: string;
  business: OpenBrainBusiness;
  source: string;
  initial_stage?: string;
  utm?: { campaign?: string; source?: string; medium?: string };
  interest?: string;
  metadata?: Record<string, unknown>;
}

export async function ingestToOpenBrain(payload: OpenBrainIngestPayload): Promise<void> {
  const url = process.env.OPEN_BRAIN_INGEST_URL;
  const token = process.env.LEAD_INGEST_TOKEN;

  if (!url || !token) {
    console.warn("[OB ingest] skipped — env vars missing");
    return;
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-lead-ingest-token": token,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`[OB ingest] ${res.status}: ${text}`);
    }
  } catch (err) {
    console.error("[OB ingest] request failed:", err);
  }
}
