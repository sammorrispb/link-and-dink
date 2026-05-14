import type { EmailProvider } from "../types";

/**
 * Default provider. Logs instead of sending, so the whole newsletter platform
 * — enqueue, drain, tracking — is exercisable end-to-end before a real
 * transactional provider is chosen (Phase 4).
 */
export const noopProvider: EmailProvider = {
  name: "noop",
  async send(msg) {
    const snippet = msg.text.slice(0, 120).replace(/\s+/g, " ");
    console.info(
      `[email:noop] to=${msg.to} subject=${JSON.stringify(msg.subject)} preview=${JSON.stringify(snippet)}`,
    );
    return { id: `noop-${crypto.randomUUID()}` };
  },
};
