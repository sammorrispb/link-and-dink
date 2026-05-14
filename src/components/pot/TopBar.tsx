import { Logo } from "@/components/ui/Logo";

/**
 * App chrome bar. `brand="link-and-dink"` shows the paddle-pair mark + the
 * Link & Dink wordmark (discovery page); `brand="pot-night"` shows the single
 * mark + "Pot Night" (confirmation page).
 */
export function TopBar({
  brand = "link-and-dink",
  icon = "☰",
}: {
  brand?: "link-and-dink" | "pot-night";
  icon?: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border-subtle px-[18px] py-2.5">
      <div className="flex items-center gap-2">
        <Logo size={24} variant={brand === "pot-night" ? "single" : "paddles"} />
        <span className="text-[14px] font-extrabold text-text">
          {brand === "pot-night" ? (
            "Pot Night"
          ) : (
            <>
              Link <span className="text-lime">&amp;</span> Dink
            </>
          )}
        </span>
      </div>
      <div className="flex h-8 w-8 items-center justify-center rounded-[10px] border border-border-subtle bg-[rgba(181,214,84,0.08)] text-lime">
        {icon}
      </div>
    </div>
  );
}
