import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/admin/guard";
import { renderEmail } from "@/lib/email/render";
import { UNSUBSCRIBE_PLACEHOLDER } from "@/lib/email/template";
import { getEmailProvider } from "@/lib/email";
import { siteUrl } from "@/lib/email/links";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type RouteContext = { params: Promise<{ id: string }> };

/** Send a single test copy of an issue to an address the operator types in. */
export async function POST(request: Request, { params }: RouteContext) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const to =
    typeof (body as Record<string, unknown>)?.to === "string"
      ? ((body as Record<string, string>).to.trim().toLowerCase())
      : "";
  if (!EMAIL_RE.test(to)) {
    return NextResponse.json(
      { error: "Enter a valid test email address." },
      { status: 400 },
    );
  }

  const supabase = getServiceClient();
  const { data: issue } = await supabase
    .from("issues")
    .select("subject, preview_text, body_markdown")
    .eq("id", id)
    .maybeSingle();

  if (!issue) {
    return NextResponse.json({ error: "Issue not found." }, { status: 404 });
  }

  const { html, text } = renderEmail(issue);
  // No real subscriber behind a test — point the unsubscribe link at the site.
  const home = siteUrl("/");
  const result = await getEmailProvider().send({
    to,
    subject: `[TEST] ${issue.subject}`,
    html: html.replaceAll(UNSUBSCRIBE_PLACEHOLDER, home),
    text: text.replaceAll(UNSUBSCRIBE_PLACEHOLDER, home),
  });

  if ("error" in result) {
    console.error("[admin:issues:test]", result.error);
    return NextResponse.json(
      { error: "Couldn't send the test." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
