"use client";

import { useState, type FormEvent } from "react";

/**
 * Newsletter signup form — reused in the hero and the newsletter reprise.
 * v1: submits to a console.log placeholder. ESP integration is a follow-up
 * (see TODO.md).
 */
export default function SignupCard() {
  const [email, setEmail] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Placeholder — wire to an ESP (Beehiiv / ConvertKit / etc.) in production.
    console.log("[newsletter] signup submitted:", email);
    setEmail("");
  }

  return (
    <>
      <form className="signup-form" onSubmit={handleSubmit}>
        <input
          type="email"
          required
          placeholder="you@email.com"
          aria-label="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" className="btn btn-primary">
          Subscribe
        </button>
      </form>
      <div className="signup-trust">
        <span>Free, always</span>
        <span>One email a week</span>
        <span>Unsubscribe anytime</span>
      </div>
    </>
  );
}
