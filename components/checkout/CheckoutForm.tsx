"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getVariantById } from "@/lib/content";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { useLocale } from "@/lib/i18n/locale-context";
import { useCart } from "@/lib/store/cart-context";
import { useCurrency } from "@/lib/currency/currency-context";
import { Icon } from "@/components/ui/icons";
import type { Locale } from "@/lib/i18n/config";

const FALLBACK_SHIP = [
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
  const locale: Locale = useLocale();
  const dict = getDictionary(locale);
  const c = dict.checkout;
  const router = useRouter();
  const { lines, subtotal, clear } = useCart();
  const { format } = useCurrency();
  const prefix = `/${locale}`;

  const [f, setF] = useState<Record<string, string>>({ email: "", phone: "", firstName: "", lastName: "", country: "Colombia", state: "", city: "", address: "", apartment: "", postalCode: "", instructions: "" });
  const [ship, setShip] = useState("standard");
  const [pay, setPay] = useState("card");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ orderNumber: string; orderId: string } | null>(null);
  const [rates, setRates] = useState(FALLBACK_SHIP);
  const [ratesMeta, setRatesMeta] = useState("");

  const items = useMemo(
    () => lines.map((l) => ({ ...l, variant: getVariantById(l.variantId) })).filter((l) => l.variant),
    [lines],
  );
  const SHIP_OPTIONS = rates;
  const shippingCost = SHIP_OPTIONS.find((s) => s.id === ship)?.price ?? SHIP_OPTIONS[0]?.price ?? 0;
  const total = subtotal + shippingCost;
  const set = (k: string, v: string) => setF((s) => ({ ...s, [k]: v }));

  // Live shipping quote (carrier API with flat fallback).
  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        const res = await fetch("/api/shipping/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ city: f.city, country: f.country, postalCode: f.postalCode, weightKg: 1 }),
        });
        const d = await res.json();
        if (Array.isArray(d.rates) && d.rates.length > 0) {
          setRates(
            d.rates.map((r: { service: string; priceUsd: number; estimatedDays: number; carrier: string }) => ({
              id: String(r.service),
              price: Number(r.priceUsd),
              en: `${String(r.carrier)} ${String(r.service)} · ~${Number(r.estimatedDays)} days`,
              es: `${String(r.carrier)} ${String(r.service)} · ~${Number(r.estimatedDays)} días`,
            })),
          );
          setRatesMeta(d.provider === "fallback" ? "" : `${d.provider}`);
        }
      } catch {
        /* keep fallback rates */
      }
    }, 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f.city, f.country, f.postalCode]);

  if (done) {
    return (
      <section className="section">
        <div className="container" style={{ maxWidth: "34rem" }}>
          <div className="cart-empty" style={{ padding: "4rem 0" }}>
            <span className="cart-empty__icon"><Icon name="check" size={26} /></span>
            <h1 className="h2">{c.created}</h1>
            <p>{c.orderIs(done.orderNumber)}</p>
            <p className="muted">{c.pendingNote}</p>
            <TrackBox orderId={done.orderId} locale={locale} />
            <Link href={`${prefix}/signup`} className="btn btn--primary" style={{ marginTop: "1rem" }}>
              {c.createAccount}
            </Link>
            <Link href={`${prefix}/shop`} className="btn btn--secondary" style={{ marginTop: "0.75rem" }}>
              {c.continueShopping}
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
        <p>{c.empty}</p>
        <Link href={`${prefix}/shop`} className="btn btn--primary">{c.emptyCta}</Link>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setBusy(true);
    // HTML type=email accepts addresses without a dot (a@b); the server
    // requires a real domain — catch it here with a localized message.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) {
      setError(dict.account.emailInvalid);
      setBusy(false);
      return;
    }
    // Map known Spanish server messages to the active locale; unknown or
    // internal errors become a generic localized message (never raw internals).
    const mapError = (raw: string): string => {
      if (/ERROR_INTERNO/i.test(raw)) return c.serverError;
      if (/Faltan datos|contacto/i.test(raw)) return c.invalidContact;
      return raw;
    };
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
        setDone({ orderNumber: d.orderNumber, orderId: d.orderId });
        router.refresh();
      } else {
        setError(mapError(typeof d.error === "string" ? d.error : ""));
      }
    } catch { setError(c.connectionError); }
    finally { setBusy(false); }
  }

  return (
    <section className="section section--flush-top">
      <div className="container" style={{ maxWidth: "56rem" }}>
        <h1 className="h2" style={{ margin: "1.5rem 0 0.25rem" }}>{c.title}</h1>
        <p className="muted" style={{ marginBottom: "2rem" }}>{c.subtitle}</p>
        {error && <div className="acc-status acc-status--err">{error}</div>}

        <form onSubmit={submit} className="checkout-form">
          <div className="checkout-col">
            <h2 className="checkout-title">1 · {c.contactInfo}</h2>
            <div className="acc-form__row">
              <div className="acc-field"><label>{c.email} *</label><input className="acc-input" type="email" required value={f.email} onChange={(e) => set("email", e.target.value)} /></div>
              <div className="acc-field"><label>{c.phone}</label><input className="acc-input" value={f.phone} onChange={(e) => set("phone", e.target.value)} /></div>
            </div>
            <h2 className="checkout-title">2 · {c.shipAddress}</h2>
            <div className="acc-form__row">
              <div className="acc-field"><label>{c.firstName} *</label><input className="acc-input" required value={f.firstName} onChange={(e) => set("firstName", e.target.value)} /></div>
              <div className="acc-field"><label>{c.lastName} *</label><input className="acc-input" required value={f.lastName} onChange={(e) => set("lastName", e.target.value)} /></div>
            </div>
            <div className="acc-form__row">
              <div className="acc-field"><label>{c.country} *</label><input className="acc-input" required value={f.country} onChange={(e) => set("country", e.target.value)} /></div>
              <div className="acc-field"><label>{c.state}</label><input className="acc-input" value={f.state} onChange={(e) => set("state", e.target.value)} /></div>
            </div>
            <div className="acc-form__row">
              <div className="acc-field"><label>{c.city} *</label><input className="acc-input" required value={f.city} onChange={(e) => set("city", e.target.value)} /></div>
              <div className="acc-field"><label>{c.postal}</label><input className="acc-input" value={f.postalCode} onChange={(e) => set("postalCode", e.target.value)} /></div>
            </div>
            <div className="acc-field"><label>{c.address} *</label><input className="acc-input" required value={f.address} onChange={(e) => set("address", e.target.value)} /></div>
            <div className="acc-form__row">
              <div className="acc-field"><label>{c.apt}</label><input className="acc-input" value={f.apartment} onChange={(e) => set("apartment", e.target.value)} /></div>
              <div className="acc-field"><label>{c.instructions}</label><input className="acc-input" value={f.instructions} onChange={(e) => set("instructions", e.target.value)} /></div>
            </div>

            <h2 className="checkout-title">3 · {c.shipMethod}</h2>
            {ratesMeta && <p className="acc-note">{c.liveRates(ratesMeta)}</p>}
            {SHIP_OPTIONS.map((s) => (
              <label key={s.id} className="checkout-opt">
                <input type="radio" name="ship" checked={ship === s.id} onChange={() => setShip(s.id)} />
                <span>{s[locale]}</span>
                <strong>{format(s.price)}</strong>
              </label>
            ))}
            <h2 className="checkout-title">4 · {c.payMethod}</h2>
            {PAY_OPTIONS.map((p) => (
              <label key={p.id} className="checkout-opt">
                <input type="radio" name="pay" checked={pay === p.id} onChange={() => setPay(p.id)} />
                <span>{p[locale]}</span>
              </label>
            ))}
            <p className="acc-note">{c.manualNote}</p>
            {pay === "card" && <CardWidget />}
          </div>

          <div className="checkout-summary">
            <h2 className="checkout-title">5 · {c.summary}</h2>
            {items.map((l) => (
              <div key={l.variantId} className="checkout-line">
                <span>{l.variant?.variant.title[locale] ?? ""} × {l.quantity}</span>
                <span>{format(((l.variant?.variant.price ?? 0) / 1000) * l.quantity)}</span>
              </div>
            ))}
            <div className="checkout-line"><span>{c.subtotal}</span><span>{format(subtotal)}</span></div>
            <div className="checkout-line"><span>{c.shipping}</span><span>{format(shippingCost)}</span></div>
            <div className="checkout-line checkout-total"><span>{c.total}</span><span>{format(total)}</span></div>
            <button type="submit" className="btn btn--primary btn--block" disabled={busy}>{busy ? c.processing : c.placeOrder}</button>
          </div>
        </form>
      </div>
    </section>
  );
}

