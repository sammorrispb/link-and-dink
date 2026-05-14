import type { EmailProvider } from "../types";

/**
 * Resend provider. Implemented against the REST API via `fetch` — Resend's send
 * is a single POST, so there's no reason to pull in the SDK. Inert until
 * `RESEND_API_KEY` is set and `EMAIL_PROVIDER=resend` (Phase 4).
 */
export const resendProvider: EmailProvider = {
  name: "resend",
  async send(msg) {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM;
    if (!apiKey || !from) {
      return { error: "Resend not configured (RESEND_API_KEY / EMAIL_FROM)" };
    }

    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: msg.to,
          subject: msg.subject,
          html: msg.html,
          text: msg.text,
          headers: msg.headers,
          reply_to: msg.replyTo,
        }),
      });

      const body = (await res.json().catch(() => ({}))) as {
        id?: string;
        message?: string;
      };
      if (!res.ok || !body.id) {
        return { error: body.message || `Resend HTTP ${res.status}` };
      }
      return { id: body.id };
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Resend request failed" };
    }
  },
};
