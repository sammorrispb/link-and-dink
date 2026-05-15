"use client";

import { useState } from "react";
import { Button } from "./Button";

type Variant = "primary" | "secondary" | "ghost";

export function CopyButton({
  text,
  label,
  copiedLabel = "Copied",
  variant = "secondary",
  size = "compact",
}: {
  text: string;
  label: string;
  copiedLabel?: string;
  variant?: Variant;
  size?: "full" | "compact";
}) {
  const [state, setState] = useState<"idle" | "ok" | "err">("idle");

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(text);
      setState("ok");
      setTimeout(() => setState("idle"), 1400);
    } catch {
      setState("err");
      setTimeout(() => setState("idle"), 1800);
    }
  }

  return (
    <Button type="button" variant={variant} size={size} onClick={handleClick} aria-live="polite">
      {state === "ok" ? copiedLabel : state === "err" ? "Copy failed" : label}
    </Button>
  );
}
