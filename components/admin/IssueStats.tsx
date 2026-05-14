import { getIssueStats } from "@/lib/newsletter/stats";

function pct(part: number, whole: number): string {
  if (whole <= 0) return "0%";
  return `${Math.round((part / whole) * 100)}%`;
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="admin-stat">
      <span className="admin-stat-value">{value}</span>
      <span className="admin-stat-label">{label}</span>
    </div>
  );
}

/** Analytics panel for a sent (or sending/failed) issue. */
export default async function IssueStats({ issueId }: { issueId: string }) {
  const stats = await getIssueStats(issueId);
  if (!stats) return null;

  return (
    <div className="admin-stats">
      <h2>Performance</h2>
      <div className="admin-stats-grid">
        <Stat label="Recipients" value={stats.recipients} />
        <Stat label="Sent" value={stats.sent} />
        <Stat label="Failed" value={stats.failed} />
        <Stat label="Skipped" value={stats.skipped} />
        <Stat
          label="Unique opens"
          value={`${stats.unique_opens} · ${pct(stats.unique_opens, stats.recipients)}`}
        />
        <Stat
          label="Unique clicks"
          value={`${stats.unique_clicks} · ${pct(stats.unique_clicks, stats.recipients)}`}
        />
        <Stat label="Total clicks" value={stats.total_clicks} />
        <Stat label="Unsubscribes" value={stats.unsubscribes} />
      </div>
      <p className="admin-stats-note">
        Open rates are inflated by mail-client image prefetching (Apple Mail
        Privacy, etc.) — treat opens as directional, weight clicks higher.
      </p>
    </div>
  );
}