function detectBrand(digits: string): string | null {
  if (/^4/.test(digits)) return "VISA";
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "MASTERCARD";
  if (/^3[47]/.test(digits)) return "AMEX";
  return null;
}

function luhnOk(digits: string): boolean {
  if (digits.length < 13) return false;
  let sum = 0;
  let dbl = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = Number(digits[i]);
    if (dbl) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    dbl = !dbl;
  }
  return sum % 10 === 0;
}

function groupNumber(digits: string): string {
  const d = digits.slice(0, 19);
  if (/^3[47]/.test(d)) return [d.slice(0, 4), d.slice(4, 10), d.slice(10, 15)].filter(Boolean).join(" ");
  return (d.match(/.{1,4}/g) ?? []).join(" ");
}

function formatExpiry(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 4);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}/${d.slice(2)}`;
}

function expiryOk(v: string): boolean | null {
  const m = /^(\d{2})\/(\d{2})$/.exec(v);
  if (!m) return v ? false : null;
  const mm = Number(m[1]);
  if (mm < 1 || mm > 12) return false;
  const now = new Date();
  const yy = now.getFullYear() % 100;
  const future = Number(m[2]) > yy || (Number(m[2]) === yy && mm >= now.getMonth() + 1);
  return future ? true : false;
}

/**
 * Animated card preview (brand detect, live formatting, Luhn + expiry
 * checks, 3D tilt + flip). PREVIEW ONLY: card data lives in component
 * state and is NEVER sent to the server (PCI scope zero) — the charge is
 * confirmed manually until a tokenizing provider (Square) is configured.
 */
function CardWidget() {
  const locale = useLocale();
  const c = getDictionary(locale).checkout;
  const [num, setNum] = useState("");
  const [name, setName] = useState("");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");
  const [flipped, setFlipped] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const digits = num.replace(/\D/g, "");
  const brand = detectBrand(digits);
  const numState = digits.length === 0 ? null : luhnOk(digits);
  const expState = expiryOk(exp);
  const shown = groupNumber(digits) || "•••• •••• •••• ••••";

  const onTilt = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ x: -py * 10, y: px * 12 });
  };

  return (
    <div className="cardwidget">
      <h3 className="checkout-subtitle">{c.cardDetails}</h3>
      <div
        className="card3d-wrap"
        onPointerMove={onTilt}
        onPointerLeave={() => setTilt({ x: 0, y: 0 })}
      >
        <div
          className="card3d"
          data-flipped={flipped}
          style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y + (flipped ? 180 : 0)}deg)` }}
        >
          <div className="card3d__face card3d__front">
            <div className="card3d__row">
              <span className="card3d__chip" aria-hidden="true" />
              <span className="card3d__brand">{brand ?? "CARD"}</span>
            </div>
            <p className="card3d__number">{shown}</p>
            <div className="card3d__row card3d__meta">
              <span>{(name || c.cardName).toUpperCase().slice(0, 22)}</span>
              <span>{exp || "MM/AA"}</span>
            </div>
          </div>
          <div className="card3d__face card3d__back" aria-hidden="true">
            <div className="card3d__stripe" />
            <div className="card3d__cvc">{cvc || "•••"}</div>
          </div>
        </div>
      </div>
      <div className="acc-form__row">
        <div className="acc-field">
          <label htmlFor="cc-num">{c.cardNumber}</label>
          <input
            id="cc-num"
            className="acc-input"
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="4111 1111 1111 1111"
            value={num}
            onChange={(e) => setNum(groupNumber(e.target.value.replace(/\D/g, "")))}
            aria-invalid={numState === false}
          />
          {numState === false && <span className="field__error" style={{ display: "block" }}>{c.cardInvalid}</span>}
        </div>
        <div className="acc-field">
          <label htmlFor="cc-name">{c.cardName}</label>
          <input
            id="cc-name"
            className="acc-input"
            autoComplete="cc-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
      </div>
      <div className="acc-form__row">
        <div className="acc-field">
          <label htmlFor="cc-exp">{c.cardExpiry}</label>
          <input
            id="cc-exp"
            className="acc-input"
            inputMode="numeric"
            autoComplete="cc-exp"
            placeholder="MM/AA"
            value={exp}
            onChange={(e) => setExp(formatExpiry(e.target.value))}
            aria-invalid={expState === false}
          />
        </div>
        <div className="acc-field">
          <label htmlFor="cc-cvc">{c.cardCvc}</label>
          <input
            id="cc-cvc"
            className="acc-input"
            inputMode="numeric"
            autoComplete="cc-csc"
            placeholder="123"
            value={cvc}
            onFocus={() => setFlipped(true)}
            onBlur={() => setFlipped(false)}
            onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
          />
        </div>
      </div>
      <p className="acc-note">{c.cardPreviewNote}</p>
    </div>
  );
}

