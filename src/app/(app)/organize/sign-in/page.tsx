import { redirect } from "next/navigation";
import { MobileShell } from "@/components/pot/MobileShell";
import { SignInForm } from "@/components/pot/SignInForm";
import { TopBar } from "@/components/pot/TopBar";
import { isOrganizerEmail } from "@/lib/organizer";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function OrganizerSignInPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user?.email && isOrganizerEmail(user.email)) redirect("/organize");

  return (
    <MobileShell>
      <TopBar brand="pot-night" icon="⌃" backHref="/pot" />
      <main className="no-scrollbar flex-1 overflow-y-auto px-[18px] pb-[100px] pt-4">
        <h1 className="mb-1 text-[26px] font-black leading-tight tracking-[-0.03em]">
          Organizer sign-in
        </h1>
        <p className="mb-4 text-[14px] text-text-muted">
          Magic link for hosts — players don&apos;t need this.
        </p>
        <SignInForm redirectTo="/organize" />
        {user?.email && !isOrganizerEmail(user.email) ? (
          <p className="mt-4 text-center text-[12px] text-danger">
            Signed in as {user.email}, but that email isn&apos;t on the organizer allowlist.
          </p>
        ) : null}
      </main>
    </MobileShell>
  );
}
