import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="logo">
      <span className="logo-mark" aria-hidden="true">
        <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" fill="none">
          {/* Left paddle */}
          <g transform="rotate(-22 20 26)">
            <ellipse cx="13" cy="18" rx="7" ry="8.5" fill="#CAF368" />
            <rect x="10.5" y="24" width="5" height="11" rx="1.8" fill="#CAF368" />
          </g>
          {/* Right paddle */}
          <g transform="rotate(22 20 26)">
            <ellipse cx="27" cy="18" rx="7" ry="8.5" fill="#CAF368" />
            <rect x="24.5" y="24" width="5" height="11" rx="1.8" fill="#CAF368" />
          </g>
          {/* Ball */}
          <circle cx="20" cy="9" r="5" fill="#fffdfa" />
          <circle cx="18" cy="7.5" r="0.7" fill="#01160d" />
          <circle cx="20.5" cy="7" r="0.7" fill="#01160d" />
          <circle cx="22.3" cy="9" r="0.7" fill="#01160d" />
          <circle cx="19" cy="10.5" r="0.7" fill="#01160d" />
        </svg>
      </span>
      <span>Link &amp; Dink</span>
    </Link>
  );
}
