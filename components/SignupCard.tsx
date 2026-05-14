"use client";

import { useState, type FormEvent } from "react";

type Status = "idle" | "loading" | "success" | "error";

/**
 * Newsletter signup form — reused in the hero and the newsletter reprise.
 * Posts to /api/subscribe, which writes to the Supabase `subscribers` table.
 * `source` tags which placement the signup came from.
 */
export default function SignupCard({ source }: { source: string }) {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source, company }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Something went wrong. Try again.");
        setStatus("error");
        return;
      }
      setStatus("success");
      setEmail("");
    } catch {
      setError("Something went wrong. Try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="signup-success" role="status">
        <strong>You&apos;re in.</strong> First issue hits your inbox Thursday at
        7am.
      </div>
    );
  }

  return (
    <>
      <form className="signup-form" onSubmit={handleSubmit} noValidate>
        <input
          type="email"
          required
          placeholder="you@email.com"
          aria-label="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "loading"}
        />
        {/* Honeypot — hidden from real users, catches bots */}
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          style={{
            position: "absolute",
            left: "-9999px",
            width: 1,
            height: 1,
            opacity: 0,
          }}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={status === "loading"}
        >
          {status === "loading" ? "Subscribing…" : "Subscribe"}
        </button>
      </form>
      {status === "error" ? (
        <p className="signup-error" role="alert">
          {error}
        </p>
      ) : (
        <div className="signup-trust">
          <span>Free, always</span>
          <span>One email a week</span>
          <span>Unsubscribe anytime</span>
        </div>
      )}
    </>
  );
}
