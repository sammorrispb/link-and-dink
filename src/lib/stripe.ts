import "server-only";
import Stripe from "stripe";

/**
 * Phase 1: payments are STUBBED. STRIPE_LIVE defaults to false — RSVP records
 * `payment_status='intent'` and no charge happens. The Stripe SDK is wired and
 * the codepath exists so Phase 2 only has to flip the flag and implement
 * `createCheckoutSession`.
 */
export const STRIPE_LIVE = process.env.STRIPE_LIVE === "true";

let stripeSingleton: Stripe | null = null;

/** Lazily-constructed Stripe client. Only call when STRIPE_LIVE is true. */
export function getStripe(): Stripe {
  if (!stripeSingleton) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    stripeSingleton = new Stripe(key);
  }
  return stripeSingleton;
}

export interface CheckoutParams {
  eventSlug: string;
  eventTitle: string;
  entryFeeCents: number;
  accountId: string;
  playerId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutResult {
  /** 'stubbed' in Phase 1; 'redirect' once STRIPE_LIVE is true. */
  mode: "stubbed" | "redirect";
  /** Stripe Checkout URL when mode === 'redirect'. */
  url?: string;
  /** Stripe PaymentIntent / Checkout Session id when available. */
  paymentIntentId?: string;
}

/**
 * Phase 1 stub. Returns `mode: 'stubbed'` so the caller records the RSVP with
 * `payment_status='intent'` and skips any redirect.
 *
 * Phase 2: when STRIPE_LIVE is true, create a real Stripe Checkout Session here
 * and return `mode: 'redirect'` with the session URL.
 */
export async function createCheckoutSession(_params: CheckoutParams): Promise<CheckoutResult> {
  if (!STRIPE_LIVE) {
    return { mode: "stubbed" };
  }

  // Phase 2 implementation goes here:
  //   const stripe = getStripe();
  //   const session = await stripe.checkout.sessions.create({ ... });
  //   return { mode: "redirect", url: session.url!, paymentIntentId: session.id };
  throw new Error("STRIPE_LIVE is true but createCheckoutSession is not implemented (Phase 2).");
}
