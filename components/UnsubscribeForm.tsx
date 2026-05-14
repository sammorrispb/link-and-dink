"use client";

import { useState } from "react";

type Status = "idle" | "loading" | "done" | "error";

/**
 * Confirmation step for the visible unsubscribe link. The actual mutation is a
 * POST to /api/unsubscribe — keeping it behind a click means a link prefetcher
 * can't silently unsubscribe someone.
 */
export default function UnsubscribeForm({
  token,
  issueId,
}: {
  token: string;
  issueId?: string;
}) {
  const [status, setStatus] = useState<Status>("idle");

  async function handleUnsubscribe() {
    setStatus("loading");
    const query = issueId
      ? `?token=${encodeURIComponent(token)}&i=${encodeURIComponent(issueId)}`
      : `?token=${encodeURIComponent(token)}`;
    try {
      const res = await fetch(`/api/unsubscribe${query}`, { method: "POST" });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <p className="notice-body" role="status">
        <strong>You&apos;re unsubscribed.</strong> You won&apos;t get Link &amp;
        Dink Weekly anymore. Changed your mind? You can always sign up again.
      </p>
    );
  }

  return (
    <>
      <p className="notice-body">
        Unsubscribe from Link &amp; Dink Weekly? You&apos;ll stop getting the
        Thursday email.
      </p>
      <button
        type="button"
        className="btn btn-primary"
        onClick={handleUnsubscribe}
        disabled={status === "loading"}
      >
        {status === "loading" ? "Unsubscribing…" : "Unsubscribe"}
      </button>
      {status === "error" && (
        <p className="signup-error" role="alert">
          Something went wrong. Try the link again.
        </p>
      )}
    </>
  );
}
