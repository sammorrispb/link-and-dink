import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { MobileShell } from "@/components/pot/MobileShell";
import { SignInForm } from "@/components/pot/SignInForm";
import { TopBar } from "@/components/pot/TopBar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/server";
import { rsvpCookieName, verifyRsvpCookie } from "@/lib/tokens";
import { claimPlayerAction } from "./actions";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ event?: string }>;
}

export default async function ClaimPage({ searchParams }: PageProps) {
  const { event: slugParam } = await searchParams;
  const slug = (slugParam ?? "").replace(/[^a-z0-9-]/gi, "");

  const cookieStore = await cookies();
  const payload = verifyRsvpCookie(cookieStore.get(rsvpCookieName)?.value);
  if (!payload) redirect(slug ? `/pot/${slug}/rsvp` : "/pot");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const next = slug ? `/claim?event=${encodeURIComponent(slug)}` : "/claim";
    return (
      <MobileShell>
        <TopBar brand="pot-night" icon="⌃" backHref={slug ? `/pot/${slug}/confirmed` : "/pot"} />
        <main className="no-scrollbar flex-1 overflow-y-auto px-[18px] pb-[100px] pt-4">
          <h1 className="mb-1 text-[26px] font-black leading-tight tracking-[-0.03em]">
            Save your profile
          </h1>
          <p className="mb-4 text-[14px] text-text-muted">
            Tap the magic link to link this RSVP to your email. Next time, you&apos;ll skip the
            form.
          </p>
          <SignInForm redirectTo={next} />
        </main>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <TopBar brand="pot-night" icon="⌃" backHref={slug ? `/pot/${slug}/confirmed` : "/pot"} />
      <main className="no-scrollbar flex-1 overflow-y-auto px-[18px] pb-[100px] pt-4">
        <h1 className="mb-1 text-[26px] font-black leading-tight tracking-[-0.03em]">
          Link this RSVP?
        </h1>
        <p className="mb-4 text-[14px] text-text-muted">
          Signed in as <strong className="text-text">{user.email}</strong>.
        </p>
        <Card>
          <p className="text-[13px] text-text">
            We&apos;ll link your current RSVP to this email so future events pre-fill your name,
            phone, and Venmo.
          </p>
          <form action={claimPlayerAction} className="mt-3">
            <input type="hidden" name="slug" value={slug} />
            <Button type="submit">Link RSVP to {user.email}</Button>
          </form>
        </Card>
      </main>
    </MobileShell>
  );
}
