import Logo from "./brand/Logo";

const FOOT_COLUMNS = [
  {
    heading: "Play",
    links: [
      { label: "Curated groups", href: "#" },
      { label: "Matched games", href: "#" },
      { label: "Find a partner", href: "#" },
      { label: "Tonight's games", href: "#" },
    ],
  },
  {
    heading: "Grow",
    links: [
      { label: "New to pickleball", href: "#" },
      { label: "Get rated", href: "#" },
      { label: "Youth · Next Gen", href: "#" },
      { label: "Coach Up", href: "/coach-up" },
    ],
  },
  {
    heading: "Connect",
    links: [
      { label: "Newsletter", href: "#newsletter" },
      { label: "Past issues", href: "/weekly" },
      { label: "Instagram", href: "#" },
      { label: "Facebook · MoCo", href: "#" },
      { label: "hello@linkanddink.com", href: "mailto:hello@linkanddink.com" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-brand">
            <Logo />
            <p>
              Matched games and curated groups across the DMV. Powered by JOOLA.
              Launching in MoCo.
            </p>
          </div>
          {FOOT_COLUMNS.map((column) => (
            <div key={column.heading}>
              <h4>{column.heading}</h4>
              {column.links.map((link) => (
                <a key={link.label} href={link.href}>
                  {link.label}
                </a>
              ))}
            </div>
          ))}
        </div>
        <div className="foot-bottom">
          <span>© 2026 Link &amp; Dink · Powered by JOOLA</span>
          <span>Play up. · DMV · DC · MD · VA</span>
        </div>
      </div>
    </footer>
  );
}
