import { notFound } from "next/navigation";
import { cache } from "react";
import { FeaturedEvent } from "@/components/pot/FeaturedEvent";
import { FinalCta } from "@/components/pot/FinalCta";
import { HeroSection } from "@/components/pot/HeroSection";
import { HowItWorks } from "@/components/pot/HowItWorks";
import { MobileShell } from "@/components/pot/MobileShell";
import { MoreUpcoming } from "@/components/pot/MoreUpcoming";
import { OrganizerCard } from "@/components/pot/OrganizerCard";
import { PastEvents } from "@/components/pot/PastEvents";
import { PotBar } from "@/components/pot/PotBar";
import { TopBar } from "@/components/pot/TopBar";
import { TrustGrid } from "@/components/pot/TrustGrid";
import { WhoCanPlay } from "@/components/pot/WhoCanPlay";
import { getEventWithRoster, getPastResults, getUpcomingEvents } from "@/lib/events";
import { formatEventDateTime } from "@/lib/format";

// Phase 1: live data on every request, no ISR yet.
export const dynamic = "force-dynamic";

// Deduped across generateMetadata + the page render within one request.
const loadEvent = cache(getEventWithRoster);

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const data = await loadEvent(slug);
  if (!data) {
    return { title: "Pot Night — event not found" };
  }

  const { event } = data;
  const title = `${event.title} — ${formatEventDateTime(event.startsAt)}`;
  const description =
    "Pickleball's smallest bracket. Real cash, paid same night. Winner takes the pot.";
  const ogImage = `/api/og/${event.slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website" as const,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function PotDiscoveryPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await loadEvent(slug);
  if (!data) notFound();

  const { event, roster, confirmedCount, spotsLeft } = data;
  const [pastResults, upcoming] = await Promise.all([
    getPastResults(3),
    getUpcomingEvents({ excludeId: event.id, limit: 3 }),
  ]);

  return (
    <MobileShell>
      <TopBar brand="link-and-dink" icon="☰" />
      <main className="no-scrollbar flex-1 overflow-y-auto px-[18px] pb-[100px] pt-4">
        <HeroSection />
        <FeaturedEvent
          event={event}
          roster={roster}
          confirmedCount={confirmedCount}
          spotsLeft={spotsLeft}
        />
        <HowItWorks />
        <PotBar event={event} />
        <WhoCanPlay />
        <TrustGrid />
        <OrganizerCard />
        <PastEvents results={pastResults} />
        <MoreUpcoming events={upcoming} />
        <FinalCta event={event} spotsLeft={spotsLeft} />
        <p className="mt-3 text-center text-[11px] text-text-dim">
          By Coach Up organizer · Sam M. · Pot Night by Link &amp; Dink
        </p>
      </main>
    </MobileShell>
  );
}
