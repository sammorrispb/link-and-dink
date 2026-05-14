/**
 * The email-provider boundary. Everything in the newsletter platform talks to
 * this interface, never to a concrete provider — so swapping providers is a
 * one-file change in `./index.ts`.
 */

export type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** Extra headers, e.g. List-Unsubscribe. */
  headers?: Record<string, string>;
  replyTo?: string;
};

/**
 * Discriminated result. Expected failures (rate limits, invalid recipients)
 * come back as `{ error }`; only genuinely unexpected things throw.
 */
export type SendResult = { id: string } | { error: string };

export type EmailProvider = {
  name: string;
  /** Send one message. Batching is the orchestrator's job, not the provider's. */
  send(msg: EmailMessage): Promise<SendResult>;
};
