import { getServiceClient } from "@/lib/supabase-admin";
import { verify, siteUrl } from "@/lib/email/links";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Click-tracking redirect. The destination is resolved from `issue_links` by
 * `linkId` — it is NEVER taken from a URL param, so this can't be abused as an
 * open redirector. Anything that doesn't check out falls back to the homepage.
 */
export async function GET(request: Request) {
  const home = siteUrl("/");
  try {
    const url = new URL(request.url);
    const issueId = url.searchParams.get("i");
    const linkId = url.searchParams.get("l");
    const sig = url.searchParams.get("s");
    const token = url.searchParams.get("t");

    if (
      !issueId ||
      !linkId ||
      !sig ||
      !UUID_RE.test(issueId) ||
      !UUID_RE.test(linkId) ||
      !verify(`click:${issueId}:${linkId}`, sig)
    ) {
      return Response.redirect(home, 302);
    }

    const supabase = getServiceClient();
    const { data: link } = await supabase
      .from("issue_links")
      .select("url")
      .eq("id", linkId)
      .eq("issue_id", issueId)
      .maybeSingle();
    if (!link) {
      return Response.redirect(home, 302);
    }

    // Log the click — best-effort; resolve the subscriber from the token.
    if (token && UUID_RE.test(token)) {
      const { data: sub } = await supabase
        .from("subscribers")
        .select("id")
        .eq("tracking_token", token)
        .maybeSingle();
      if (sub) {
        await supabase.from("issue_events").insert({
          issue_id: issueId,
          subscriber_id: sub.id,
          type: "click",
          url: link.url,
        });
      }
    }

    return Response.redirect(link.url, 302);
  } catch (err) {
    console.error("[track:click]", err);
    return Response.redirect(home, 302);
  }
}
