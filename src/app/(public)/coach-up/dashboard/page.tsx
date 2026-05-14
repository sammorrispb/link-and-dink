import type { Metadata } from "next";
import { MobileShell } from "@/components/pot/MobileShell";
import { TopBar } from "@/components/pot/TopBar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  type CourtTier,
  DASH_CERT,
  DASH_EARNINGS,
  DASH_MEMBER,
  DASH_MENTOR_LOG,
  DASH_OPEN_EVENTS,
  DASH_THIS_WEEK,
} from "@/lib/coach-up/content";

export const metadata: Metadata = {
  title: "Coach Up Dashboard | Link & Dink",
  // v1 renders seeded mock data with no member concept yet — keep it out of
  // the index until there's a real member dashboard behind real auth.
  robots: { index: false, follow: false },
};

const TIER_CLASS: Record<CourtTier, string> = {
  free: "bg-[rgba(181,214,84,0.16)] text-lime",
  low: "bg-[rgba(181,175,241,0.16)] text-violet",
  premium: "bg-[rgba(245,182,209,0.16)] text-pink",
};

export default function CoachUpDashboardPage() {
  return (
    <MobileShell>
      <TopBar brand="link-and-dink" icon="☰" />
      <main className="flex flex-1 flex-col px-[18px] pb-12">
        {/* Header */}
        <section className="flex items-start justify-between gap-3 pt-6">
          <div>
            <h1 className="text-[24px] font-black tracking-[-0.02em] text-text">
              Welcome back, {DASH_MEMBER.firstName}.
            </h1>
            <p className="mt-1 text-[13px] text-text-muted">{DASH_MEMBER.cohortLabel}</p>
          </div>
          <span className="flex shrink-0 items-center gap-1.5 rounded-pill bg-[rgba(181,214,84,0.10)] px-2.5 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.04em] text-lime">
            <span className="h-1.5 w-1.5 rounded-full bg-lime" />
            Active
          </span>
        </section>

        {/* This week */}
        <section>
          <SectionHeader eyebrow="This week" title="What's on your plate." />
          <div className="flex flex-col gap-2.5">
            {DASH_THIS_WEEK.map((item) => (
              <Card key={item.title}>
                <div className="text-[10px] font-extrabold uppercase tracking-[0.06em] text-lime">
                  {item.kind}
                </div>
                <h3 className="mt-1 text-[15px] font-extrabold text-text">{item.title}</h3>
                <p className="mt-0.5 text-[12px] text-text-muted">{item.when}</p>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-text-muted">{item.note}</p>
                <div className="mt-2.5">
                  <Button size="compact" variant="secondary" type="button">
                    {item.cta} →
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Open events */}
        <section>
          <SectionHeader eyebrow="Open events" title="Claim what you'll run." />
          <div className="flex flex-col gap-2">
            {DASH_OPEN_EVENTS.map((e) => (
              <Card key={`${e.date}-${e.venue}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[13.5px] font-bold text-text">{e.date}</div>
                    <div className="text-[12.5px] text-text-muted">{e.venue}</div>
                  </div>
                  <span
                    className={`shrink-0 rounded-pill px-2 py-1 text-[10px] font-bold uppercase tracking-[0.04em] ${TIER_CLASS[e.tier]}`}
                  >
                    {e.tierLabel}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[12px] text-text-muted">
                    Fee {e.fee} · {e.rsvps} RSVP · take{" "}
                    <span className="font-extrabold text-lime">{e.take}</span>
                  </span>
                  <Button size="compact" type="button">
                    Claim ▸
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Lessons + clinics */}
        <section>
          <SectionHeader eyebrow="Lessons + clinics" title="Your own practice." />
          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              className="rounded-card border border-border-medium bg-[rgba(255,253,250,0.04)] px-4 py-3.5 text-left transition-colors hover:border-lime"
            >
              <div className="text-[10px] font-extrabold uppercase tracking-[0.06em] text-lime">
                + New private lesson
              </div>
              <div className="mt-0.5 text-[14px] font-bold text-text">Publish a 1:1 slot</div>
            </button>
            <button
              type="button"
              className="rounded-card border border-border-medium bg-[rgba(255,253,250,0.04)] px-4 py-3.5 text-left transition-colors hover:border-lime"
            >
              <div className="text-[10px] font-extrabold uppercase tracking-[0.06em] text-lime">
                + New clinic
              </div>
              <div className="mt-0.5 text-[14px] font-bold text-text">Post to the L&amp;D feed</div>
            </button>
          </div>
          <p className="mt-2 text-[11.5px] text-text-dim">
            <strong className="text-lime">You keep 100%.</strong> L&amp;D doesn&apos;t touch revenue
            from lessons or clinics — we just help you fill them.
          </p>
        </section>

        {/* Mentorship log */}
        <section>
          <SectionHeader eyebrow="Mentorship log" title="Notes from Sam." />
          <Card>
            {DASH_MENTOR_LOG.map((entry, i) => (
              <div
                key={entry.date}
                className={i > 0 ? "mt-3 border-t border-[rgba(255,253,250,0.06)] pt-3" : undefined}
              >
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[13px] font-bold text-text">{entry.date}</span>
                  {entry.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-pill bg-[rgba(181,214,84,0.10)] px-2 py-0.5 text-[10px] font-bold text-lime"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="mt-1 text-[12.5px] leading-relaxed text-text-muted">{entry.note}</p>
              </div>
            ))}
          </Card>
        </section>

        {/* Cert tracker */}
        <section>
          <SectionHeader eyebrow="Certification" title="Where you stand." />
          <Card>
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] text-text-dim">{DASH_CERT.pathway}</div>
                <div className="mt-0.5 text-[14px] font-bold text-text">{DASH_CERT.detail}</div>
              </div>
              <span className="shrink-0 rounded-pill border border-[rgba(254,209,68,0.30)] bg-[rgba(254,209,68,0.10)] px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.04em] text-yellow">
                {DASH_CERT.status}
              </span>
            </div>
            <p className="mt-2.5 text-[11.5px] text-text-dim">
              L&amp;D doesn&apos;t cover the cost — but we&apos;ll help you pick the right level and
              study what matters.
            </p>
          </Card>
        </section>

        {/* Earnings ledger */}
        <section>
          <SectionHeader eyebrow={`Earnings · ${DASH_EARNINGS.month}`} title="Visibility only." />
          <div className="grid grid-cols-3 gap-2">
            {DASH_EARNINGS.cells.map((cell) => (
              <div
                key={cell.label}
                className="rounded-card border border-border-subtle bg-[rgba(1,22,13,0.4)] px-3 py-3"
              >
                <div className="text-[10px] font-extrabold uppercase tracking-[0.05em] text-text-dim">
                  {cell.label}
                </div>
                <div className="mt-1 text-[20px] font-black leading-none tracking-[-0.02em] text-lime">
                  {cell.amt}
                </div>
                <div className="mt-1 text-[11px] text-text-muted">{cell.hours}</div>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[11.5px] text-text-dim">
            Coach Up doesn&apos;t custodian payments — you collect direct. This is just the running
            tally.
          </p>
        </section>
      </main>
    </MobileShell>
  );
}
