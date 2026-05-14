const PILLARS = [
  {
    num: "1",
    title: "Matched, not random",
    body: "Skill, vibe, and schedule matched. No more mismatched mixers or WhatsApp roulette.",
  },
  {
    num: "2",
    title: "Games that move you forward",
    body: "Every match is picked to push you, not plateau you. Even social play moves you forward by being consistent and fun.",
  },
  {
    num: "3",
    title: "Real people, real community",
    body: "Not an app full of strangers. Players you'll actually see on the court Thursday night.",
  },
];

export default function Why() {
  return (
    <section className="why" id="why">
      <div className="wrap why-grid">
        <div>
          <div className="eyebrow">Why Link &amp; Dink</div>
          <h2>
            You shouldn&apos;t need an <span className="lime">invite</span> to
            play a good game.
          </h2>
          <p className="why-lede">
            The best games in any pickleball community are in private group
            chats you&apos;re not in. Long waits, mismatched rotations, one
            decent game per session — that&apos;s what happens when access is
            gatekept.
          </p>
          <p className="why-lede">
            Link &amp; Dink is the platform that opens the door. Matched games,
            curated groups, and a community where you don&apos;t have to know the
            right person to play a great game.
          </p>
        </div>
        <ol className="pillars">
          {PILLARS.map((pillar) => (
            <li className="pillar" key={pillar.num}>
              <span className="pillar-num">{pillar.num}</span>
              <div>
                <h4>{pillar.title}</h4>
                <p>{pillar.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
