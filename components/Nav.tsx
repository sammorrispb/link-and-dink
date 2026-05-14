import Logo from "./brand/Logo";

export default function Nav() {
  return (
    <header className="nav">
      <div className="wrap nav-row">
        <Logo />
        <nav className="nav-links">
          <a href="#play">How you play</a>
          <a href="#why">Why L&amp;D</a>
          <a href="#newsletter">Newsletter</a>
          <a href="#newsletter" className="nav-cta">
            Play up &rarr;
          </a>
        </nav>
      </div>
    </header>
  );
}
