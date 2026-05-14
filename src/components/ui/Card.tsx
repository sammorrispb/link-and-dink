import type { ReactNode } from "react";

type CardVariant = "default" | "feature" | "lime";

const variants: Record<CardVariant, string> = {
  default: "bg-surface-2 border border-border-subtle",
  feature: "bg-[linear-gradient(160deg,#07332a_0%,#044026_100%)] border border-border-medium",
  lime: "bg-lime text-action-text border border-transparent",
};

export function Card({
  children,
  variant = "default",
  className = "",
}: {
  children: ReactNode;
  variant?: CardVariant;
  className?: string;
}) {
  return <div className={`rounded-card p-4 ${variants[variant]} ${className}`}>{children}</div>;
}
