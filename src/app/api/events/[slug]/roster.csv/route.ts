import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getRosterForExport } from "@/lib/events";
import { requireOrganizer } from "@/lib/organizer";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const COLUMNS = [
  "first_name",
  "last_name",
  "display_name",
  "phone",
  "venmo",
  "email",
  "dupr_id",
  "dupr_rating",
  "child_first_name",
  "child_last_name",
  "child_birthdate",
  "guardian_consent",
  "guardian_consent_at",
  "rsvp_status",
  "payment_status",
  "position",
  "rsvp_created_at",
] as const;

function csvCell(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const url = new URL(request.url);
  const includeCanceled = url.searchParams.get("includeCanceled") === "1";

  const supabase = await createClient();
  const account = await requireOrganizer(supabase);

  const data = await getRosterForExport(slug, { includeCanceled });
  if (!data) return new NextResponse("not_found", { status: 404 });
  if (data.event.organizerAccountId !== account.id) {
    return new NextResponse("forbidden", { status: 403 });
  }

  const lines: string[] = [COLUMNS.join(",")];
  for (const r of data.rows) {
    lines.push(
      [
        r.firstName,
        r.lastName,
        r.displayName,
        r.phone,
        r.venmoHandle,
        r.email,
        r.duprId,
        r.duprRating,
        r.childFirstName,
        r.childLastName,
        r.childBirthdate,
        r.guardianConsent,
        r.guardianConsentAt,
        r.rsvpStatus,
        r.paymentStatus,
        r.position,
        r.rsvpCreatedAt,
      ]
        .map(csvCell)
        .join(","),
    );
  }
  const body = `${lines.join("\n")}\n`;

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${slug}-roster.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
