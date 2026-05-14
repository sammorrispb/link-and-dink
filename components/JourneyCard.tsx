import JourneyIcon, { type JourneyIconSlug } from "./brand/JourneyIcon";

export type Journey = {
  slug: JourneyIconSlug;
  title: string;
  body: string;
  cta: string;
  href: string;
};

export default function JourneyCard({ slug, title, body, cta, href }: Journey) {
  return (
    <a href={href} className="journey-card">
      <span className="journey-icon" aria-hidden="true">
        <JourneyIcon slug={slug} />
      </span>
      <h3>{title}</h3>
      <p>{body}</p>
      <span className="arrow">{cta}</span>
    </a>
  );
}
