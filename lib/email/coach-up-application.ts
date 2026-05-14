/**
 * Coach Up application notification — sent to Sam when someone applies.
 * Small and self-contained, like `./confirmation.ts`: no newsletter shell, no
 * unsubscribe footer. Inline-styled; brand tokens hard-coded as hex.
 */

const SPRUCE = "#044026";
const LIME = "#caf368";
const GREEN_BLACK = "#01160d";
const SMOKE = "#fffdfa";
const MUTED = "#b9c4bd";

export type CoachUpApplication = {
  name: string;
  email: string;
  phone: string;
  neighborhood: string;
  dupr: string;
  yearsPlayed: string;
  wherePlay: string;
  why: string;
  hoursPerWeek: string;
  weekendAvailability: string;
  commit12wk: string;
  honesty: string;
};

const FIELDS: { label: string; key: keyof CoachUpApplication }[] = [
  { label: "Email", key: "email" },
  { label: "Phone", key: "phone" },
  { label: "Neighborhood / city", key: "neighborhood" },
  { label: "DUPR", key: "dupr" },
  { label: "Years played", key: "yearsPlayed" },
  { label: "Where they play", key: "wherePlay" },
  { label: "Why they want to coach", key: "why" },
  { label: "Hours per week", key: "hoursPerWeek" },
  { label: "Weekend availability", key: "weekendAvailability" },
  { label: "Can commit to 12 weeks", key: "commit12wk" },
  { label: "Anything we should know", key: "honesty" },
];

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderCoachUpApplicationEmail(app: CoachUpApplication): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `New Coach Up application — ${app.name}`;

  const rows = FIELDS.map(({ label, key }) => {
    const value = (app[key] || "—").trim() || "—";
    return `<tr>
      <td style="padding:8px 0;font-size:13px;color:${MUTED};font-weight:700;vertical-align:top;width:170px;">${escapeHtml(label)}</td>
      <td style="padding:8px 0;font-size:14px;color:${SMOKE};line-height:1.5;">${escapeHtml(value)}</td>
    </tr>`;
  }).join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:${GREEN_BLACK};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${GREEN_BLACK};">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr><td style="padding:0 0 20px;font-family:'Outfit',Arial,sans-serif;font-size:18px;font-weight:800;color:${SMOKE};">
          Coach <span style="color:${LIME};">Up</span> — new application
        </td></tr>
        <tr><td style="background:${SPRUCE};border-radius:16px;padding:32px;font-family:'Outfit',Arial,sans-serif;">
          <p style="margin:0 0 6px;color:${SMOKE};font-size:20px;font-weight:800;line-height:1.2;">${escapeHtml(app.name)}</p>
          <p style="margin:0 0 20px;color:${MUTED};font-size:14px;">Reply within 5 days.</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = [
    `New Coach Up application — ${app.name}`,
    "",
    ...FIELDS.map(({ label, key }) => `${label}: ${(app[key] || "—").trim() || "—"}`),
  ].join("\n");

  return { subject, html, text };
}
