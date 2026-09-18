import "server-only";
import { randomUUID } from "node:crypto";
import { q, withTransaction } from "./db";
import { getProductById, getVariantById } from "@/lib/content";
import { toCents } from "@/lib/money";
import { getShippingMethod } from "./shipping";
import { PAYMENT_METHODS, getPaymentProvider, type PaymentMethod } from "./payments/provider";
import { asEmail, asString } from "./validate";

export interface CheckoutLine {
  productId: string;
  variantId: string;
  quantity: number;
}
export interface CheckoutInput {
  lines: CheckoutLine[];
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  country: string;
  state?: string;
  city: string;
  address: string;
  apartment?: string;
  postalCode?: string;
  instructions?: string;
  shippingMethod: string;
  paymentMethod: PaymentMethod;
  displayCurrency?: string;
}

export interface CheckoutResult {
  orderId: string;
  orderNumber: string;
  totalUsdCents: number;
  subtotalUsdCents: number;
  shippingUsdCents: number;
}

const DISPLAY_CURRENCIES = ["USD", "COP", "EUR", "GBP", "CAD"];

function parseInput(raw: CheckoutInput): CheckoutInput {
  const email = asEmail(raw.email);
  const firstName = asString(raw.firstName, 100);
  const lastName = asString(raw.lastName, 100);
  const country = asString(raw.country, 100);
  const city = asString(raw.city, 100);
  const address = asString(raw.address, 255);
  if (!email || !firstName || !lastName || !country || !city || !address) {
    throw new Error("Faltan datos de contacto o envío");
  }
  if (!Array.isArray(raw.lines) || raw.lines.length === 0 || raw.lines.length > 50) {
    throw new Error("Carrito inválido");
  }
  const lines: CheckoutLine[] = raw.lines.map((l) => ({
    productId: asString(l.productId, 128),
    variantId: asString(l.variantId, 128),
    quantity: l.quantity,
  }));
  for (const line of lines) {
    if (!line.productId || !line.variantId || !Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > 99) {
      throw new Error("Carrito inválido");
    }
  }
  if (!PAYMENT_METHODS.includes(raw.paymentMethod as PaymentMethod)) {
    throw new Error("Método de pago inválido");
  }
  const currency = DISPLAY_CURRENCIES.includes(String(raw.displayCurrency)) ? String(raw.displayCurrency) : "USD";
  return {
    lines,
    email,
    phone: asString(raw.phone, 30) || undefined,
    firstName,
    lastName,
    country,
    state: asString(raw.state, 100) || undefined,
    city,
    address,
    apartment: asString(raw.apartment, 255) || undefined,
    postalCode: asString(raw.postalCode, 30) || undefined,
    instructions: asString(raw.instructions, 1000) || undefined,
    shippingMethod: asString(raw.shippingMethod, 64),
    paymentMethod: raw.paymentMethod,
    displayCurrency: currency,
  };
}

/** Create a real order: validates + reserves inventory in one transaction,
 * snapshots items, and returns the order. Payment stays PENDING. */
export async function createCheckoutOrder(raw: CheckoutInput): Promise<CheckoutResult> {
  const input = parseInput(raw);
  const shipping = getShippingMethod(input.shippingMethod);
  if (!shipping) throw new Error("Método de envío inválido");

  let subtotal = 0;
  const items: { productId: string; variantId: string; productName: string; variantName: string; sku: string; unitPrice: number; quantity: number; lineTotal: number }[] = [];

  for (const line of input.lines) {
    const found = getVariantById(line.variantId);
    if (!found || found.productId !== line.productId) throw new Error("Variante inválida");
    const variant = found.variant;
    const product = getProductById("en", line.productId);
    const unitPrice = variant.price / 1000; // USD base (seed/1000 per content convention)
    const lineTotal = Math.round(unitPrice * line.quantity * 100) / 100;
    subtotal += lineTotal;
    items.push({
      productId: line.productId,
      variantId: line.variantId,
      productName: product?.name ?? "Product",
      variantName: variant.title.en,
      sku: variant.sku ?? "",
      unitPrice,
      quantity: line.quantity,
      lineTotal,
    });
  }
  if (items.length === 0) throw new Error("Carrito vacío");

  const shippingCost = shipping.priceUsd;
  const total = Math.round((subtotal + shippingCost) * 100) / 100;
  const subtotalCents = toCents(subtotal);
  const shippingCents = toCents(shippingCost);
  const totalCents = toCents(total);
  const displayCurrency = input.displayCurrency ?? "USD";
  const orderNumber = `AREM-${randomUUID().slice(0, 8).toUpperCase()}`;

  // Reserve stock + insert order atomically (SELECT FOR UPDATE prevents oversell).
  const orderId = await withTransaction(async (client) => {
    const orderRows = await client.query<{ id: string }>(
      `insert into public.orders
         (order_number, customer_profile_id, status, payment_status, currency, subtotal, shipping_total, tax_total, total,
          shipping_address, display_currency, usd_total_cents, exchange_rate, converted_total_cents,
          email, phone, first_name, last_name, shipping_method, payment_method, notes)
       values ($1,null,'pending','pending','USD',$2,$3,0,$4,$5,$6,$7,1,$8,$9,$10,$11,$12,$13,$14,$15) returning id`,
      [
        orderNumber, subtotal, shippingCost, total,
        JSON.stringify({ recipient_name: `${input.firstName} ${input.lastName}`, line1: input.address, line2: input.apartment ?? null, city: input.city, state: input.state ?? null, postal_code: input.postalCode ?? null, country: input.country }),
        displayCurrency, totalCents, totalCents,
        input.email, input.phone ?? null, input.firstName, input.lastName,
        shipping.id, input.paymentMethod, input.instructions ?? null,
      ],
    );
    const id = orderRows.rows[0].id;

    for (const it of items) {
      await client.query(
        `insert into public.order_items (order_id, product_id, variant_id, product_name, variant_name, sku, unit_price, quantity, line_total)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [id, it.productId, it.variantId, it.productName, it.variantName, it.sku, it.unitPrice, it.quantity, it.lineTotal],
      );
    }

    for (const it of items) {
      await client.query(
        `insert into public.product_inventory (variant_id, product_id, stock) values ($1,$2,0)
         on conflict (variant_id) do nothing`,
        [it.variantId, it.productId],
      );
      const res = await client.query(
        `update public.product_inventory set stock = stock - $2, updated_at = now()
         where variant_id = $1 and stock >= $2`,
        [it.variantId, it.quantity],
      );
      if (res.rowCount !== 1) throw new Error(`Stock insuficiente para ${it.variantName}`);
    }
    return id;
  });

  // Payment provider call stays OUTSIDE the transaction (external I/O).
  const provider = getPaymentProvider(input.paymentMethod);
  const payment = await provider.createPayment(totalCents, "USD", orderNumber);
  await q("update public.orders set transaction_id = $1 where id = $2", [payment.transactionId, orderId]);

  return { orderId, orderNumber, totalUsdCents: totalCents, subtotalUsdCents: subtotalCents, shippingUsdCents: shippingCents };
}
