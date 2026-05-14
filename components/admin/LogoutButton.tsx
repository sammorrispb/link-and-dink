"use client";

export default function LogoutButton() {
  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.assign("/admin/login");
  }

  return (
    <button type="button" className="admin-link-btn" onClick={handleLogout}>
      Log out
    </button>
  );
}
