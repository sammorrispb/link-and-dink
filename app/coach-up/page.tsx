import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title:
    "Coach Up — Link & Dink's paid apprenticeship for new pickleball coaches",
  description:
    "Apprentice with a master coach, run real DMV pickleball events, and keep 100% of every lesson and clinic you teach. Cohort of 3.",
};

const WORK_TYPES = [
  {
    num: "1",
    title: "Run events",
    body: "Pickup sessions, Pot Nights, ladders, socials. Sam books the court. You bring the energy and run the room.",
  },
  {
    num: "2",
    title: "Coach lessons",
    body: "1:1 and small-group private instruction. Set your own rate. We send you students. You keep what you earn.",
  },
  {
    num: "3",
    title: "Run clinics",
    body: "Skills-focused group sessions — drilling, strategy, level-specific. Sam helps you design the curriculum.",
  },
];

const EVENT_TIERS = [
  {
    court: "Free outdoor public (most MoCo parks)",
    cost: "$0",
    fee: "$5–10",
    take: "100%",
  },
  {
    court: "Low-cost outdoor paid",
    cost: "~$10/ct/hr",
    fee: "$10–15",
    take: "80% after court",
  },
  {
    court: "Premium indoor (Bauer Drive, Pickleball Zone)",
    cost: "~$40/ct/hr",
    fee: "$20–30",
    take: "50% after court",
  },
];

const COHORT_POINTS = [
  {
    lead: "12-week structured roadmap.",
    rest: 'No "here\'s a basket of balls, good luck." Onboarding has a sequence, and you\'ll know what week 5 looks like before you start.',
  },
  {
    lead: "Weekly 1:1 with Sam.",
    rest: "Post-event debriefs, lesson-plan reviews, dealing with the awkward player, business questions.",
  },
  {
    lead: "Peer cohort.",
    rest: "Two other apprentices in your same season. Group thread, shared wins, accountability.",
  },
  {
    lead: "Real reps from week 1.",
    rest: "You'll be running events the second week. Mentorship without reps is a workshop, not an apprenticeship.",
  },
];

const FIT = [
  "You're a 3.5+ player who already gets stopped by friends asking for tips at open play",
  "You want to teach for real, not as a side gig that fizzles in three months",
  "You'd rather earn while learning than pay tuition and DIY your client list",
  "You can commit ~5–10 hours a week for 12 weeks",
  "You live in the DMV (launching in MoCo)",
];

const NOT_FIT = [
  "You want a fast PPR cert and a job board — go straight to PPR",
  "You're not comfortable being coached in front of your cohort",
  "You expect L&D to find every student and book every lesson",
  "You're already running a coaching business and want a referral program",
  "You're outside the DMV and not planning to relocate",
];

const FAQS = [
  {
    q: "Do I need to be certified to start?",
    a: "No. We recommend cert once you're running real events for the insurance, but you don't need it on day one. You'll get reps with Sam before you ever run a session alone.",
  },
  {
    q: "How much can I actually earn?",
    a: "It depends on how much you teach. Realistically, a Coach Up member running 2 events + 4 lessons + 1 clinic a week is looking at meaningful side-income inside 60 days. We track your earnings ledger in the dashboard so you can see it growing.",
  },
  {
    q: "How many hours a week is this?",
    a: "Plan for 5–10 hours/week for the 12-week cohort: 2–4 hours running events, 1–3 hours on lessons or clinics you publish, 1 hour 1:1 with Sam, plus prep. You can scale up after.",
  },
  {
    q: "Do I have to be in MoCo?",
    a: "First cohort, yes — that's our launch wedge. Future cohorts expand to broader DMV (DC, NoVa, Baltimore).",
  },
  {
    q: "What if I want to drop out mid-cohort?",
    a: "No penalty, no clawback. Coach Up is an apprenticeship, not a contract. We'd rather you tell us early than ghost.",
  },
  {
    q: "What does Sam actually do as my mentor?",
    a: "Weekly 1:1 (in person when possible, video when not). Post-event debriefs. Lesson-plan reviews. Sometimes he just shows up to your event and watches. Always honest, always specific.",
  },
  {
    q: "When does the next cohort start?",
    a: "Cohort #1 is forming now. Apply and we'll let you know within 5 days where you stand. If you're a fit and the cohort is full, we'll hold a spot for #2.",
  },
  {
    q: "What if I'm already a coach somewhere else?",
    a: "Reply with your situation. We're not trying to steal anyone's day job. Coach Up is compatible with most existing club/coach setups, but we want the conversation up front.",
  },
];

