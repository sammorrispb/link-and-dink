import Link from "next/link";
import { notFound } from "next/navigation";
import { getServiceClient } from "@/lib/supabase-admin";
import AdminHeader from "@/components/admin/AdminHeader";
import IssueEditor from "@/components/admin/IssueEditor";
import IssueStats from "@/components/admin/IssueStats";

export const dynamic = "force-dynamic";

export default async function EditIssuePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = getServiceClient();
  const { data: issue } = await supabase
    .from("issues")
    .select("id, title, subject, slug, preview_text, body_markdown, status")
    .eq("id", id)
    .maybeSingle();

  if (!issue) {
    notFound();
  }

  return (
    <>
      <AdminHeader />
      <main className="admin-main">
        <div className="admin-page-head">
          <h1>{issue.title}</h1>
          <Link href="/admin" className="admin-link-btn">
            ← Back to issues
          </Link>
        </div>
        <IssueEditor issue={issue} />
        {issue.status !== "draft" && <IssueStats issueId={issue.id} />}
      </main>
    </>
  );
}
