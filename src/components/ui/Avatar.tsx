import type { ReactNode } from "react";

export type AvatarColor = "default" | "amber" | "pink" | "lime" | "violet";
type AvatarSize = "sm" | "md" | "lg";

const colors: Record<AvatarColor, string> = {
  default: "bg-deep-purple text-violet",
  amber: "bg-[rgba(254,209,68,0.16)] text-yellow",
  pink: "bg-[rgba(245,182,209,0.16)] text-pink",
  lime: "bg-[rgba(181,214,84,0.16)] text-lime",
  violet: "bg-[rgba(181,175,241,0.16)] text-violet",
};

const sizes: Record<AvatarSize, string> = {
  sm: "h-7 w-7 text-[11px]",
  md: "h-9 w-9 text-[13px]",
  lg: "h-14 w-14 text-[18px]",
};

export function Avatar({
  children,
  color = "default",
  size = "md",
  className = "",
}: {
  children: ReactNode;
  color?: AvatarColor;
  size?: AvatarSize;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full border-2 border-bg font-extrabold ${colors[color]} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  );
}

/** Overlapping row of avatars — each after the first slides left 10px. */
export function AvatarStack({ children }: { children: ReactNode }) {
  return <div className="flex [&>*:not(:first-child)]:-ml-2.5">{children}</div>;
}

/** Stable color pick by roster index, matching the mockup's SK/MR/LT/DJ order. */
const ROTATION: AvatarColor[] = ["amber", "violet", "pink", "lime"];
export function avatarColorFor(index: number): AvatarColor {
  return ROTATION[index % ROTATION.length] ?? "default";
}
