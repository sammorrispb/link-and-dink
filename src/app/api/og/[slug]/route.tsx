import { ImageResponse } from "next/og";
import { getEventBySlug } from "@/lib/events";
import { formatCents, formatEventDateTime } from "@/lib/format";

export const runtime = "nodejs";

const SIZE = { width: 1200, height: 630 };

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  const headline = "Get paid to play.";
  const detail = event
    ? `${formatEventDateTime(event.startsAt)} · ${event.venueName}`
    : "The Pickleball Pot Popup by Link & Dink";
  const pot = event ? formatCents(event.potAmountCents) : "$80";

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "linear-gradient(160deg, #07332a 0%, #01160d 70%)",
        padding: 80,
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 16,
            background: "#044026",
            display: "flex",
          }}
        />
        <div style={{ fontSize: 30, fontWeight: 800, color: "#fffdfa" }}>
          The Pickleball Pot Popup · Link & Dink
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            fontSize: 110,
            fontWeight: 900,
            color: "#b5d654",
            letterSpacing: -4,
            lineHeight: 1,
          }}
        >
          {headline}
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 38,
            color: "rgba(255,253,250,0.78)",
          }}
        >
          {detail}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div
          style={{
            display: "flex",
            background: "#b5d654",
            color: "#01160d",
            fontSize: 34,
            fontWeight: 900,
            padding: "14px 28px",
            borderRadius: 9999,
          }}
        >
          {pot} pot · winner take all
        </div>
        <div style={{ fontSize: 30, color: "rgba(255,253,250,0.6)" }}>
          $10 entry · paid same night
        </div>
      </div>
    </div>,
    SIZE,
  );
}
