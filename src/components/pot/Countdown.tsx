"use client";

import { useEffect, useState } from "react";
import { formatCountdown } from "@/lib/format";

/**
 * Live "2 days, 4 hrs, 19 min" countdown, rendered as a bold inline span.
 * Seeded with a server-computed value, then re-synced on mount and every minute.
 */
export function Countdown({ targetIso, initialText }: { targetIso: string; initialText: string }) {
  const [text, setText] = useState(initialText);

  useEffect(() => {
    setText(formatCountdown(targetIso));
    const id = setInterval(() => {
      setText(formatCountdown(targetIso));
    }, 60_000);
    return () => clearInterval(id);
  }, [targetIso]);

  return (
    <strong className="text-text" suppressHydrationWarning>
      {text}
    </strong>
  );
}
