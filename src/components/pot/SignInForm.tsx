"use client";

import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";

/**
 * Magic-link sign-in. Shown inline on the RSVP page when the visitor isn't
 * authenticated yet — after they click the emailed link they land back on
 * `redirectTo`.
 */
export function SignInForm({ redirectTo }: { redirectTo: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    const supabase = createClient();
    const callback = `${window.location.origin}/auth/callback?next=${encodeURIComponent(
      redirectTo,
    )}`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: callback },
    });

    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
      return;
    }
    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <Card variant="feature">
        <h2 className="text-[18px] font-black text-text">Check your email</h2>
        <p className="mt-2 text-[13px] leading-relaxed text-text-muted">
          We sent a sign-in link to <strong className="text-text">{email}</strong>. Tap it and
          you&apos;ll come straight back here to finish your RSVP.
        </p>
      </Card>
    );
  }

  return (
    <Card variant="feature">
      <h2 className="text-[18px] font-black text-text">Sign in to enter the pot</h2>
      <p className="mt-1 text-[13px] leading-relaxed text-text-muted">
        Enter your email — we&apos;ll send a one-tap sign-in link. No password.
      </p>
      <form onSubmit={handleSubmit} className="mt-3.5 flex flex-col gap-2.5">
        <input
          type="email"
          required
          autoComplete="email"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-btn border border-border-medium bg-surface-2 px-3.5 py-3 text-[15px] text-text placeholder:text-text-dim focus:border-lime focus:outline-none"
        />
        <Button type="submit" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Email me a sign-in link"}
        </Button>
        {status === "error" ? <p className="text-[12px] text-danger">{errorMsg}</p> : null}
      </form>
    </Card>
  );
}
