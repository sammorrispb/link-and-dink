import { getServiceClient } from "@/lib/supabase-admin";

/**
 * Enqueue an issue for sending. Delegates to the `enqueue_issue` Postgres
 * function, which atomically guards the `draft -> queued -> sending` transition
 * and creates one `issue_sends` row per eligible subscriber (subscribed,
 * confirmed, not suppressed). Idempotent — re-running enqueues nothing new.
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
  return { recipientCount: data as number };
}
