"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getVariantById } from "@/lib/content";
import { useLocale } from "@/lib/i18n/locale-context";
import { useCart } from "@/lib/store/cart-context";
import { useCurrency } from "@/lib/currency/currency-context";
import { Icon } from "@/components/ui/icons";

const SHIP_OPTIONS = [
  { id: "standard", price: 12, en: "Standard Shipping · 5–8 business days", es: "Envío estándar · 5–8 días hábiles" },
  { id: "express", price: 28, en: "Express Shipping · 1–3 business days", es: "Envío express · 1–3 días hábiles" },
];
const PAY_OPTIONS = [
  { id: "card", en: "Credit / Debit Card", es: "Tarjeta de crédito / débito" },
  { id: "paypal", en: "PayPal", es: "PayPal" },
  { id: "wompi", en: "Wompi", es: "Wompi" },
  { id: "mercadopago", en: "Mercado Pago", es: "Mercado Pago" },
];

export function CheckoutForm() {
  const locale = useLocale();
  const es = locale === "es";
  const router = useRouter();
  const { lines, subtotal, clear } = useCart();
  const { format } = useCurrency();
  const prefix = `/${locale}`;

  const [f, setF] = useState<Record<string, string>>({ email: "", phone: "", firstName: "", lastName: "", country: "Colombia", state: "", city: "", address: "", apartment: "", postalCode: "", instructions: "" });
  const [ship, setShip] = useState("standard");
  const [pay, setPay] = useState("card");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ orderNumber: string } | null>(null);

  const items = useMemo(
    () => lines.map((l) => ({ ...l, variant: getVariantById(l.variantId) })).filter((l) => l.variant),
    [lines],
  );
  const shippingCost = SHIP_OPTIONS.find((s) => s.id === ship)?.price ?? 0;
  const total = subtotal + shippingCost;
  const set = (k: string, v: string) => setF((s) => ({ ...s, [k]: v }));

  if (done) {
    return (
      <section className="section">
        <div className="container" style={{ maxWidth: "34rem" }}>
          <div className="cart-empty" style={{ padding: "4rem 0" }}>
            <span className="cart-empty__icon"><Icon name="check" size={26} /></span>
            <h1 className="h2">{es ? "¡Pedido creado!" : "Order created!"}</h1>
            <p>{es ? `Tu número de pedido es ${done.orderNumber}.` : `Your order number is ${done.orderNumber}.`}</p>
            <p className="muted">{es ? "El pago quedó pendiente de confirmación. Te enviaremos un correo cuando esté confirmado." : "Payment is pending confirmation. We'll email you once it's confirmed."}</p>
            <Link href={`${prefix}/signup`} className="btn btn--primary" style={{ marginTop: "1rem" }}>
              {es ? "Crea una cuenta para seguir tu pedido" : "Create an account to track your order"}
            </Link>
            <Link href={`${prefix}/shop`} className="btn btn--secondary" style={{ marginTop: "0.75rem" }}>
              {es ? "Seguir explorando" : "Continue shopping"}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="cart-empty" style={{ padding: "5rem 0" }}>
        <Icon name="bag" size={26} />
        <p>{es ? "Tu carrito está vacío." : "Your cart is empty."}</p>
        <Link href={`${prefix}/shop`} className="btn btn--primary">{es ? "Ir a la tienda" : "Go to shop"}</Link>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setBusy(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines: lines.map((l) => ({ productId: l.productId, variantId: l.variantId, quantity: l.quantity })),
          email: f.email, phone: f.phone, firstName: f.firstName, lastName: f.lastName,
          country: f.country, state: f.state, city: f.city, address: f.address, apartment: f.apartment,
          postalCode: f.postalCode, instructions: f.instructions,
          shippingMethod: ship, paymentMethod: pay,
        }),
      });
      const d = await res.json();
      if (res.ok && d.orderNumber) {
        clear();
        setDone({ orderNumber: d.orderNumber });
        router.refresh();
      } else {
        setError(d.error || "Error");
      }
    } catch { setError("Error de conexión"); }
    finally { setBusy(false); }
  }

  return (
    <section className="section section--flush-top">
      <div className="container" style={{ maxWidth: "56rem" }}>
        <h1 className="h2" style={{ margin: "1.5rem 0 0.25rem" }}>{es ? "Checkout" : "Checkout"}</h1>
        <p className="muted" style={{ marginBottom: "2rem" }}>{es ? "No necesitas una cuenta para comprar." : "No account needed to buy."}</p>
        {error && <div className="acc-status acc-status--err">{error}</div>}

        <form onSubmit={submit} className="checkout-form">
          <div className="checkout-col">
            <h2 className="checkout-title">1 · {es ? "Información de contacto" : "Contact information"}</h2>
            <div className="acc-form__row">
              <div className="acc-field"><label>{es ? "Correo electrónico" : "Email"} *</label><input className="acc-input" type="email" required value={f.email} onChange={(e) => set("email", e.target.value)} /></div>
              <div className="acc-field"><label>{es ? "Teléfono" : "Phone"}</label><input className="acc-input" value={f.phone} onChange={(e) => set("phone", e.target.value)} /></div>
            </div>
            <h2 className="checkout-title">2 · {es ? "Dirección de envío" : "Shipping address"}</h2>
            <div className="acc-form__row">
              <div className="acc-field"><label>{es ? "Nombre" : "First name"} *</label><input className="acc-input" required value={f.firstName} onChange={(e) => set("firstName", e.target.value)} /></div>
              <div className="acc-field"><label>{es ? "Apellido" : "Last name"} *</label><input className="acc-input" required value={f.lastName} onChange={(e) => set("lastName", e.target.value)} /></div>
            </div>
            <div className="acc-form__row">
              <div className="acc-field"><label>{es ? "País" : "Country"} *</label><input className="acc-input" required value={f.country} onChange={(e) => set("country", e.target.value)} /></div>
              <div className="acc-field"><label>{es ? "Departamento / Estado" : "State / Province"}</label><input className="acc-input" value={f.state} onChange={(e) => set("state", e.target.value)} /></div>
            </div>
            <div className="acc-form__row">
              <div className="acc-field"><label>{es ? "Ciudad" : "City"} *</label><input className="acc-input" required value={f.city} onChange={(e) => set("city", e.target.value)} /></div>
              <div className="acc-field"><label>{es ? "Código postal" : "Postal code"}</label><input className="acc-input" value={f.postalCode} onChange={(e) => set("postalCode", e.target.value)} /></div>
            </div>
            <div className="acc-field"><label>{es ? "Dirección" : "Address"} *</label><input className="acc-input" required value={f.address} onChange={(e) => set("address", e.target.value)} /></div>
            <div className="acc-form__row">
              <div className="acc-field"><label>{es ? "Apartamento / Suite" : "Apartment / Suite"}</label><input className="acc-input" value={f.apartment} onChange={(e) => set("apartment", e.target.value)} /></div>
              <div className="acc-field"><label>{es ? "Instrucciones" : "Instructions"}</label><input className="acc-input" value={f.instructions} onChange={(e) => set("instructions", e.target.value)} /></div>
            </div>

            <h2 className="checkout-title">3 · {es ? "Método de envío" : "Shipping method"}</h2>
            {SHIP_OPTIONS.map((s) => (
              <label key={s.id} className="checkout-opt">
                <input type="radio" name="ship" checked={ship === s.id} onChange={() => setShip(s.id)} />
                <span>{es ? s.es : s.en}</span>
                <strong>{format(s.price)}</strong>
              </label>
            ))}
            <h2 className="checkout-title">4 · {es ? "Método de pago" : "Payment method"}</h2>
            {PAY_OPTIONS.map((p) => (
              <label key={p.id} className="checkout-opt">
                <input type="radio" name="pay" checked={pay === p.id} onChange={() => setPay(p.id)} />
                <span>{es ? p.es : p.en}</span>
              </label>
            ))}
            <p className="acc-note">{es ? "Los pagos se confirman manualmente por ahora; la arquitectura de proveedores (Stripe, PayPal, Wompi, Mercado Pago) está preparada." : "Payments are confirmed manually for now; the provider architecture (Stripe, PayPal, Wompi, Mercado Pago) is ready."}</p>
          </div>

          <div className="checkout-summary">
            <h2 className="checkout-title">5 · {es ? "Resumen" : "Order summary"}</h2>
            {items.map((l) => (
              <div key={l.variantId} className="checkout-line">
                <span>{l.variant?.variant.title.en ?? ""} × {l.quantity}</span>
                <span>{format(((l.variant?.variant.price ?? 0) / 1000) * l.quantity)}</span>
              </div>
            ))}
            <div className="checkout-line"><span>{es ? "Subtotal" : "Subtotal"}</span><span>{format(subtotal)}</span></div>
            <div className="checkout-line"><span>{es ? "Envío" : "Shipping"}</span><span>{format(shippingCost)}</span></div>
            <div className="checkout-line checkout-total"><span>{es ? "Total" : "Total"}</span><span>{format(total)}</span></div>
            <button type="submit" className="btn btn--primary btn--block" disabled={busy}>{busy ? (es ? "Procesando…" : "Processing…") : (es ? "Realizar pedido" : "Place order")}</button>
          </div>
        </form>
      </div>
    </section>
  );
}
