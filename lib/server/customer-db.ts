import "server-only";
import { q } from "./db";

// ---------------------------------------------------------------- types ----
export interface CustomerProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  preferred_language: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerAddress {
  id: string;
  customer_profile_id: string;
  recipient_name: string;
  phone: string | null;
  line1: string;
  line2: string | null;
  city: string;
  state: string | null;
  postal_code: string | null;
  country: string;
  is_default_shipping: boolean;
  is_default_billing: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_profile_id: string;
  status: string;
  payment_status: string;
  currency: string;
  subtotal: string;
  shipping_total: string;
  tax_total: string;
  total: string;
  shipping_address: Record<string, unknown> | null;
  billing_address: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  unit_price: string;
  quantity: number;
  line_total: string;
}

export interface Shipment {
  id: string;
  order_id: string;
  status: string;
  carrier: string | null;
  tracking_number: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  created_at: string;
}

export interface TrackingEvent {
  id: string;
  shipment_id: string;
  status: string;
  description: string | null;
  occurred_at: string;
}

// Order lifecycle statuses (no payments yet — status is seeds/placeholders).
export const ORDER_STATUSES = [
  "pending_payment",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = ["pending", "paid", "refunded", "failed"] as const;

// -------------------------------------------------------------- profile ----
export async function getProfile(id: string): Promise<CustomerProfile | null> {
  const rows = await q<CustomerProfile>("select * from public.customer_profiles where id = $1", [id]);
  return rows[0] ?? null;
}

export async function updateProfile(
  id: string,
  fields: { first_name?: string | null; last_name?: string | null; phone?: string | null; preferred_language?: string },
): Promise<CustomerProfile | null> {
  const rows = await q<CustomerProfile>(
    `update public.customer_profiles
       set first_name = $2, last_name = $3, phone = $4, preferred_language = $5, updated_at = now()
       where id = $1 returning *`,
    [
      id,
      fields.first_name ?? null,
      fields.last_name ?? null,
      fields.phone ?? null,
      fields.preferred_language ?? "en",
    ],
  );
  return rows[0] ?? null;
}

// ------------------------------------------------------------ addresses ----
export async function listAddresses(profileId: string): Promise<CustomerAddress[]> {
  return q<CustomerAddress>("select * from public.customer_addresses where customer_profile_id = $1 order by created_at", [profileId]);
}

export async function getAddress(profileId: string, addressId: string): Promise<CustomerAddress | null> {
  const rows = await q<CustomerAddress>(
    "select * from public.customer_addresses where customer_profile_id = $1 and id = $2",
    [profileId, addressId],
  );
  return rows[0] ?? null;
}

export async function createAddress(
  profileId: string,
  a: Omit<CustomerAddress, "id" | "customer_profile_id" | "created_at" | "updated_at">,
): Promise<CustomerAddress> {
  const rows = await q<CustomerAddress>(
    `insert into public.customer_addresses
       (customer_profile_id, recipient_name, phone, line1, line2, city, state, postal_code, country,
        is_default_shipping, is_default_billing)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) returning *`,
    [
      profileId,
      a.recipient_name,
      a.phone,
      a.line1,
      a.line2,
      a.city,
      a.state,
      a.postal_code,
      a.country,
      a.is_default_shipping ?? false,
      a.is_default_billing ?? false,
    ],
  );
  await enforceDefault(profileId, rows[0].id, a.is_default_shipping ?? false, a.is_default_billing ?? false);
  return rows[0];
}

export async function updateAddress(
  profileId: string,
  addressId: string,
  a: Partial<CustomerAddress>,
): Promise<CustomerAddress | null> {
  const rows = await q<CustomerAddress>(
    `update public.customer_addresses
       set recipient_name = $3, phone = $4, line1 = $5, line2 = $6, city = $7, state = $8,
           postal_code = $9, country = $10, is_default_shipping = $11, is_default_billing = $12,
           updated_at = now()
       where customer_profile_id = $1 and id = $2 returning *`,
    [
      profileId,
      addressId,
      a.recipient_name ?? "",
      a.phone ?? null,
      a.line1 ?? "",
      a.line2 ?? null,
      a.city ?? "",
      a.state ?? null,
      a.postal_code ?? null,
      a.country ?? "CO",
      a.is_default_shipping ?? false,
      a.is_default_billing ?? false,
    ],
  );
  if (rows[0]) await enforceDefault(profileId, rows[0].id, a.is_default_shipping ?? false, a.is_default_billing ?? false);
  return rows[0] ?? null;
}

export async function deleteAddress(profileId: string, addressId: string): Promise<void> {
  await q("delete from public.customer_addresses where customer_profile_id = $1 and id = $2", [profileId, addressId]);
}

/** When a default-flag is set on one address, clear it elsewhere for that profile. */
async function enforceDefault(profileId: string, addressId: string, shipping: boolean, billing: boolean): Promise<void> {
  if (shipping) {
    await q("update public.customer_addresses set is_default_shipping = false where customer_profile_id = $1 and id <> $2", [
      profileId,
      addressId,
    ]);
  }
  if (billing) {
    await q("update public.customer_addresses set is_default_billing = false where customer_profile_id = $1 and id <> $2", [
      profileId,
      addressId,
    ]);
  }
}

// -------------------------------------------------------------- wishlist ----
async function ensureWishlist(profileId: string): Promise<string> {
  const existing = await q<{ id: string }>("select id from public.wishlists where customer_profile_id = $1", [profileId]);
  if (existing[0]) return existing[0].id;
  const rows = await q<{ id: string }>(
    "insert into public.wishlists (customer_profile_id) values ($1) returning id",
    [profileId],
  );
  return rows[0].id;
}

export async function getWishlistIds(profileId: string): Promise<string[]> {
  const wishlistId = await ensureWishlist(profileId);
  const rows = await q<{ product_id: string }>(
    "select product_id from public.wishlist_items where wishlist_id = $1 order by created_at",
    [wishlistId],
  );
  return rows.map((r) => r.product_id);
}

export async function addWishlist(profileId: string, productId: string): Promise<void> {
  const wishlistId = await ensureWishlist(profileId);
  await q(
    "insert into public.wishlist_items (wishlist_id, product_id) values ($1,$2) on conflict (wishlist_id, product_id) do nothing",
    [wishlistId, productId],
  );
}

export async function removeWishlist(profileId: string, productId: string): Promise<void> {
  const wishlistId = await ensureWishlist(profileId);
  await q("delete from public.wishlist_items where wishlist_id = $1 and product_id = $2", [wishlistId, productId]);
}

export async function clearWishlist(profileId: string): Promise<void> {
  const wishlistId = await ensureWishlist(profileId);
  await q("delete from public.wishlist_items where wishlist_id = $1", [wishlistId]);
}

/** Merge guest (localStorage) ids into the account wishlist; returns the merged ids. */
export async function mergeWishlist(profileId: string, productIds: string[]): Promise<string[]> {
  for (const id of productIds) await addWishlist(profileId, id);
  return getWishlistIds(profileId);
}

// ---------------------------------------------------------------- orders ----
export async function listOrders(profileId: string): Promise<Order[]> {
  return q<Order>("select * from public.orders where customer_profile_id = $1 order by created_at desc", [profileId]);
}

export async function getOrder(profileId: string, orderId: string): Promise<{ order: Order; items: OrderItem[]; shipments: Shipment[]; tracking: TrackingEvent[] } | null> {
  const rows = await q<Order>("select * from public.orders where customer_profile_id = $1 and id = $2", [profileId, orderId]);
  if (!rows[0]) return null;
  const order = rows[0];
  const items = await q<OrderItem>("select * from public.order_items where order_id = $1 order by created_at", [order.id]);
  const shipments = await q<Shipment>("select * from public.shipments where order_id = $1 order by created_at", [order.id]);
  const tracking: TrackingEvent[] = [];
  for (const s of shipments) {
    const ev = await q<TrackingEvent>("select * from public.tracking_events where shipment_id = $1 order by occurred_at", [s.id]);
    tracking.push(...ev);
  }
  return { order, items, shipments, tracking };
}
