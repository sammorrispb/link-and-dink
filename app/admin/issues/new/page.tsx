import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import IssueEditor from "@/components/admin/IssueEditor";

export const dynamic = "force-dynamic";

export default function NewIssuePage() {
  return (
    <>
      <AdminHeader />
      <main className="admin-main">
        <div className="admin-page-head">
          <h1>New issue</h1>
          <Link href="/admin" className="admin-link-btn">
            ← Back to issues
          </Link>
        </div>
        <IssueEditor />
      </main>
    </>
  );
}
