import { getServiceClient } from "@/lib/supabase-admin";
import { markdownToHtml } from "@/lib/email/render";
import { extractLinks } from "./extract-links";

/**
 * Enqueue an issue for sending. Delegates to the `enqueue_issue` Postgres
 * function, which atomically guards the `draft -> queued -> sending` transition
 * and creates one `issue_sends` row per eligible subscriber (subscribed,
 * confirmed, not suppressed). Idempotent — re-running enqueues nothing new.
 *
 * Then populates `issue_links` so the click-tracking route can resolve a link
 * id to a known destination. Runs once per issue (enqueue is draft-guarded).
 */
export async function enqueueIssue(
  issueId: string,
): Promise<{ recipientCount: number } | { error: string }> {
  const supabase = getServiceClient();
  const { data, error } = await supabase.rpc("enqueue_issue", {
    p_issue: issueId,
  });

  if (error) {
    console.error("[newsletter:enqueue]", error.message);
    return { error: "Failed to enqueue issue." };
  }
  if (data === -1) {
    return { error: "Issue is not in draft status." };
  }

  // Best-effort: a failure here shouldn't unwind a successful enqueue —
  // worst case, links in this issue just aren't click-tracked.
  try {
    const { data: issue } = await supabase
      .from("issues")
      .select("body_markdown")
      .eq("id", issueId)
      .maybeSingle();
    if (issue?.body_markdown) {
      const urls = extractLinks(markdownToHtml(issue.body_markdown));
      if (urls.length > 0) {
        await supabase
          .from("issue_links")
          .insert(urls.map((url) => ({ issue_id: issueId, url })));
      }
    }
  } catch (err) {
    console.error("[newsletter:enqueue] link extraction failed:", err);
  }

  return { recipientCount: data as number };
}