export default function CoachUpPage() {
  return (
    <>
      <Nav />
      <main>
        <section className="hero">
          <div className="wrap hero-inner">
            <span className="eyebrow">
              <span className="dot" /> Cohort forming · DMV
            </span>
            <h1 className="masthead-stack">
              <span className="line-1">Play up.</span>
              <span className="line-2">Coach up.</span>
            </h1>
            <p className="hook">
              <strong>Earn while you learn.</strong> Apprentice with a master
              coach, run real events, keep 100% of every lesson and clinic you
              teach.
            </p>
            <p className="hero-lede">
              A paid apprenticeship for the DMV&apos;s next pickleball coaches.
              No upfront tuition. No DIY client hunt. Just real reps under a
              coach who&apos;s been doing this for a decade.
            </p>
            <div className="hero-actions">
              <Link href="/coach-up/apply" className="btn btn-primary">
                Apply for the cohort &rarr;
              </Link>
              <a href="#how" className="btn btn-secondary">
                How the apprenticeship works &darr;
              </a>
            </div>
            <div className="hero-trust">
              <span className="joola-tag">Powered by JOOLA</span>
              <span className="sep" />
              <span>DMV — launching in MoCo</span>
              <span className="sep" />
              <span>3 spots per cohort</span>
            </div>
          </div>
        </section>

        <section className="intro" id="how">
          <div className="wrap intro-grid">
            <div className="intro-lead">
              It&apos;s not certification. It&apos;s not infrastructure favors.
              It&apos;s <em>mentorship.</em>
            </div>
            <div className="intro-body">
              <p>
                Sam runs Coach Up.{" "}
                <strong>
                  Master&apos;s in coaching. 4.83 DUPR. More coaching reps in
                  pickleball than 99% of the people teaching it.
                </strong>{" "}
                He&apos;s spent the last decade making other players better, and
                he likes doing it.
              </p>
              <p>
                You bring the energy, the people skills, and the willingness to
                learn the craft. He handles court booking and logistics. You run
                the session. After every event, you sit with Sam — what worked,
                what to try next week, where your players are stuck.
              </p>
              <p>
                That&apos;s the offer. Every other piece — the brand, the rev
                share, the marketing reach — is downstream of that.
              </p>
            </div>
          </div>
        </section>

        <section className="work-types">
          <div className="wrap">
            <div className="section-head">
              <span className="eyebrow">What you&apos;ll do</span>
              <h2>Three kinds of work, all under one apprenticeship.</h2>
              <p>
                Coach Up members do all three — mentored by Sam, supported by
                Link &amp; Dink infrastructure.
              </p>
            </div>
            <div className="work-grid">
              {WORK_TYPES.map((w) => (
                <div className="work-card" key={w.num}>
                  <div className="num">{w.num}</div>
                  <h3>{w.title}</h3>
                  <p>{w.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rev-share">
          <div className="wrap">
            <div className="section-head">
              <span className="eyebrow">What you keep</span>
              <h2>The cleanest split in coaching.</h2>
              <p>
                Most platforms take a cut of everything you teach. We take a
                share only on events where we&apos;re picking up the court cost —
                and we take nothing from your lessons or clinics. Ever.
              </p>
            </div>

            <div className="rev-grid">
              <div className="rev-card highlight">
                <div className="label">Lessons</div>
                <div className="split">
                  100<span className="small">%</span>
                </div>
                <div className="surface-name">Your earnings</div>
                <p>
                  1:1 and small-group private instruction. L&amp;D takes zero.
                </p>
              </div>
              <div className="rev-card highlight">
                <div className="label">Clinics</div>
                <div className="split">
                  100<span className="small">%</span>
                </div>
                <div className="surface-name">Your earnings</div>
                <p>
                  Drilling, strategy, level-specific group sessions. L&amp;D
                  takes zero.
                </p>
              </div>
              <div className="rev-card">
                <div className="label">Events</div>
                <div className="split">
                  100<span className="small">&rarr;50%</span>
                </div>
                <div className="surface-name">Tiered by court cost</div>
                <p>
                  L&amp;D takes a share only on events — and only where
                  we&apos;re paying for the court.
                </p>
              </div>
            </div>

            <div className="event-tiers">
              <h4>Event rev share, in plain terms</h4>
              <div className="sub">
                The split slides with what L&amp;D actually contributes — court
                cost, premium-venue access, marketing reach. Free public court?
                You keep all of it.
              </div>
              <div className="tier-row tier-head">
                <div className="col-1">Court tier</div>
                <div>Court cost</div>
                <div>Suggested player fee</div>
                <div className="col-4">Your take</div>
              </div>
              {EVENT_TIERS.map((t) => (
                <div className="tier-row" key={t.court}>
                  <div className="col-1">{t.court}</div>
                  <div>{t.cost}</div>
                  <div>{t.fee}</div>
                  <div className="col-4">{t.take}</div>
                </div>
              ))}
            </div>

            <div className="rev-moat">
              <strong>Why it&apos;s structured this way:</strong> Uber, Airbnb,
              DoorDash, MindBody — they all take a cut of everything, regardless
              of what they actually contribute. We don&apos;t. If we&apos;re not
              paying for the court, we don&apos;t take a piece. If you&apos;re
              teaching your own lessons, we&apos;re not in the transaction at
              all. That&apos;s the deal.
            </div>
          </div>
        </section>

        <section className="cohort">
          <div className="wrap cohort-grid">
            <div>
              <div className="cohort-stat">
                <div className="big">3</div>
                <div className="label">Coaches per cohort</div>
                <div className="sub">
                  Real bandwidth, not manufactured scarcity. Three is what makes
                  the 1:1 honest.
                </div>
              </div>
            </div>
            <div>
              <span className="eyebrow">The cohort</span>
              <h2>Small on purpose.</h2>
              <p style={{ fontSize: "17px" }}>
                A cohort of three means Sam can actually mentor you across
                events, lessons, and clinics — not just send you to a group
                seminar and call it done.
              </p>
              <ul className="cohort-list">
                {COHORT_POINTS.map((c) => (
                  <li key={c.lead}>
                    <span className="check">&#10003;</span>
                    <span>
                      <strong>{c.lead}</strong> {c.rest}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="cert">
          <div className="cert-wrap">
            <span className="eyebrow">Certification</span>
            <h2>
              Recommended. <span className="lime">Not subsidized.</span>
            </h2>
            <p style={{ fontSize: "17px" }}>
              Once you&apos;re running real events, we strongly recommend PPR or
              IPTPA certification. Not because it makes you a better coach —
              Sam&apos;s mentorship does that — but because it gets you insured.
              If something goes wrong at one of your events, that piece of paper
              matters.
            </p>
            <div className="cert-callout">
              <strong>To be clear:</strong> Link &amp; Dink does not cover any
              portion of your cert cost. You pay for it on your own.
            </div>
            <h5 style={{ margin: "24px 0 6px" }}>Where we help</h5>
            <ul>
              <li>
                Picking the right cert pathway (PPR vs. IPTPA, level, format)
              </li>
              <li>Study tips and what to expect on the assessment</li>
              <li>Connecting you with other certified coaches in the DMV</li>
            </ul>
          </div>
        </section>

        <section className="fit">
          <div className="wrap">
            <div className="section-head">
              <span className="eyebrow">Fit check</span>
              <h2>Who Coach Up is for.</h2>
            </div>
            <div className="fit-grid">
              <div className="fit-card">
                <h3>
                  <span className="marker">&#10003;</span> Right for you if
                </h3>
                <ul>
                  {FIT.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
              <div className="fit-card not">
                <h3>
                  <span className="marker">&#10007;</span> Not for you if
                </h3>
                <ul>
                  {NOT_FIT.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="coach-bio">
          <div className="wrap bio-grid">
            <div className="bio-photo">photo of Sam</div>
            <div className="bio-content">
              <span className="eyebrow">Your coach</span>
              <h2>Sam — Master&apos;s in coaching, 4.83 DUPR.</h2>
              <div className="bio-creds">
                <span>Master&apos;s in coaching</span>
                <span>4.83 DUPR</span>
                <span>A decade coaching</span>
                <span>Next Gen Pickleball Academy</span>
              </div>
              <p style={{ fontSize: "16px" }}>
                A decade of coaching reps. Loves growing the game. Positive,
                specific, no-nonsense at the net. The kind of coach who notices
                that you&apos;re closing your face on the third shot before you
                do, and tells you so without making it weird.
              </p>
              <p style={{ fontSize: "16px" }}>
                If you&apos;re going to apprentice with someone, the person
                should be good at the thing AND good at teaching it. Sam is
                both.
              </p>
            </div>
          </div>
        </section>

        <section className="faq" id="faq">
          <div className="wrap">
            <div className="section-head">
              <span className="eyebrow">FAQ</span>
              <h2>The questions we hear most.</h2>
            </div>
            <div className="faq-list">
              {FAQS.map((f) => (
                <div className="faq-item" key={f.q}>
                  <div className="faq-q">{f.q}</div>
                  <p className="faq-a">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="final-cta" id="apply">
          <div className="wrap">
            <h2 className="masthead-stack">
              <span className="line-1">Play up.</span>
              <span className="line-2">Coach up.</span>
            </h2>
            <p className="hook">
              <strong>Earn while you learn.</strong> Three spots. Hand-picked by
              Sam.
            </p>
            <div
              className="hero-actions"
              style={{ justifyContent: "center" }}
            >
              <Link href="/coach-up/apply" className="btn btn-primary">
                Apply for the cohort &rarr;
              </Link>
              <Link href="/weekly" className="btn btn-secondary">
                Read the newsletter first
              </Link>
            </div>
            <p className="alt">
              Subscribed to the MD Pickleball newsletter? Just reply with{" "}
              <code>I&apos;m in</code> + one sentence on why. We&apos;ll take it
              from there.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
