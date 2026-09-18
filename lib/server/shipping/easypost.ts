import "server-only";
import type { ShipmentRate, ShippingProvider, TrackingUpdate } from "./provider";

const BASE = () => (process.env.SHIPPING_API_URL ?? "https://api.easypost.com/v2").replace(/\/$/, "");

function auth(): string {
  const key = process.env.SHIPPING_API_KEY;
  if (!key || key === "PENDING") throw new Error("SHIPPING_API_KEY no configurado");
  return `Basic ${Buffer.from(`${key}:`).toString("base64")}`;
}

interface EPAddress {
  name?: string;
  street1: string;
  street2?: string;
  city: string;
  state?: string;
  zip?: string;
  country?: string;
  phone?: string;
}

function originAddress(): EPAddress {
  return {
    name: process.env.SHIPPING_ORIGIN_NAME ?? "AREM WORLD",
    street1: process.env.SHIPPING_ORIGIN_ADDRESS ?? "",
    city: process.env.SHIPPING_ORIGIN_CITY ?? "",
    state: process.env.SHIPPING_ORIGIN_STATE ?? "",
    zip: process.env.SHIPPING_ORIGIN_POSTAL ?? "",
    country: "US",
    phone: process.env.SHIPPING_ORIGIN_PHONE ?? undefined,
  };
}

function destAddress(d: unknown): EPAddress {
  const x = (d ?? {}) as Record<string, string | undefined>;
  return {
    name: x.recipient_name ?? x.name ?? "",
    street1: x.line1 ?? x.street1 ?? "",
    street2: x.line2 ?? x.street2 ?? undefined,
    city: x.city ?? "",
    state: x.state ?? "",
    zip: x.postal_code ?? x.zip ?? "",
    country: x.country ?? "US",
    phone: x.phone ?? undefined,
  };
}

function parcel(weightKg: number) {
  const oz = Math.max(1, Math.round(weightKg * 35.274));
  return {
    weight: oz,
    length: Number(process.env.SHIPPING_DIM_LENGTH_IN ?? 12),
    width: Number(process.env.SHIPPING_DIM_WIDTH_IN ?? 9),
    height: Number(process.env.SHIPPING_DIM_HEIGHT_IN ?? 6),
  };
}

interface EPRate {
  id: string;
  carrier: string;
  service: string;
  rate: string;
  delivery_days?: number | null;
  est_delivery_days?: number | null;
}

async function createShipmentWithRates(to: EPAddress, weightKg: number): Promise<{ id: string; rates: EPRate[] }> {
  const res = await fetch(`${BASE()}/shipments`, {
    method: "POST",
    headers: { Authorization: auth(), "Content-Type": "application/json" },
    body: JSON.stringify({ shipment: { to_address: to, from_address: originAddress(), parcel: parcel(weightKg) } }),
  });
  if (!res.ok) throw new Error(`EasyPost shipment error ${res.status}`);
  return (await res.json()) as { id: string; rates: EPRate[] };
}

/** EasyPost (US domestic): USPS / UPS / FedEx / DHL eCommerce via one API.
 * Test keys (EZTK…) generate test labels; production key goes live. */
export class EasyPostProvider implements ShippingProvider {
  id = "easypost";

  async getRates(_origin: unknown, destination: unknown): Promise<ShipmentRate[]> {
    const d = (destination ?? {}) as { weightKg?: number };
    const { rates } = await createShipmentWithRates(destAddress(destination), Number(d.weightKg ?? 1));
    return rates.map((r) => ({
      carrier: r.carrier,
      service: r.service,
      priceUsd: Number(r.rate),
      estimatedDays: r.delivery_days ?? r.est_delivery_days ?? 5,
    }));
  }

  async createShipment(orderId: string, destination: unknown): Promise<{ carrier: string; trackingNumber: string; labelUrl?: string }> {
    const d = (destination ?? {}) as { weightKg?: number; shippingMethod?: string };
    const weightKg = Number(d.weightKg ?? 1);
    const created = await createShipmentWithRates(destAddress(destination), weightKg);
    if (created.rates.length === 0) throw new Error("EasyPost: sin tarifas para esta ruta");
    // standard -> cheapest, express -> fastest.
    const sorted = [...created.rates].sort((a, b) => Number(a.rate) - Number(b.rate));
    const rate =
      String(d.shippingMethod ?? "standard") === "express"
        ? [...created.rates].sort((a, b) => (a.delivery_days ?? 99) - (b.delivery_days ?? 99))[0]
        : sorted[0];
    const buy = await fetch(`${BASE()}/shipments/${created.id}/buy`, {
      method: "POST",
      headers: { Authorization: auth(), "Content-Type": "application/json" },
      body: JSON.stringify({ rate: { id: rate.id } }),
    });
    if (!buy.ok) throw new Error(`EasyPost buy error ${buy.status}`);
    const data = (await buy.json()) as {
      tracking_code?: string;
      selected_rate?: { carrier?: string };
      postage_label?: { label_url?: string };
    };
    if (!data.tracking_code) throw new Error("EasyPost: sin tracking_code");
    void orderId;
    return { carrier: data.selected_rate?.carrier ?? rate.carrier, trackingNumber: data.tracking_code, labelUrl: data.postage_label?.label_url };
  }

  async getTracking(trackingNumber: string): Promise<TrackingUpdate[]> {
    const res = await fetch(`${BASE()}/trackers`, {
      method: "POST",
      headers: { Authorization: auth(), "Content-Type": "application/json" },
      body: JSON.stringify({ tracker: { tracking_code: trackingNumber } }),
    });
    if (!res.ok) throw new Error(`EasyPost tracking error ${res.status}`);
    const data = (await res.json()) as {
      status?: string;
      tracking_details?: { status?: string; description?: string; datetime?: string; tracking_location?: { city?: string; state?: string } }[];
    };
    return (data.tracking_details ?? []).map((t) => ({
      status: String(t.status ?? data.status ?? "UNKNOWN"),
      description: String(t.description ?? ""),
      occurredAt: t.datetime ?? new Date().toISOString(),
      location: [t.tracking_location?.city, t.tracking_location?.state].filter(Boolean).join(", ") || undefined,
    }));
  }

  async cancelShipment(): Promise<void> {
    // EasyPost refunds via POST /v2/refunds with tracking_code; wire when needed.
    throw new Error("EasyPost: reembolso manual desde el dashboard por ahora");
  }
}
