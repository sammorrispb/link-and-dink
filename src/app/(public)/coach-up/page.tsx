import type { Metadata } from "next";
import { MobileShell } from "@/components/pot/MobileShell";
import { TopBar } from "@/components/pot/TopBar";
import { Button } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  COACH_CREDS,
  COHORT_POINTS,
  EVENT_TIERS,
  FAQS,
  FIT,
  NOT_FIT,
  REV_CARDS,
  WORK_TYPES,
} from "@/lib/coach-up/content";

export const metadata: Metadata = {
  title: "Coach Up — Link & Dink's paid apprenticeship for new pickleball coaches",
  description:
    "Apprentice with a master coach, run real DMV pickleball events, and keep 100% of every lesson and clinic you teach. Cohort of 3.",
};

/** Locked masthead pairing — never split, never replaced by the hook. */
function Masthead() {
  return (
    <h1 className="flex flex-col text-[34px] font-black leading-[0.95] tracking-[-0.03em]">
      <span className="text-text">Play up.</span>
      <span className="text-lime">Coach up.</span>
    </h1>
  );
}

export default function CoachUpPage() {
  return (
    <MobileShell>
      <TopBar brand="link-and-dink" icon="☰" />
      <main className="flex flex-1 flex-col px-[18px] pb-12">
        {/* Hero */}
        <section className="pt-6">
          <Pill>
            <span className="h-1.5 w-1.5 rounded-full bg-lime" />
            Cohort forming · DMV
          </Pill>
          <div className="mt-3.5">
            <Masthead />
          </div>
          <p className="mt-3.5 text-[15px] leading-snug text-text">
            <strong className="font-black">Earn while you learn.</strong> Apprentice with a master
            coach, run real events, keep 100% of every lesson and clinic you teach.
          </p>
          <p className="mt-2.5 text-[13.5px] leading-relaxed text-text-muted">
            A paid apprenticeship for the DMV&apos;s next pickleball coaches. No upfront tuition. No
            DIY client hunt. Just real reps under a coach who&apos;s been doing this for a decade.
          </p>
          <div className="mt-4">
            <Button href="/coach-up/apply">Apply for the cohort →</Button>
          </div>
          <p className="mt-3 text-[11px] font-semibold text-text-dim">
            Powered by JOOLA · DMV — launching in MoCo · 3 spots per cohort
          </p>
        </section>

        {/* Intro */}
        <section>
          <SectionHeader eyebrow="How it works" title="It's mentorship, not certification." />
          <p className="text-[13.5px] leading-relaxed text-text-muted">
            Sam runs Coach Up.{" "}
            <strong className="text-text">
              Master&apos;s in coaching. 4.83 DUPR. More coaching reps in pickleball than 99% of the
              people teaching it.
            </strong>{" "}
            He&apos;s spent the last decade making other players better, and he likes doing it.
          </p>
          <p className="mt-2.5 text-[13.5px] leading-relaxed text-text-muted">
            You bring the energy and the willingness to learn the craft. He handles court booking
            and logistics. You run the session. After every event, you sit with Sam — what worked,
            what to try next week, where your players are stuck.
          </p>
        </section>

        {/* Work types */}
        <section>
          <SectionHeader
            eyebrow="What you'll do"
            title="Three kinds of work, one apprenticeship."
          />
          <div className="flex flex-col gap-2.5">
            {WORK_TYPES.map((w) => (
              <Card key={w.num}>
                <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-lime text-[15px] font-black text-action-text">
                  {w.num}
                </div>
                <h3 className="mt-2.5 text-[16px] font-extrabold text-text">{w.title}</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-text-muted">{w.body}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Rev share */}
        <section>
          <SectionHeader eyebrow="What you keep" title="The cleanest split in coaching." />
          <p className="mb-2.5 text-[13px] leading-relaxed text-text-muted">
            Most platforms take a cut of everything you teach. We take a share only on events where
            we&apos;re picking up the court cost — and nothing from your lessons or clinics. Ever.
          </p>
          <div className="flex flex-col gap-2.5">
            {REV_CARDS.map((r) => (
              <Card key={r.label} variant={r.highlight ? "feature" : "default"}>
                <div className="flex items-baseline justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-text-dim">
                      {r.label}
                    </div>
                    <div className="mt-0.5 text-[15px] font-bold text-text">{r.surface}</div>
                  </div>
                  <div className="text-[30px] font-black leading-none tracking-[-0.03em] text-lime">
                    {r.split}
                  </div>
                </div>
                <p className="mt-2 text-[12.5px] leading-relaxed text-text-muted">{r.body}</p>
              </Card>
            ))}
          </div>
          <Card variant="feature" className="mt-2.5">
            <h3 className="text-[14px] font-extrabold text-text">
              Event rev share, in plain terms
            </h3>
            <p className="mt-1 text-[12px] leading-relaxed text-text-muted">
              The split slides with what L&amp;D contributes — court cost, premium-venue access,
              marketing reach. Free public court? You keep all of it.
            </p>
            <div className="mt-3 flex flex-col gap-2">
              {EVENT_TIERS.map((t) => (
                <div
                  key={t.court}
                  className="rounded-[10px] border border-border-subtle bg-[rgba(1,22,13,0.4)] px-3 py-2.5"
                >
                  <div className="text-[12.5px] font-semibold text-text">{t.court}</div>
                  <div className="mt-1 flex items-center justify-between text-[11.5px] text-text-muted">
                    <span>
                      Court {t.cost} · Fee {t.fee}
                    </span>
                    <span className="font-extrabold text-lime">{t.take}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Callout lead="Why it's structured this way:" className="mt-2.5">
            Uber, Airbnb, DoorDash, MindBody — they all take a cut of everything, regardless of what
            they contribute. We don&apos;t. If we&apos;re not paying for the court, we don&apos;t
            take a piece. If you&apos;re teaching your own lessons, we&apos;re not in the
            transaction at all.
          </Callout>
        </section>

        {/* Cohort */}
        <section>
          <SectionHeader eyebrow="The cohort" title="Small on purpose." />
          <Card variant="feature" className="text-center">
            <div className="text-[64px] font-black leading-none tracking-[-0.05em] text-lime">
              3
            </div>
            <div className="mt-1 text-[14px] font-bold text-text">Coaches per cohort</div>
            <p className="mt-1 text-[12px] text-text-muted">
              Real bandwidth, not manufactured scarcity. Three is what makes the 1:1 honest.
            </p>
          </Card>
          <div className="mt-2.5 flex flex-col gap-2">
            {COHORT_POINTS.map((c) => (
              <div key={c.lead} className="flex gap-2.5">
                <span className="mt-0.5 font-black text-lime">✓</span>
                <p className="text-[13px] leading-relaxed text-text-muted">
                  <strong className="text-text">{c.lead}</strong> {c.rest}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Certification */}
        <section>
          <SectionHeader eyebrow="Certification" title="Recommended. Not subsidized." />
          <p className="text-[13.5px] leading-relaxed text-text-muted">
            Once you&apos;re running real events, we strongly recommend PPR or IPTPA certification —
            not because it makes you a better coach (Sam&apos;s mentorship does that), but because
            it gets you insured.
          </p>
          <Callout
            lead="To be clear:"
            className="mt-2.5 border-[rgba(254,209,68,0.30)] bg-[rgba(254,209,68,0.10)]"
          >
            Link &amp; Dink does not cover any portion of your cert cost. You pay for it on your
            own.
          </Callout>
          <div className="mt-3 text-[10px] font-extrabold uppercase tracking-[0.12em] text-lime">
            Where we help
          </div>
          <ul className="mt-1.5 flex flex-col gap-1 text-[13px] text-text-muted">
            <li>Picking the right cert pathway (PPR vs. IPTPA, level, format)</li>
            <li>Study tips and what to expect on the assessment</li>
            <li>Connecting you with other certified coaches in the DMV</li>
          </ul>
        </section>

        {/* Fit check */}
        <section>
          <SectionHeader eyebrow="Fit check" title="Who Coach Up is for." />
          <div className="flex flex-col gap-2.5">
            <Card>
              <h3 className="text-[14px] font-extrabold text-text">
                <span className="text-lime">✓</span> Right for you if
              </h3>
              <ul className="mt-2 flex flex-col gap-1.5">
                {FIT.map((f) => (
                  <li key={f} className="text-[12.5px] leading-relaxed text-text-muted">
                    <span className="mr-1.5 font-black text-lime">•</span>
                    {f}
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="border-[rgba(255,122,133,0.25)] bg-[rgba(71,15,16,0.35)]">
              <h3 className="text-[14px] font-extrabold text-text">
                <span className="text-danger">✕</span> Not for you if
              </h3>
              <ul className="mt-2 flex flex-col gap-1.5">
                {NOT_FIT.map((f) => (
                  <li key={f} className="text-[12.5px] leading-relaxed text-text-muted">
                    <span className="mr-1.5 font-black text-danger">•</span>
                    {f}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </section>

        {/* Coach bio */}
        <section>
          <SectionHeader eyebrow="Your coach" title="Sam — Master's in coaching, 4.83 DUPR." />
          <div className="flex aspect-[4/3] items-center justify-center rounded-card border border-border-medium bg-[linear-gradient(135deg,#2c2745,#044026)] text-[12px] font-semibold text-text-dim">
            photo of Sam
          </div>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {COACH_CREDS.map((c) => (
              <Pill key={c}>{c}</Pill>
            ))}
          </div>
          <p className="mt-2.5 text-[13px] leading-relaxed text-text-muted">
            A decade of coaching reps. Loves growing the game. Positive, specific, no-nonsense at
            the net. The kind of coach who notices that you&apos;re closing your face on the third
            shot before you do, and tells you so without making it weird.
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-text-muted">
            If you&apos;re going to apprentice with someone, they should be good at the thing AND
            good at teaching it. Sam is both.
          </p>
        </section>

        {/* FAQ */}
        <section id="faq">
          <SectionHeader eyebrow="FAQ" title="The questions we hear most." />
          <div className="flex flex-col gap-2">
            {FAQS.map((f) => (
              <Card key={f.q}>
                <div className="text-[13.5px] font-bold text-text">
                  <span className="font-black text-lime">Q. </span>
                  {f.q}
                </div>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-text-muted">{f.a}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="mt-8 rounded-card border border-border-medium bg-[linear-gradient(160deg,#07332a_0%,#044026_100%)] p-5 text-center">
          <div className="flex flex-col items-center">
            <Masthead />
          </div>
          <p className="mt-2.5 text-[13.5px] leading-snug text-text">
            <strong className="font-black">Earn while you learn.</strong> Three spots. Hand-picked
            by Sam.
          </p>
          <div className="mt-3.5">
            <Button href="/coach-up/apply">Apply for the cohort →</Button>
          </div>
          <p className="mt-3 text-[11.5px] leading-relaxed text-text-dim">
            On the MD Pickleball newsletter? Reply with{" "}
            <span className="font-bold text-lime">I&apos;m in</span> + one sentence on why.
          </p>
        </section>
      </main>
    </MobileShell>
  );
}
