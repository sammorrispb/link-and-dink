import type { SupabaseClient } from "@supabase/supabase-js";
import { getServiceClient } from "@/lib/supabase-admin";
import { getEmailProvider } from "@/lib/email";
import { renderEmail } from "@/lib/email/render";
import { unsubscribePageUrl, unsubscribeApiUrl } from "@/lib/email/links";
import { UNSUBSCRIBE_PLACEHOLDER } from "@/lib/email/template";

const BATCH_SIZE = 25;
const MAX_ATTEMPTS = 3;

type IssueRow = {
  id: string;
  subject: string;
  preview_text: string | null;
  body_markdown: string;
};

type SendRow = {
  id: string;
  subscriber_id: string;
  attempts: number;
};

type SubscriberRow = {
  id: string;
  email: string;
  status: string;
  confirmed_at: string | null;
  unsubscribe_token: string;
};

export type DrainResult = {
  claimed: number;
  sent: number;
  failed: number;
  skipped: number;
};

/**
 * Drain pending sends. Cron-invoked (Phase 1: every minute on Vercel Pro).
 *
 * Each tick: for every `sending` issue, atomically claim a batch via the
 * `claim_issue_sends` RPC (FOR UPDATE SKIP LOCKED — overlapping cron runs claim
 * disjoint rows), render once, send per-recipient, mark each row terminal
 * immediately on success. At-least-once: a row whose send succeeded but whose
 * status write failed is reclaimed after the 5-minute stale lease and retried.
 */
export async function drain(): Promise<DrainResult> {
  const supabase = getServiceClient();
  const result: DrainResult = { claimed: 0, sent: 0, failed: 0, skipped: 0 };

  const { data: issues, error: issuesErr } = await supabase
    .from("issues")
    .select("id, subject, preview_text, body_markdown")
    .eq("status", "sending");

  if (issuesErr) {
    console.error("[newsletter:drain] load issues:", issuesErr.message);
    return result;
  }

  for (const issue of (issues ?? []) as IssueRow[]) {
    const { data: rows, error: claimErr } = await supabase.rpc(
      "claim_issue_sends",
      { p_issue: issue.id, p_batch: BATCH_SIZE },
    );
    if (claimErr) {
      console.error("[newsletter:drain] claim:", claimErr.message);
      continue;
    }
    const batch = (rows ?? []) as SendRow[];
    if (batch.length === 0) continue;
    result.claimed += batch.length;

    // Render once per issue — per-recipient is just a string replace.
    const rendered = renderEmail(issue);
    const provider = getEmailProvider();

    // Batch-fetch subscribers + suppressions (2 queries, not 2N).
    const subscriberIds = batch.map((r) => r.subscriber_id);
    const { data: subsData } = await supabase
      .from("subscribers")
      .select("id, email, status, confirmed_at, unsubscribe_token")
      .in("id", subscriberIds);
    const subs = new Map(
      ((subsData ?? []) as SubscriberRow[]).map((s) => [s.id, s]),
    );

    const emails = ((subsData ?? []) as SubscriberRow[]).map((s) =>
      s.email.toLowerCase(),
    );
    let suppressed = new Set<string>();
    if (emails.length > 0) {
      const { data: suppData } = await supabase
        .from("suppressions")
        .select("email")
        .in("email", emails);
      suppressed = new Set(
        ((suppData ?? []) as { email: string }[]).map((s) =>
          s.email.toLowerCase(),
        ),
      );
    }

    for (const row of batch) {
      const sub = subs.get(row.subscriber_id);
      // Re-check eligibility at drain time — catches drift since enqueue
      // (someone who unsubscribed before their row drained).
      if (
        !sub ||
        sub.status !== "subscribed" ||
        !sub.confirmed_at ||
        suppressed.has(sub.email.toLowerCase())
      ) {
        await supabase
          .from("issue_sends")
          .update({ status: "skipped" })
          .eq("id", row.id);
        result.skipped++;
        continue;
      }

      // Visible footer link → confirmation page; List-Unsubscribe header → the
      // RFC 8058 one-click POST endpoint.
      const pageUrl = unsubscribePageUrl(sub.unsubscribe_token, issue.id);
      const apiUrl = unsubscribeApiUrl(sub.unsubscribe_token, issue.id);
      const html = rendered.html.replaceAll(UNSUBSCRIBE_PLACEHOLDER, pageUrl);
      const text = rendered.text.replaceAll(UNSUBSCRIBE_PLACEHOLDER, pageUrl);

      const sendResult = await provider.send({
        to: sub.email,
        subject: issue.subject,
        html,
        text,
        headers: {
          "List-Unsubscribe": `<${apiUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      });

      if ("id" in sendResult) {
        await supabase
          .from("issue_sends")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
            provider_message_id: sendResult.id,
          })
          .eq("id", row.id);
        result.sent++;
      } else {
        const giveUp = row.attempts >= MAX_ATTEMPTS;
        await supabase
          .from("issue_sends")
          .update({
            status: giveUp ? "failed" : "pending",
            error: sendResult.error,
          })
          .eq("id", row.id);
        if (giveUp) {
          console.error(
            `[newsletter:drain] gave up on send ${row.id} after ${row.attempts} attempts: ${sendResult.error}`,
          );
          result.failed++;
        }
      }
    }
  }

  await finalizeIssues(supabase);
  return result;
}

/**
 * Flip issues out of `sending` once their queue is drained: `sent` if every row
 * is terminal, `failed` if any row failed. Safe to run every tick.
 */
async function finalizeIssues(supabase: SupabaseClient): Promise<void> {
  const { data: issues } = await supabase
    .from("issues")
    .select("id")
    .eq("status", "sending");

  for (const issue of (issues ?? []) as { id: string }[]) {
    const { count: live } = await supabase
      .from("issue_sends")
      .select("id", { count: "exact", head: true })
      .eq("issue_id", issue.id)
      .in("status", ["pending", "sending"]);
    if (live && live > 0) continue;

    const { count: failedCount } = await supabase
      .from("issue_sends")
      .select("id", { count: "exact", head: true })
      .eq("issue_id", issue.id)
      .eq("status", "failed");

    await supabase
      .from("issues")
      .update({
        status: failedCount && failedCount > 0 ? "failed" : "sent",
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", issue.id);
  }
}
