import type { Route } from "next";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

/**
 * App chrome bar. `brand="link-and-dink"` shows the paddle-pair mark + the
 * Link & Dink wordmark (discovery page); `brand="pot-night"` shows the single
 * mark + the "P3" short brand (RSVP / confirmation pages).
 *
 * Pass `backHref` on sub-pages — the left cluster becomes a back link so the
 * user isn't stranded without browser-back.
 */
export function TopBar({
  brand = "link-and-dink",
  icon = "☰",
  backHref,
}: {
  brand?: "link-and-dink" | "pot-night";
  icon?: string;
  backHref?: string;
}) {
  const wordmark =
    brand === "pot-night" ? (
      "P3"
    ) : (
      <>
        Link <span className="text-lime">&amp;</span> Dink
      </>
    );
  const mark = (
    <>
      <Logo size={24} variant={brand === "pot-night" ? "single" : "paddles"} />
      <span className="text-[14px] font-extrabold text-text">{wordmark}</span>
    </>
  );

  return (
    <div className="flex items-center justify-between border-b border-border-subtle px-[18px] py-2.5">
      {backHref ? (
        <Link
          href={backHref as Route}
          aria-label="Back"
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <span className="text-[18px] leading-none text-lime" aria-hidden="true">
            ←
          </span>
          {mark}
        </Link>
      ) : (
        <div className="flex items-center gap-2">{mark}</div>
      )}
      <div className="flex h-8 w-8 items-center justify-center rounded-[10px] border border-border-subtle bg-[rgba(181,214,84,0.08)] text-lime">
        {icon}
      </div>
    </div>
  );
}
