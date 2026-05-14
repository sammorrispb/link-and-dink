import SignupCard from "./SignupCard";

export default function NewsletterReprise() {
  return (
    <section className="newsletter" id="newsletter">
      <div className="wrap">
        <div className="newsletter-card">
          <div className="eyebrow">The weekly</div>
          <h2>One email. Every Thursday. Better games.</h2>
          <p>
            Link &amp; Dink Weekly is your DMV pickleball edit — matched sessions
            worth showing up to, a drill of the week, a featured player, and a
            local pick. Specific, useful, short.
          </p>
          <SignupCard source="homepage_reprise" />
        </div>
      </div>
    </section>
  );
}
