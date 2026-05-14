import { marked } from "marked";
import sanitizeHtml from "sanitize-html";
import juice from "juice";
import { emailShell, textFooter } from "./template";
import { trackClickUrl, trackOpenUrl } from "./links";

/**
 * Markdown is the single source of truth for an issue. `markdownToHtml` is the
 * one shared transform; the only thing that diverges is the wrapper —
 * `renderEmail` wraps it in the inlined table shell, `renderArchive` returns
 * the bare content for a normal React page.
 */

export type IssueContent = {
  subject: string;
  preview_text?: string | null;
  body_markdown: string;
};

/**
 * Opt-in tracking for `renderEmail`. Supplied by the send drain; omitted by the
 * admin preview and test-send so those don't rewrite links or log events.
 */
export type TrackingOptions = {
  issueId: string;
  /** issue_links rows — `url` is the rendered href, `id` the linkId. */
  links: { id: string; url: string }[];
};

const SANITIZE_OPTS: sanitizeHtml.IOptions = {
  allowedTags: [
    "h1", "h2", "h3", "h4", "p", "a", "ul", "ol", "li", "strong", "em",
    "blockquote", "code", "pre", "img", "hr", "br", "table", "thead", "tbody",
    "tr", "th", "td",
  ],
  allowedAttributes: {
    a: ["href", "title"],
    img: ["src", "alt", "title"],
  },
  allowedSchemes: ["http", "https", "mailto"],
};

/** Markdown -> sanitized HTML content (no wrapper). */
export function markdownToHtml(md: string): string {
  const raw = marked.parse(md, { async: false }) as string;
  return sanitizeHtml(raw, SANITIZE_OPTS);
}

/** Markdown -> plain text, for the text/plain part of an email. */
export function markdownToText(md: string): string {
  const raw = marked.parse(md, { async: false }) as string;
  const stripped = sanitizeHtml(raw, { allowedTags: [], allowedAttributes: {} });
  return stripped.replace(/\n{3,}/g, "\n\n").trim();
}

/**
 * Render an issue for email: shared content transform, wrapped in the inlined
 * table shell. The result still contains the unsubscribe placeholder (and, when
 * `tracking` is given, the tracking-token placeholder) — the send drain swaps
 * them per-recipient.
 *
 * With `tracking`: known links are rewritten through the click route and an
 * open pixel is appended. Without it (admin preview, test send): neither.
 */
export function renderEmail(
  issue: IssueContent,
  tracking?: TrackingOptions,
): { html: string; text: string } {
  let content = markdownToHtml(issue.body_markdown);

  if (tracking) {
    for (const link of tracking.links) {
      content = content.replaceAll(
        `href="${link.url}"`,
        `href="${trackClickUrl(tracking.issueId, link.id)}"`,
      );
    }
    content += `<img src="${trackOpenUrl(tracking.issueId)}" width="1" height="1" alt="" style="display:none" />`;
  }

  const html = juice(
    emailShell({
      subject: issue.subject,
      previewText: issue.preview_text,
      contentHtml: content,
    }),
  );
  const text = `${markdownToText(issue.body_markdown)}\n${textFooter()}`;
  return { html, text };
}

/** Render an issue for the public web archive: bare sanitized content HTML. */
export function renderArchive(issue: IssueContent): string {
  return markdownToHtml(issue.body_markdown);
}
