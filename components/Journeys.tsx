import JourneyCard, { type Journey } from "./JourneyCard";
import TonightStrip from "./TonightStrip";

const JOURNEYS: Journey[] = [
  {
    slug: "intro",
    title: "Intro to pickleball",
    body: "First paddle, first session, first 90 days. Learn the rules, get your level, find your first crew — without a four-rotation wait or a 4.0 mixed in by accident.",
    cta: "Start here",
    href: "#",
  },
  {
    slug: "improve",
    title: "Improve · coach",
    body: 'Clinics, coach-rated DUPR sessions, and curated weekly groups with people at your level. The fastest path from "still here" to "playing up."',
    cta: "Get better",
    href: "#",
  },
  {
    slug: "play",
    title: "Play",
    body: "Matched games and standing groups across the DMV. Filtered by DUPR, vetted by a coach. Show up, play four real games, go home.",
    cta: "Find a game",
    href: "#",
  },
];

export default function Journeys() {
  return (
    <section className="journeys" id="play">
      <div className="wrap">
        <div className="section-head">
          <div className="eyebrow">How you play</div>
          <h2>Three ways in.</h2>
          <p>
            Pick where you are. Link &amp; Dink builds the rails for the rest.
          </p>
        </div>

        <div className="journey-grid">
          {JOURNEYS.map((journey) => (
            <JourneyCard key={journey.slug} {...journey} />
          ))}
        </div>

        <TonightStrip />
      </div>
    </section>
  );
}
