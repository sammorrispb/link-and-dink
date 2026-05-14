import { redirect } from "next/navigation";
import { MobileShell } from "@/components/pot/MobileShell";
import { TopBar } from "@/components/pot/TopBar";
import { getFeaturedEventSlug } from "@/lib/events";

export const dynamic = "force-dynamic";

// Phase 1: the bare landing route funnels straight to the current Pot Night.
// A standalone marketing landing page is deferred.
export default async function LandingPage() {
  const slug = await getFeaturedEventSlug();
  if (slug) redirect(`/pot/${slug}`);

  return (
    <MobileShell>
      <TopBar brand="link-and-dink" icon="☰" />
      <main className="flex flex-1 flex-col items-center justify-center px-[18px] text-center">
        <h1 className="text-[24px] font-black text-text">No Pot Night scheduled</h1>
        <p className="mt-2 text-[14px] text-text-muted">
          Check back soon — the next bracket is being set.
        </p>
      </main>
    </MobileShell>
  );
}
