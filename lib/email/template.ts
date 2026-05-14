/**
 * Table-based, inline-styled email shell. Brand tokens are hard-coded as hex
 * here (email clients can't use CSS variables) — keep them in sync with the
 * `:root` tokens in app/globals.css.
 *
 * The shell contains a URL-shaped placeholder (`UNSUBSCRIBE_PLACEHOLDER`),
 * which the send drain replaces per-recipient. It's URL-shaped so `juice`'s
 * HTML re-serialization leaves it untouched. Rendering (marked + juice) happens
 * once per issue; the per-recipient step is just a cheap string replace.
 */

const SPRUCE = "#044026";
const LIME = "#caf368";
const GREEN_BLACK = "#01160d";
const SMOKE = "#fffdfa";
const MUTED = "#b9c4bd";

// URL-shaped so juice/cheerio won't re-encode it; .invalid is a reserved TLD.
export const UNSUBSCRIBE_PLACEHOLDER = "https://unsubscribe.invalid/placeholder";

type EmailShellInput = {
  subject: string;
  previewText?: string | null;
  /** Rendered, sanitized markdown body. */
  contentHtml: string;
};

export function emailShell({
  subject,
  previewText,
  contentHtml,
}: EmailShellInput): string {
  const address = process.env.NEWSLETTER_MAILING_ADDRESS ?? "";
  const preview = (previewText ?? "").trim();

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(subject)}</title>
<style>
  body { margin: 0; padding: 0; background: ${GREEN_BLACK}; }
  a { color: ${LIME}; }
  .content h1, .content h2, .content h3 { color: ${SMOKE}; line-height: 1.2; }
  .content p, .content li { color: ${SMOKE}; font-size: 16px; line-height: 1.6; }
  .content blockquote { border-left: 3px solid ${LIME}; margin: 16px 0; padding: 4px 16px; color: ${MUTED}; }
  .content img { max-width: 100%; height: auto; border-radius: 8px; }
  .content hr { border: none; border-top: 1px solid rgba(202,243,104,0.18); margin: 24px 0; }
</style>
</head>
<body style="margin:0;padding:0;background:${GREEN_BLACK};">
  <span style="display:none;max-height:0;overflow:hidden;opacity:0;color:${GREEN_BLACK};">${escapeHtml(preview)}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${GREEN_BLACK};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <tr>
            <td style="padding:0 0 20px;font-family:'Outfit',Arial,sans-serif;font-size:18px;font-weight:800;color:${SMOKE};">
              Link &amp; Dink <span style="color:${LIME};">Weekly</span>
            </td>
          </tr>
          <tr>
            <td class="content" style="background:${SPRUCE};border-radius:16px;padding:32px;font-family:'Outfit',Arial,sans-serif;">
              ${contentHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 8px 0;font-family:'Outfit',Arial,sans-serif;font-size:12px;line-height:1.6;color:${MUTED};">
              You're getting this because you signed up at linkanddink.com.<br />
              <a href="${UNSUBSCRIBE_PLACEHOLDER}" style="color:${MUTED};text-decoration:underline;">Unsubscribe</a>
              ${address ? ` &nbsp;·&nbsp; ${escapeHtml(address)}` : ""}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Plain-text footer, appended to the text/plain part. */
export function textFooter(): string {
  const address = process.env.NEWSLETTER_MAILING_ADDRESS ?? "";
  return [
    "",
    "—",
    "You're getting this because you signed up at linkanddink.com.",
    `Unsubscribe: ${UNSUBSCRIBE_PLACEHOLDER}`,
    address,
  ]
    .filter(Boolean)
    .join("\n");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
