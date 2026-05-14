import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/admin/guard";
import { slugify } from "@/lib/newsletter/slug";

export async function POST(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const data = (body ?? {}) as Record<string, unknown>;
  const title = typeof data.title === "string" ? data.title.trim() : "";
  const subject =
    typeof data.subject === "string" && data.subject.trim()
      ? data.subject.trim()
      : title;
  const previewText =
    typeof data.preview_text === "string" ? data.preview_text.trim() : null;
  const bodyMarkdown =
    typeof data.body_markdown === "string" ? data.body_markdown : "";

  if (!title) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }

  const supabase = getServiceClient();

  let slug = slugify(title) || "issue";
  const { data: clash } = await supabase
    .from("issues")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (clash) {
    slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
  }

  const { data: created, error } = await supabase
    .from("issues")
    .insert({
      title,
      subject,
      slug,
      preview_text: previewText,
      body_markdown: bodyMarkdown,
    })
    .select("id")
    .single();

  if (error || !created) {
    console.error("[admin:issues:create]", error?.message);
    return NextResponse.json(
      { error: "Couldn't create the issue." },
      { status: 500 },
    );
  }

  return NextResponse.json({ id: created.id });
}
