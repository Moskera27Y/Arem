import "server-only";
import { q } from "./db";
import { getProductById, getVariantById } from "@/lib/content";
import { toCents } from "@/lib/money";
import { decrementStock, getStock } from "./inventory";
import { getShippingMethod } from "./shipping";
import { getPaymentProvider, type PaymentMethod } from "./payments/provider";

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

/** Create a real order: validates + decrements inventory server-side, stores
 * snapshots, and returns the order. Payment status stays PENDING (manual/
 * provider flow). Never trusts the frontend. */
export async function createCheckoutOrder(input: CheckoutInput): Promise<CheckoutResult> {
  if (!input.email || !input.firstName || !input.lastName || !input.country || !input.city || !input.address) {
    throw new Error("Faltan datos de contacto o envío");
  }
  const shipping = getShippingMethod(input.shippingMethod);
  if (!shipping) throw new Error("Método de envío inválido");

  let subtotal = 0;
  const items: { productId: string; variantId: string; productName: string; variantName: string; sku: string; unitPrice: number; quantity: number; lineTotal: number }[] = [];

  for (const line of input.lines) {
    if (!line.variantId || !Number.isInteger(line.quantity) || line.quantity <= 0) throw new Error("Carrito inválido");
    const found = getVariantById(line.variantId);
    if (!found || found.productId !== line.productId) throw new Error("Variante inválida");
    const variant = found.variant;
    const product = getProductById("en", line.productId);
    const stock = await getStock(line.variantId);
    if (stock.stock < line.quantity) throw new Error(`Stock insuficiente para ${variant.title.en}`);
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
  const orderNumber = `AREM-${Date.now().toString().slice(-8)}`;

  const orderRows = await q<{ id: string }>(
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
  const orderId = orderRows[0].id;

  for (const it of items) {
    await q(
      `insert into public.order_items (order_id, product_id, variant_id, product_name, variant_name, sku, unit_price, quantity, line_total)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [orderId, it.productId, it.variantId, it.productName, it.variantName, it.sku, it.unitPrice, it.quantity, it.lineTotal],
    );
  }

  // Decrement inventory only after the order row is safely created.
  for (const it of items) {
    await decrementStock(it.variantId, it.quantity);
  }

  // Payment provider (abstraction) — records the reference; stays pending.
  const provider = getPaymentProvider(input.paymentMethod);
  const payment = await provider.createPayment(totalCents, "USD", orderNumber);
  await q("update public.orders set transaction_id = $1 where id = $2", [payment.transactionId, orderId]);

  return { orderId, orderNumber, totalUsdCents: totalCents, subtotalUsdCents: subtotalCents, shippingUsdCents: shippingCents };
}
