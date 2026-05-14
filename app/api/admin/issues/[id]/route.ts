import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/admin/guard";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const { id } = await params;

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
  // Only draft issues are editable — guard the status in the WHERE clause.
  const { data: updated, error } = await supabase
    .from("issues")
    .update({
      title,
      subject,
      preview_text: previewText,
      body_markdown: bodyMarkdown,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("status", "draft")
    .select("id");

  if (error) {
    console.error("[admin:issues:update]", error.message);
    return NextResponse.json(
      { error: "Couldn't save the issue." },
      { status: 500 },
    );
  }
  if (!updated || updated.length === 0) {
    return NextResponse.json(
      { error: "Only draft issues can be edited." },
      { status: 409 },
    );
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const { id } = await params;

  const supabase = getServiceClient();
  // Only drafts can be deleted — sent issues live on in the public archive.
  const { data: deleted, error } = await supabase
    .from("issues")
    .delete()
    .eq("id", id)
    .eq("status", "draft")
    .select("id");

  if (error) {
    console.error("[admin:issues:delete]", error.message);
    return NextResponse.json(
      { error: "Couldn't delete the issue." },
      { status: 500 },
    );
  }
  if (!deleted || deleted.length === 0) {
    return NextResponse.json(
      { error: "Only draft issues can be deleted." },
      { status: 409 },
    );
  }

  return NextResponse.json({ ok: true });
}
