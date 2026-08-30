import "server-only";
import { q } from "./db";
import { getVariantById } from "@/lib/content";

/** Lazy-seed a variant's inventory from the content model (first touch). */
async function ensureInventory(variantId: string): Promise<number> {
  const rows = await q<{ stock: number }>("select stock from public.product_inventory where variant_id = $1", [variantId]);
  if (rows[0]) return rows[0].stock;
  const found = getVariantById(variantId);
  if (!found) return 0;
  const stock = Math.max(0, Number(found.variant.inventory ?? 0));
  await q(
    `insert into public.product_inventory (variant_id, product_id, stock, reserved) values ($1,$2,$3,0)
     on conflict (variant_id) do nothing`,
    [variantId, found.productId, stock],
  );
  return stock;
}

export async function getStock(variantId: string): Promise<{ stock: number; reserved: number }> {
  await ensureInventory(variantId);
  const rows = await q<{ stock: number; reserved: number }>(
    "select stock, reserved from public.product_inventory where variant_id = $1",
    [variantId],
  );
  return rows[0] ?? { stock: 0, reserved: 0 };
}

/** Atomically decrement stock; throws if insufficient (no overselling). */
export async function decrementStock(variantId: string, quantity: number): Promise<void> {
  await ensureInventory(variantId);
  const rows = await q<{ stock: number }>(
    `update public.product_inventory
       set stock = stock - $2, updated_at = now()
     where variant_id = $1 and stock >= $2
     returning stock`,
    [variantId, quantity],
  );
  if (rows.length === 0) throw new Error(`Stock insuficiente para la variante ${variantId}`);
}
