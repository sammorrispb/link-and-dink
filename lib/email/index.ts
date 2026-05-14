import type { EmailProvider } from "./types";
import { noopProvider } from "./providers/noop";
import { resendProvider } from "./providers/resend";

/**
 * The single place an email provider is selected. Everything else calls
 * `getEmailProvider()` and talks to the `EmailProvider` interface — so adding
 * or switching a provider never touches the orchestration code.
 *
 * Driven by `EMAIL_PROVIDER` at runtime (not build time), so staging can run
 * `noop` while production runs the real provider. Defaults to `noop`.
 */
export function getEmailProvider(): EmailProvider {
  const choice = process.env.EMAIL_PROVIDER ?? "noop";
  switch (choice) {
    case "resend":
      return resendProvider;
    case "noop":
      return noopProvider;
    default:
      console.warn(`[email] unknown EMAIL_PROVIDER "${choice}", falling back to noop`);
      return noopProvider;
  }
}

export type { EmailMessage, EmailProvider, SendResult } from "./types";
