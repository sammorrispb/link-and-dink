import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import {
  MEMBER,
  THIS_WEEK,
  OPEN_EVENTS,
  MENTOR_LOG,
  CERT,
  EARNINGS,
} from "@/lib/coach-up/mock-dashboard";

export const metadata: Metadata = {
  title: "Coach Up Dashboard | Link & Dink",
  robots: { index: false, follow: false },
};

// Gated by proxy.ts (admin-cookie). v1 renders seeded mock data — real
// per-member data arrives with the product app and coach_up_members table.
export default function CoachUpDashboardPage() {
  return (
    <>
      <Nav />
      <main>
        <section className="dash">
          <div className="wrap">
            <div className="dash-header">
              <div>
                <h1>Welcome back, {MEMBER.firstName}.</h1>
                <div className="meta">{MEMBER.cohortLabel}</div>
              </div>
              <div className="dash-pill">
                <span className="dot" /> Active member
              </div>
            </div>

            <div className="dash-grid">
              {/* LEFT COLUMN */}
              <div className="dash-col">
                <div className="dash-card">
                  <div className="dash-card-head">
                    <h3>This week</h3>
                    <span className="link">See full calendar →</span>
                  </div>
                  <div className="this-week">
                    {THIS_WEEK.map((item) => (
                      <div className="tw-item" key={item.title}>
                        <div className="kind">{item.kind}</div>
                        <h4>{item.title}</h4>
                        <div className="when">{item.when}</div>
                        <p>{item.note}</p>
                        <button className="claim-btn" type="button">
                          {item.cta}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="dash-card">
                  <div className="dash-card-head">
                    <h3>Open events · claim what you&apos;ll run</h3>
                    <span className="link">Filter →</span>
                  </div>
                  <table className="events-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Venue</th>
                        <th>Court tier</th>
                        <th>Suggested fee</th>
                        <th>RSVPs</th>
                        <th>Your take</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {OPEN_EVENTS.map((e) => (
                        <tr key={`${e.date}-${e.venue}`}>
                          <td className="date">{e.date}</td>
                          <td>{e.venue}</td>
                          <td>
                            <span className={`tier-tag tier-${e.tier}`}>
                              {e.tierLabel}
                            </span>
                          </td>
                          <td>{e.fee}</td>
                          <td>{e.rsvps}</td>
                          <td className="take">{e.take}</td>
                          <td>
                            <button className="claim-btn" type="button">
                              Claim ▸
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="dash-card">
                  <div className="dash-card-head">
                    <h3>Lessons + clinics — your own practice</h3>
                    <span className="link">Past listings →</span>
                  </div>
                  <div className="quicktools">
                    <button className="qt-btn" type="button">
                      <div className="label">+ New private lesson</div>
                      <div className="title">Publish a 1:1 slot</div>
                    </button>
                    <button className="qt-btn" type="button">
                      <div className="label">+ New clinic</div>
                      <div className="title">Post to L&amp;D event feed</div>
                    </button>
                  </div>
                  <div className="qt-foot">
                    <strong>You keep 100%.</strong> L&amp;D doesn&apos;t touch
                    revenue from lessons or clinics — we just help you fill them.
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="dash-col">
                <div className="dash-card">
                  <div className="dash-card-head">
                    <h3>Mentorship log</h3>
                    <span className="link">All notes →</span>
                  </div>
                  {MENTOR_LOG.map((entry) => (
                    <div className="ml-entry" key={entry.date}>
                      <div className="ml-head">
                        <span className="ml-date">{entry.date}</span>
                        {entry.tags.map((tag) => (
                          <span className="ml-tag" key={tag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                      <p>{entry.note}</p>
                    </div>
                  ))}
                </div>

                <div className="dash-card">
                  <div className="dash-card-head">
                    <h3>Certification</h3>
                    <span className="link">Resources →</span>
                  </div>
                  <div className="cert-card">
                    <div>
                      <div className="qt-foot" style={{ marginBottom: 6 }}>
                        {CERT.pathway}
                      </div>
                      <div style={{ color: "var(--smoke)", fontWeight: 700 }}>
                        {CERT.detail}
                      </div>
                    </div>
                    <span className="cert-status">{CERT.status}</span>
                  </div>
                  <p className="cert-note">
                    L&amp;D doesn&apos;t cover the cost — but we&apos;ll help you
                    pick the right level and study what matters.
                  </p>
                </div>

                <div className="dash-card">
                  <div className="dash-card-head">
                    <h3>Earnings · {EARNINGS.month}</h3>
                    <span className="link">Export CSV →</span>
                  </div>
                  <div className="ledger">
                    {EARNINGS.cells.map((cell) => (
                      <div className="ledger-cell" key={cell.label}>
                        <div className="label">{cell.label}</div>
                        <div className="amt">{cell.amt}</div>
                        <div className="hours">{cell.hours}</div>
                      </div>
                    ))}
                  </div>
                  <p className="ledger-foot">
                    Visibility only — Coach Up doesn&apos;t custodian payments.
                    You collect direct.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
