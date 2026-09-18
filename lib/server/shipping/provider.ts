import "server-only";
import { EasyPostProvider } from "./easypost";

/** Carrier-agnostic shipping abstraction (Colombia-ready: Coordinadora,
 * Servientrega, Inter Rapidísimo, Envía, DHL…). Configure via env:
 * SHIPPING_PROVIDER=mock|generic, SHIPPING_API_URL, SHIPPING_API_KEY, etc. */
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

/** Dev/local provider: deterministic rates + tracking numbers, no credentials. */
export class MockShippingProvider implements ShippingProvider {
  id = "mock";
  async getRates(_origin: unknown, destination: unknown): Promise<ShipmentRate[]> {
    const dest = (destination ?? {}) as { country?: string };
    const intl = dest.country && !/colombia/i.test(String(dest.country));
    return [
      { carrier: "mock", service: "standard", priceUsd: intl ? 18 : 12, estimatedDays: intl ? 8 : 5 },
      { carrier: "mock", service: "express", priceUsd: intl ? 38 : 28, estimatedDays: intl ? 3 : 2 },
    ];
  }
  async createShipment(orderId: string): Promise<{ carrier: string; trackingNumber: string }> {
    const suffix = orderId.replace(/-/g, "").slice(0, 8).toUpperCase();
    return { carrier: "mock", trackingNumber: `AREM-${suffix}` };
  }
  async getTracking(trackingNumber: string): Promise<TrackingUpdate[]> {
    const now = new Date().toISOString();
    return [
      { status: "LABEL_CREATED", description: `Guía ${trackingNumber} generada`, occurredAt: now },
      { status: "IN_TRANSIT", description: "Paquete en tránsito", occurredAt: now },
    ];
  }
  async cancelShipment(): Promise<void> {}
}

/** Generic HTTP carrier: POST {apiUrl}/rates|shipments|tracking with Bearer key. */
export class GenericHttpShippingProvider implements ShippingProvider {  id = "generic";
  private url(): string {
    const u = process.env.SHIPPING_API_URL;
    if (!u) throw new Error("SHIPPING_API_URL no configurado");
    return u.replace(/\/$/, "");
  }
  private key(): string {
    const k = process.env.SHIPPING_API_KEY;
    if (!k) throw new Error("SHIPPING_API_KEY no configurado");
    return k;
  }
  async getRates(origin: unknown, destination: unknown): Promise<ShipmentRate[]> {
    const res = await fetch(`${this.url()}/rates`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.key()}` },
      body: JSON.stringify({ origin, destination }),
    });
    if (!res.ok) throw new Error(`Carrier rates error ${res.status}`);
    return (await res.json()) as ShipmentRate[];
  }
  async createShipment(orderId: string, destination: unknown) {
    const res = await fetch(`${this.url()}/shipments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.key()}` },
      body: JSON.stringify({ orderId, destination }),
    });
    if (!res.ok) throw new Error(`Carrier shipment error ${res.status}`);
    return (await res.json()) as { carrier: string; trackingNumber: string; labelUrl?: string };
  }
  async getTracking(trackingNumber: string): Promise<TrackingUpdate[]> {
    const res = await fetch(`${this.url()}/tracking/${encodeURIComponent(trackingNumber)}`, {
      headers: { Authorization: `Bearer ${this.key()}` },
    });
    if (!res.ok) throw new Error(`Carrier tracking error ${res.status}`);
    return (await res.json()) as TrackingUpdate[];
  }
  async cancelShipment(trackingNumber: string): Promise<void> {
    await fetch(`${this.url()}/shipments/${encodeURIComponent(trackingNumber)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${this.key()}` },
    });
  }
}

export function getShippingProvider(carrier?: string): ShippingProvider {
  const id = (carrier ?? process.env.SHIPPING_PROVIDER ?? "mock").toLowerCase();
  if (id === "easypost") return new EasyPostProvider();
  if (id === "generic") return new GenericHttpShippingProvider();
  if (id === "mock") return new MockShippingProvider();
  // Named Colombian/international carriers plug in here (same Generic HTTP
  // contract or dedicated classes) once credentials exist.
  if (id === "noop" || id === "") return new NoopShippingProvider();
  return new GenericHttpShippingProvider();
}

export const SHIPMENT_STATUSES = [
  "PENDING", "PREPARING", "LABEL_CREATED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "EXCEPTION", "CANCELLED",
] as const;
