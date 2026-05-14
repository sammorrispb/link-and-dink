import Link from "next/link";
import { getServiceClient } from "@/lib/supabase-admin";
import AdminHeader from "@/components/admin/AdminHeader";

// Admin dashboard must always reflect current data, never a cached render.
export const dynamic = "force-dynamic";

type IssueRow = {
  id: string;
  title: string;
  status: string;
  recipient_count: number | null;
  updated_at: string;
};

export default async function AdminDashboard() {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("issues")
    .select("id, title, status, recipient_count, updated_at")
    .order("updated_at", { ascending: false });

  const issues = (data ?? []) as IssueRow[];

  return (
    <>
      <AdminHeader />
      <main className="admin-main">
        <div className="admin-page-head">
          <h1>Issues</h1>
          <Link href="/admin/issues/new" className="btn btn-primary">
            New issue
          </Link>
        </div>

        {error && (
          <p className="signup-error" role="alert">
            Couldn&apos;t load issues. Try again.
          </p>
        )}

        {issues.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Recipients</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((issue) => (
                <tr key={issue.id}>
                  <td>
                    <Link href={`/admin/issues/${issue.id}`}>
                      {issue.title}
                    </Link>
                  </td>
                  <td>
                    <span className={`admin-badge admin-badge-${issue.status}`}>
                      {issue.status}
                    </span>
                  </td>
                  <td>{issue.recipient_count ?? "—"}</td>
                  <td>
                    {new Date(issue.updated_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          !error && (
            <p className="admin-empty">
              No issues yet.{" "}
              <Link href="/admin/issues/new">Write your first one.</Link>
            </p>
          )
        )}
      </main>
    </>
  );
}
