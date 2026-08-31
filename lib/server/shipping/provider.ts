import "server-only";

/** Carrier-agnostic shipping abstraction. Implement a provider per carrier
 * (Colombian carriers, DHL, FedEx, UPS…) once credentials exist. Until then,
 * NoopShippingProvider returns "not configured" so the Admin never pretends a
 * live carrier is connected. */
export interface ShipmentRate {
  carrier: string;
  service: string;
  priceUsd: number;
  estimatedDays: number;
}
export interface TrackingUpdate {
  status: string;
  description: string;
  occurredAt: string;
  location?: string;
}

export interface ShippingProvider {
  id: string;
  getRates(origin: unknown, destination: unknown): Promise<ShipmentRate[]>;
  createShipment(orderId: string, destination: unknown): Promise<{ carrier: string; trackingNumber: string; labelUrl?: string }>;
  getTracking(trackingNumber: string): Promise<TrackingUpdate[]>;
  cancelShipment(trackingNumber: string): Promise<void>;
}

export class NoopShippingProvider implements ShippingProvider {
  id = "noop";
  async getRates(): Promise<ShipmentRate[]> { throw new Error("Shipping provider no configurado"); }
  async createShipment(): Promise<{ carrier: string; trackingNumber: string; labelUrl?: string }> { throw new Error("Shipping provider no configurado"); }
  async getTracking(): Promise<TrackingUpdate[]> { throw new Error("Shipping provider no configurado"); }
  async cancelShipment(): Promise<void> { throw new Error("Shipping provider no configurado"); }
}

export function getShippingProvider(_carrier = "noop"): ShippingProvider {
  // Carrier providers plug in here when credentials exist (env-gated).
  return new NoopShippingProvider();
}

export const SHIPMENT_STATUSES = [
  "PENDING", "PREPARING", "LABEL_CREATED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "EXCEPTION", "CANCELLED",
] as const;
