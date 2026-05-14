import type { ReactNode } from "react";

type PillVariant = "default" | "solid" | "amber" | "muted";

const variants: Record<PillVariant, string> = {
  default: "bg-[rgba(181,214,84,0.10)] text-lime border border-border-medium",
  solid: "bg-lime text-action-text border border-transparent",
  amber: "bg-[rgba(254,209,68,0.12)] text-yellow border border-[rgba(254,209,68,0.30)]",
  muted: "bg-[rgba(255,253,250,0.06)] text-text-muted border border-[rgba(255,253,250,0.10)]",
};

export function Pill({
  children,
  variant = "default",
  className = "",
}: {
  children: ReactNode;
  variant?: PillVariant;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.04em] leading-none ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
