import SignupCard from "./SignupCard";

export default function Hero() {
  return (
    <section className="hero">
      <div className="wrap hero-grid">
        <div>
          <div className="eyebrow">
            <span className="dot" />
            DMV · Powered by JOOLA
          </div>
          <h1>
            Pickleball is the friendliest sport going. The hard part is finding{" "}
            <span className="lime">your people.</span>
          </h1>
          <p className="hero-lede">
            Day one, everyone waves you onto a court. Day fifty, when you want a
            regular crew at your level and games that push you forward — that&apos;s
            where most players get stuck. Link &amp; Dink matches you to the
            right games and curated groups across the DMV.{" "}
            <strong style={{ color: "var(--smoke)", fontWeight: 700 }}>
              Play up.
            </strong>
          </p>
          <div className="hero-actions">
            <a href="#newsletter" className="btn btn-primary">
              Get matched &rarr;
            </a>
            <a href="#play" className="btn btn-secondary">
              See how it works
            </a>
          </div>
          <div className="hero-trust">
            <span className="joola-tag">Powered by JOOLA</span>
            <span className="sep" />
            <span>Free weekly newsletter</span>
            <span className="sep" />
            <span>Launching in MoCo</span>
          </div>
        </div>

        <aside className="signup-card" id="newsletter-hero">
          <h3>Link &amp; Dink Weekly</h3>
          <p className="signup-meta">
            Thursdays at 7am. Curated games this week, who&apos;s playing where,
            one drill, one rule, one local pick.
          </p>
          <SignupCard />
        </aside>
      </div>
    </section>
  );
}
