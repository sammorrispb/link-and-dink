import type { ReactNode } from "react";

/**
 * Mobile-first column. Fills the viewport on phones; on desktop it caps at
 * ~640px and centers, with a subtle spruce -> green-black gradient filling the
 * rest of the viewport (per the design brief).
 */
export function MobileShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-[linear-gradient(180deg,#0a2c1d_0%,#01160d_60%)]">
      <div className="mx-auto flex min-h-screen w-full max-w-[640px] flex-col bg-green-black shadow-[0_0_80px_rgba(0,0,0,0.45)]">
        {children}
      </div>
    </div>
  );
}
