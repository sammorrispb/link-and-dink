import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default function AdminHeader() {
  return (
    <header className="admin-header">
      <Link href="/admin" className="admin-brand">
        Link &amp; Dink <span>Admin</span>
      </Link>
      <nav className="admin-nav">
        <Link href="/admin">Issues</Link>
        <Link href="/admin/issues/new">New issue</Link>
        <LogoutButton />
      </nav>
    </header>
  );
}