function TrackBox({ orderId, locale }: { orderId: string; locale: Locale }) {
  const c = getDictionary(locale).checkout;
  const [tracking, setTracking] = useState("");
  const [result, setResult] = useState("");
  return (
    <div className="acc-field" style={{ marginTop: "1rem" }}>
      <label htmlFor="track-input">{c.trackLabel}</label>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <input
          id="track-input"
          className="acc-input"
          placeholder="AREM-XXXXXXXX"
          value={tracking}
          onChange={(e) => setTracking(e.target.value)}
        />
        <button
          type="button"
          className="btn btn--secondary"
          onClick={async () => {
            setResult(c.searching);
            try {
              const res = await fetch(`/api/shipping/track?tracking=${encodeURIComponent(tracking.trim())}`);
              const d = await res.json();
              if (res.ok) {
                const ev = Array.isArray(d.events) ? d.events.length : 0;
                setResult(`${d.shipment?.status ?? ""} · ${c.eventsCount(ev)}`);
              } else {
                setResult(d.error || "Error");
              }
            } catch {
              setResult("Error");
            }
          }}
        >
          {c.trackBtn}
        </button>
      </div>
      {result && <p className="acc-note">{result}</p>}
      <p className="acc-note">
        {c.guideNote(orderId)}
      </p>
    </div>
  );
}
