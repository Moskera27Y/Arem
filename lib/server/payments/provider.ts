import "server-only";

/** Payment provider abstraction — the checkout is never coupled to one
 * provider. Implement a provider per integration; the manual/test provider is
 * the default while no credentials exist. Never put secret keys in the
 * frontend; all payment work happens server-side. */
export interface PaymentProvider {
  id: string;
  label: string;
  /** Create a payment reference for an order; returns a safe token/reference
   * to store (never raw card data). Throws if not configured. */
  createPayment(amountCents: number, currency: string, orderRef: string): Promise<{ transactionId: string; status: "pending" | "paid" }>;
}

export const PAYMENT_METHODS = ["card", "paypal", "wompi", "mercadopago"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

/** Default provider: manual/test. Records the reference; payment is confirmed
 * manually in Admin until real credentials are configured. */
export class ManualProvider implements PaymentProvider {
  id = "manual";
  label = "Test / Manual payment";
  async createPayment(_amountCents: number, _currency: string, orderRef: string) {
    return { transactionId: `manual-${orderRef}`, status: "pending" as const };
  }
}

export function getPaymentProvider(_method: PaymentMethod): PaymentProvider {
  // Stripe/PayPal/Wompi/MercadoPago providers plug in here when configured.
  return new ManualProvider();
}
