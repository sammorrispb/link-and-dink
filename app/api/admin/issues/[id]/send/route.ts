import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/guard";
import { enqueueIssue } from "@/lib/newsletter/enqueue";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * Queue an issue for sending. The actual sending is done by the cron drain —
 * this just hands off to `enqueueIssue`, which atomically guards the
 * draft -> sending transition and fans out the per-recipient rows.
 */
export async function POST(request: Request, { params }: RouteContext) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const { id } = await params;

  const result = await enqueueIssue(id);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true, recipientCount: result.recipientCount });
}
