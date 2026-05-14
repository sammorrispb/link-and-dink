/**
 * Double opt-in confirmation email. Small and self-contained — no newsletter
 * shell, no unsubscribe footer (there's nothing to unsubscribe from until they
 * confirm). Inline-styled; brand tokens hard-coded as hex.
 */

const SPRUCE = "#044026";
const LIME = "#caf368";
const GREEN_BLACK = "#01160d";
const SMOKE = "#fffdfa";
const MUTED = "#b9c4bd";

export function renderConfirmationEmail(confirmUrl: string): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = "Confirm your spot — Link & Dink Weekly";

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:${GREEN_BLACK};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${GREEN_BLACK};">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr><td style="padding:0 0 20px;font-family:'Outfit',Arial,sans-serif;font-size:18px;font-weight:800;color:${SMOKE};">
          Link &amp; Dink <span style="color:${LIME};">Weekly</span>
        </td></tr>
        <tr><td style="background:${SPRUCE};border-radius:16px;padding:32px;font-family:'Outfit',Arial,sans-serif;">
          <p style="margin:0 0 16px;color:${SMOKE};font-size:18px;font-weight:700;line-height:1.3;">One click and you're in.</p>
          <p style="margin:0 0 24px;color:${SMOKE};font-size:16px;line-height:1.6;">
            Confirm your email and you'll get Link &amp; Dink Weekly every Thursday at 7am — curated games, one drill, one rule, one local pick.
          </p>
          <a href="${confirmUrl}" style="display:inline-block;background:${LIME};color:${GREEN_BLACK};font-weight:800;font-size:15px;text-decoration:none;padding:14px 24px;border-radius:12px;">
            Confirm my email
          </a>
          <p style="margin:24px 0 0;color:${MUTED};font-size:13px;line-height:1.6;">
            Didn't sign up? Just ignore this — you won't hear from us again.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = [
    "Confirm your subscription to Link & Dink Weekly:",
    "",
    confirmUrl,
    "",
    "Didn't sign up? Just ignore this email.",
  ].join("\n");

  return { subject, html, text };
}
