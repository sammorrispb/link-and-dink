const STATS = [
  { num: "3.0–4.0", label: "Hero player range" },
  // Replaces the original "17 Dill Dinkers courts" stat — neutral DMV rollout
  // stat instead, per the no-DD-references rule for Sam's personal sites.
  { num: "MoCo", label: "Launching first — DMV next" },
  { num: "3,000+", label: "DMV players Sam's coached" },
  { num: "JOOLA", label: "Sponsored partner" },
];

export default function Stats() {
  return (
    <section className="stats">
      <div className="wrap stats-row">
        {STATS.map((stat) => (
          <div className="stat" key={stat.label}>
            <div className="stat-num">{stat.num}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
