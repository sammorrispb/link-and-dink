import { MobileShell } from "@/components/pot/MobileShell";
import { TopBar } from "@/components/pot/TopBar";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <MobileShell>
      <TopBar brand="link-and-dink" icon="☰" />
      <main className="flex flex-1 flex-col items-center justify-center px-[18px] text-center">
        <h1 className="text-[26px] font-black tracking-[-0.03em] text-text">Not found</h1>
        <p className="mt-2 text-[14px] text-text-muted">
          That Pot Night doesn&apos;t exist — or it&apos;s been called off.
        </p>
        <div className="mt-5 w-full max-w-[280px]">
          <Button href="/">See the current Pot Night</Button>
        </div>
      </main>
    </MobileShell>
  );
}
