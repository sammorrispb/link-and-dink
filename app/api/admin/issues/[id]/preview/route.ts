import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/admin/guard";
import { renderEmail } from "@/lib/email/render";
import { UNSUBSCRIBE_PLACEHOLDER } from "@/lib/email/template";

type RouteContext = { params: Promise<{ id: string }> };

/** Returns the accurate, as-sent email HTML for the admin preview iframe. */
export async function POST(request: Request, { params }: RouteContext) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const { id } = await params;

  const supabase = getServiceClient();
  const { data: issue } = await supabase
    .from("issues")
    .select("subject, preview_text, body_markdown")
    .eq("id", id)
    .maybeSingle();

  if (!issue) {
    return NextResponse.json({ error: "Issue not found." }, { status: 404 });
  }

  const { html } = renderEmail(issue);
  // No real recipient in a preview — neutralize the unsubscribe placeholder.
  const display = html.replaceAll(UNSUBSCRIBE_PLACEHOLDER, "#");
  return NextResponse.json({ html: display });
}
