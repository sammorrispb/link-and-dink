import { getServiceClient } from "@/lib/supabase-admin";

export type IssueStats = {
  recipients: number;
  sent: number;
  failed: number;
  skipped: number;
  pending: number;
  unique_opens: number;
  total_opens: number;
  unique_clicks: number;
  total_clicks: number;
  unsubscribes: number;
};

/** Per-issue analytics rollup via the `issue_stats` Postgres function. */
export async function getIssueStats(
  issueId: string,
): Promise<IssueStats | null> {
  const supabase = getServiceClient();
  const { data, error } = await supabase.rpc("issue_stats", {
    p_issue: issueId,
  });
  if (error || !data) {
    console.error("[newsletter:stats]", error?.message);
    return null;
  }
  return data as IssueStats;
}
