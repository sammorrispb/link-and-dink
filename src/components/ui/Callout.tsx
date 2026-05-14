import type { ReactNode } from "react";

/**
 * Dashed lime-tint info box. Pass `lead` for the bolded opening phrase
 * (rendered in full-strength text) followed by muted body copy.
 */
export function Callout({
  lead,
  children,
  className = "",
}: {
  lead?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[10px] border border-dashed border-border-medium bg-[rgba(181,214,84,0.07)] px-3 py-2.5 text-[12px] leading-relaxed text-text-muted ${className}`}
    >
      {lead ? <strong className="text-text">{lead}</strong> : null}
      {lead ? " " : null}
      {children}
    </div>
  );
}
