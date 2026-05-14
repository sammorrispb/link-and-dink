"use client";

import { useState } from "react";

/**
 * Tell-a-friend share control. Uses the Web Share API where available, falls
 * back to copying the event URL to the clipboard.
 */
export function ShareLink({
  slug,
  label = "⤴ Tell a friend who plays your level",
}: {
  slug: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = `${window.location.origin}/pot/${slug}`;
    const shareData = {
      title: "The Pickleball Pot Popup by Link & Dink",
      text: "Pickleball's smallest bracket. Winner takes the pot.",
      url,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // User dismissed the share sheet, or clipboard was blocked — no-op.
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="text-[12px] font-bold text-text-muted transition-colors hover:text-text"
    >
      {copied ? "✓ Link copied" : label}
    </button>
  );
}
