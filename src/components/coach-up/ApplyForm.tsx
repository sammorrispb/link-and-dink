"use client";

import Link from "next/link";
import { useActionState } from "react";
import { APPLY_INITIAL, submitApplication } from "@/app/(public)/coach-up/apply/actions";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  COMMIT_OPTIONS,
  HOURS_OPTIONS,
  WEEKEND_OPTIONS,
  YEARS_OPTIONS,
} from "@/lib/coach-up/content";

const inputClass =
  "w-full rounded-btn border border-border-medium bg-surface-2 px-3.5 py-3 text-[15px] text-text placeholder:text-text-dim focus:border-lime focus:outline-none";
const labelClass = "mb-1.5 block text-[12.5px] font-semibold text-text-muted";
const hintClass = "mt-1 text-[11px] text-text-dim";

function StepHead({ num, title }: { num: string; title: string }) {
  return (
    <div className="mb-3 flex items-center gap-2.5">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-lime text-[12px] font-black text-action-text">
        {num}
      </span>
      <h2 className="text-[15px] font-extrabold text-text">{title}</h2>
    </div>
  );
}

/**
 * Coach Up application form. Five visual steps in one mobile column; submits
 * via the `submitApplication` server action. On success the form swaps for a
 * confirmation card.
 */
export function ApplyForm() {
  const [state, formAction, isPending] = useActionState(submitApplication, APPLY_INITIAL);

  if (state.ok) {
    return (
      <Card variant="feature">
        <div className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-lime">
          Application received
        </div>
        <h2 className="mt-2 text-[18px] font-black text-text">Got it. We&apos;ll be in touch.</h2>
        <p className="mt-2 text-[13px] leading-relaxed text-text-muted">
          Sam personally reads every application. You&apos;ll hear back within 5 days from{" "}
          <strong className="text-text">sam@linkanddink.com</strong>.
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-text-muted">
          While you wait — poke around the{" "}
          <Link href="/coach-up#faq" className="font-bold text-lime">
            FAQ
          </Link>
          .
        </p>
      </Card>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {/* Honeypot — hidden from real users, catches bots */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-px w-px opacity-0"
      />

      <div>
        <StepHead num="1" title="Who you are" />
        <div className="flex flex-col gap-3">
          <div>
            <label className={labelClass} htmlFor="name">
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="Jordan Player"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@email.com"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="phone">
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="(301) 555-0142"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="neighborhood">
              MoCo neighborhood / DMV city
            </label>
            <input
              id="neighborhood"
              name="neighborhood"
              type="text"
              placeholder="Silver Spring, MD"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div>
        <StepHead num="2" title="Your pickleball" />
        <div className="flex flex-col gap-3">
          <div>
            <label className={labelClass} htmlFor="dupr">
              DUPR rating (if you have one)
            </label>
            <input id="dupr" name="dupr" type="text" placeholder="3.8" className={inputClass} />
            <p className={hintClass}>Optional. We&apos;ll evaluate you regardless.</p>
          </div>
          <div>
            <label className={labelClass} htmlFor="yearsPlayed">
              How long have you played?
            </label>
            <select
              id="yearsPlayed"
              name="yearsPlayed"
              defaultValue={YEARS_OPTIONS[1]}
              className={inputClass}
            >
              {YEARS_OPTIONS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="wherePlay">
              Where do you play most often?
            </label>
            <input
              id="wherePlay"
              name="wherePlay"
              type="text"
              placeholder="Bauer Drive Mondays + Pike District drop-ins"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div>
        <StepHead num="3" title="Why you" />
        <div>
          <label className={labelClass} htmlFor="why">
            Why do you want to coach?
          </label>
          <textarea
            id="why"
            name="why"
            required
            rows={4}
            placeholder="One paragraph. What's pulling you toward this?"
            className={`${inputClass} resize-y`}
          />
          <p className={hintClass}>No length goal. Say the real thing.</p>
        </div>
      </div>

      <div>
        <StepHead num="4" title="Logistics" />
        <div className="flex flex-col gap-3">
          <div>
            <label className={labelClass} htmlFor="hoursPerWeek">
              Hours per week you can commit
            </label>
            <select
              id="hoursPerWeek"
              name="hoursPerWeek"
              defaultValue={HOURS_OPTIONS[1]}
              className={inputClass}
            >
              {HOURS_OPTIONS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="weekendAvailability">
              Weekend availability?
            </label>
            <select
              id="weekendAvailability"
              name="weekendAvailability"
              defaultValue={WEEKEND_OPTIONS[0]}
              className={inputClass}
            >
              {WEEKEND_OPTIONS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="commit12wk">
              Can you commit to the full 12-week cohort?
            </label>
            <select
              id="commit12wk"
              name="commit12wk"
              defaultValue={COMMIT_OPTIONS[0]}
              className={inputClass}
            >
              {COMMIT_OPTIONS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div>
        <StepHead num="5" title="Honesty" />
        <div>
          <label className={labelClass} htmlFor="honesty">
            Anything we should know up front?
          </label>
          <textarea
            id="honesty"
            name="honesty"
            rows={3}
            placeholder="Cert status, prior teaching, conflicts with existing club work, life stuff that might affect your schedule."
            className={`${inputClass} resize-y`}
          />
          <p className={hintClass}>We&apos;d rather hear it now than discover it in week 4.</p>
        </div>
      </div>

      {state.error ? (
        <p className="text-[13px] font-semibold text-danger" role="alert">
          {state.error}
        </p>
      ) : null}

      <div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Submitting…" : "Submit application →"}
        </Button>
        <p className="mt-2 text-[11.5px] text-text-dim">
          Sam replies within 5 days from sam@linkanddink.com.
        </p>
      </div>
    </form>
  );
}
