"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

type Status = "idle" | "loading" | "success" | "error";

const EMPTY = {
  name: "",
  email: "",
  phone: "",
  neighborhood: "",
  dupr: "",
  yearsPlayed: "1–2 years",
  wherePlay: "",
  why: "",
  hoursPerWeek: "5–10 hours",
  weekendAvailability: "Most weekends",
  commit12wk: "Yes — count me in",
  honesty: "",
  company: "", // honeypot
};

/**
 * Coach Up application form. One long single-column form with five visual
 * steps. Posts to /api/coach-up/apply, which writes to Supabase and notifies
 * Sam. State machine mirrors components/SignupCard.tsx.
 */
export default function ApplyForm() {
  const [fields, setFields] = useState(EMPTY);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  function update(key: keyof typeof EMPTY) {
    return (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => setFields((f) => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/coach-up/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Something went wrong. Try again.");
        setStatus("error");
        return;
      }
      setStatus("success");
    } catch {
      setError("Something went wrong. Try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="apply-confirm" role="status">
        <div className="label">Application received</div>
        <h3>Got it. We&apos;ll be in touch.</h3>
        <p>
          Sam personally reads every application. You&apos;ll hear back within 5
          days from{" "}
          <strong style={{ color: "var(--smoke)" }}>sam@linkanddink.com</strong>
          .
        </p>
        <p style={{ marginBottom: 0 }}>
          While you wait — <Link href="/weekly">read the MD Pickleball
          newsletter</Link> or <Link href="/coach-up#faq">poke around the
          FAQ</Link>.
        </p>
      </div>
    );
  }

  const loading = status === "loading";

  return (
    <form className="apply-form" onSubmit={handleSubmit} noValidate>
      {/* Honeypot — hidden from real users, catches bots */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={fields.company}
        onChange={update("company")}
        style={{
          position: "absolute",
          left: "-9999px",
          width: 1,
          height: 1,
          opacity: 0,
        }}
      />

      <div className="form-step">
        <div className="step-head">
          <div className="step-num">1</div>
          <h3>Who you are</h3>
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              type="text"
              placeholder="Jordan Player"
              required
              value={fields.name}
              onChange={update("name")}
              disabled={loading}
            />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@email.com"
              required
              value={fields.email}
              onChange={update("email")}
              disabled={loading}
            />
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              type="tel"
              placeholder="(301) 555-0142"
              value={fields.phone}
              onChange={update("phone")}
              disabled={loading}
            />
          </div>
          <div className="field">
            <label htmlFor="neighborhood">MoCo neighborhood / DMV city</label>
            <input
              id="neighborhood"
              type="text"
              placeholder="Silver Spring, MD"
              value={fields.neighborhood}
              onChange={update("neighborhood")}
              disabled={loading}
            />
          </div>
        </div>
      </div>

      <div className="form-step">
        <div className="step-head">
          <div className="step-num">2</div>
          <h3>Your pickleball</h3>
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="dupr">DUPR rating (if you have one)</label>
            <input
              id="dupr"
              type="text"
              placeholder="3.8"
              value={fields.dupr}
              onChange={update("dupr")}
              disabled={loading}
            />
            <div className="hint">Optional. We&apos;ll evaluate you regardless.</div>
          </div>
          <div className="field">
            <label htmlFor="yearsPlayed">How long have you played?</label>
            <select
              id="yearsPlayed"
              value={fields.yearsPlayed}
              onChange={update("yearsPlayed")}
              disabled={loading}
            >
              <option>&lt; 1 year</option>
              <option>1–2 years</option>
              <option>2–4 years</option>
              <option>4+ years</option>
            </select>
          </div>
        </div>
        <div className="field">
          <label htmlFor="wherePlay">Where do you play most often?</label>
          <input
            id="wherePlay"
            type="text"
            placeholder="Bauer Drive Mondays + Pike District drop-ins"
            value={fields.wherePlay}
            onChange={update("wherePlay")}
            disabled={loading}
          />
        </div>
      </div>

      <div className="form-step">
        <div className="step-head">
          <div className="step-num">3</div>
          <h3>Why you</h3>
        </div>
        <div className="field">
          <label htmlFor="why">Why do you want to coach?</label>
          <textarea
            id="why"
            placeholder="One paragraph. What's pulling you toward this?"
            required
            value={fields.why}
            onChange={update("why")}
            disabled={loading}
          />
          <div className="hint">No length goal. Say the real thing.</div>
        </div>
      </div>

      <div className="form-step">
        <div className="step-head">
          <div className="step-num">4</div>
          <h3>Logistics</h3>
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="hoursPerWeek">Hours per week you can commit</label>
            <select
              id="hoursPerWeek"
              value={fields.hoursPerWeek}
              onChange={update("hoursPerWeek")}
              disabled={loading}
            >
              <option>3–5 hours</option>
              <option>5–10 hours</option>
              <option>10–15 hours</option>
              <option>15+ hours</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="weekendAvailability">Weekend availability?</label>
            <select
              id="weekendAvailability"
              value={fields.weekendAvailability}
              onChange={update("weekendAvailability")}
              disabled={loading}
            >
              <option>Most weekends</option>
              <option>Some weekends</option>
              <option>Weekdays only</option>
            </select>
          </div>
        </div>
        <div className="field">
          <label htmlFor="commit12wk">
            Can you commit to the full 12-week cohort?
          </label>
          <select
            id="commit12wk"
            value={fields.commit12wk}
            onChange={update("commit12wk")}
            disabled={loading}
          >
            <option>Yes — count me in</option>
            <option>Probably yes — small concerns I&apos;d want to discuss</option>
            <option>Unsure — let&apos;s talk</option>
          </select>
        </div>
      </div>

      <div className="form-step">
        <div className="step-head">
          <div className="step-num">5</div>
          <h3>Honesty</h3>
        </div>
        <div className="field">
          <label htmlFor="honesty">Anything we should know up front?</label>
          <textarea
            id="honesty"
            placeholder="Cert status, prior teaching, conflicts with existing club work, life stuff that might affect your schedule."
            value={fields.honesty}
            onChange={update("honesty")}
            disabled={loading}
          />
          <div className="hint">
            We&apos;d rather hear it now than discover it in week 4.
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Submitting…" : "Submit application →"}
        </button>
        <span className="submit-note">
          Sam replies within 5 days from sam@linkanddink.com.
        </span>
      </div>
      {status === "error" && (
        <p className="signup-error" role="alert" style={{ marginTop: 14 }}>
          {error}
        </p>
      )}
    </form>
  );
}
