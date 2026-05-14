import { marked } from "marked";
import sanitizeHtml from "sanitize-html";
import juice from "juice";
import { emailShell, textFooter } from "./template";

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
 * table shell. The result still contains the `{{UNSUBSCRIBE_URL}}` placeholder
 * — the send drain swaps it per-recipient.
 */
export function renderEmail(issue: IssueContent): { html: string; text: string } {
  const content = markdownToHtml(issue.body_markdown);
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
