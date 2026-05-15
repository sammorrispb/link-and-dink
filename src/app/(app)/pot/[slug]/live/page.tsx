import { notFound, redirect } from "next/navigation";
import { MobileShell } from "@/components/pot/MobileShell";
import { TopBar } from "@/components/pot/TopBar";
import { ensureAccount } from "@/lib/account";
import { createClient } from "@/lib/supabase/server";
import { hydrateTournamentEvent } from "@/lib/tournament-live";
import { LiveClient } from "./LiveClient";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function LivePage({ params }: PageProps) {
  const { slug } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/pot/${slug}/rsvp`);

  const account = await ensureAccount(supabase);
  const hydrated = await hydrateTournamentEvent(supabase, slug);
  if (!hydrated) notFound();

  if (hydrated.event.organizer_account_id !== account.id) {
    redirect(`/pot/${slug}`);
  }

  return (
    <MobileShell>
      <TopBar brand="pot-night" backHref={`/pot/${slug}/confirmed`} />
      <LiveClient
        slug={slug}
        initialTournament={hydrated.tournament}
        initialTeams={hydrated.teams}
        initialPairing={hydrated.pairing}
        roster={hydrated.roster.map(({ player, rsvp }) => ({
          playerId: player.id,
          displayName: player.display_name,
          rsvpStatus: rsvp.status,
        }))}
        format={hydrated.event.format}
        eventTitle={hydrated.event.title}
      />
    </MobileShell>
  );
}
