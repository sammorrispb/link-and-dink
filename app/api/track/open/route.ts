import crypto from "node:crypto";
import { getServiceClient } from "@/lib/supabase-admin";
import { verify } from "@/lib/email/links";

// 1x1 transparent GIF.
const PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64",
);

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function pixel() {
  return new Response(PIXEL, {
    status: 200,
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate, private",
    },
  });
}

/**
 * Open-tracking pixel. Always returns the GIF — never errors, never leaks
 * whether the params were valid. Logs an `open` event only when the signature
 * checks out and the tracking token resolves to a subscriber.
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const issueId = url.searchParams.get("i");
    const sig = url.searchParams.get("s");
    const token = url.searchParams.get("t");

    if (
      issueId &&
      sig &&
      token &&
      UUID_RE.test(issueId) &&
      UUID_RE.test(token) &&
      verify(`open:${issueId}`, sig)
    ) {
      const supabase = getServiceClient();
      const { data: sub } = await supabase
        .from("subscribers")
        .select("id")
        .eq("tracking_token", token)
        .maybeSingle();
      if (sub) {
        const ipRaw =
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
        const ipHash = ipRaw
          ? crypto.createHash("sha256").update(ipRaw).digest("hex").slice(0, 16)
          : null;
        await supabase.from("issue_events").insert({
          issue_id: issueId,
          subscriber_id: sub.id,
          type: "open",
          user_agent: request.headers.get("user-agent"),
          ip_hash: ipHash,
        });
      }
    }
  } catch (err) {
    console.error("[track:open]", err);
  }
  return pixel();
}
