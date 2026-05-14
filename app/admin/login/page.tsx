"use client";

import { useState, type FormEvent } from "react";

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        // Full navigation so the freshly-set session cookie is sent.
        window.location.assign("/admin");
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Login failed.");
    } catch {
      setError("Login failed.");
    }
    setLoading(false);
  }

  return (
    <main className="admin-auth">
      <div className="admin-card admin-auth-card">
        <div className="eyebrow">Link &amp; Dink Admin</div>
        <h1>Sign in</h1>
        <form onSubmit={handleSubmit} className="admin-form">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            aria-label="Admin password"
            autoComplete="current-password"
            required
            disabled={loading}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        {error && (
          <p className="signup-error" role="alert">
            {error}
          </p>
        )}
      </div>
    </main>
  );
}
