import "server-only";

export interface ShippingMethod {
  id: string;
  label_en: string;
  label_es: string;
  priceUsd: number;
  eta_en: string;
  eta_es: string;
}

/** Shipping methods (decoupled from any carrier API). Extensible later. */
export const SHIPPING_METHODS: ShippingMethod[] = [
  { id: "standard", label_en: "Standard Shipping", label_es: "Envío estándar", priceUsd: 12, eta_en: "5–8 business days", eta_es: "5–8 días hábiles" },
  { id: "express", label_en: "Express Shipping", label_es: "Envío express", priceUsd: 28, eta_en: "1–3 business days", eta_es: "1–3 días hábiles" },
];

export function getShippingMethod(id: string): ShippingMethod | null {
  return SHIPPING_METHODS.find((m) => m.id === id) ?? null;
}
