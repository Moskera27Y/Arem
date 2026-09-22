// Phase 2 — catalog seed: migrates lib/content seeds → PostgreSQL.
// Idempotent: INSERT ... ON CONFLICT DO UPDATE.
// Run: node --env-file=.env.local --import tsx scripts/seed-catalog.mjs
//
// Requires: tsx (available via npx). Uses tsx loader to import TS content seeds.
import pg from "pg";

async function main() {
  const db = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await db.connect();

    // Load seeds via tsx (dynamic import of TS files)
    const content = await import("../lib/content/index.ts");

    // productSeeds and categorySeeds are direct exports
    const productSeeds = content.productSeeds || [];
    const categorySeeds = content.categorySeeds || [];

    // Collections: getCollections returns resolved Collection[] (we need raw data)
    // lib/content/collections.ts has a private 'seed' — getCollections(locale) returns resolved
    const colEn = typeof content.getCollections === "function" ? content.getCollections("en") : [];
    const colEs = typeof content.getCollections === "function" ? content.getCollections("es") : [];

    // Reconstruct collection seed data from resolved collections
    // We need id, slug, and bilingual fields. Since collections.ts exports
    // a private 'seed' array, we reconstruct from the resolved form.
    // Note: collectionSeeds are already seeded by cms-schema.mjs if run first.
    // This script focuses on products/variants/categories/inventory/images.
    const collectionIds = colEn.map((c) => c.id);

    console.log(`\n📦 Loaded seeds from lib/content:`);
    console.log(`   Products:   ${productSeeds.length}`);
    console.log(`   Categories: ${categorySeeds.length}`);
    console.log(`   Collections: ${colEn.length} (already in DB via cms-schema, skipping)`);

    const totalVariants = productSeeds.reduce((s, p) => s + p.variants.length, 0);
    const totalImages = productSeeds.reduce((s, p) => s + p.images.length, 0);
    console.log(`   Variants:   ${totalVariants}`);
    console.log(`   Product images: ${totalImages}`);

    // ─────────────────────────────────────────────────────────
    // ⚠️  STOCK VALUES — VERIFY BEFORE PRODUCTION
    // The inventory figures below come DIRECTLY from lib/content/products.ts
    // variant.inventory fields. They represent INITIAL placeholder quantities
    // for the first batch of artisan pieces. Confirm against physical stock
    // before running against production Neon.
    // ─────────────────────────────────────────────────────────
    console.log(`\n📊 Stock from seeds (requires confirmation before prod):`);
    for (const p of productSeeds) {
      for (const v of p.variants) {
        console.log(`   ${v.id} (${v.title.en}): inventory=${v.inventory}`);
      }
    }

    await db.query("BEGIN");

    // 1. Products
    for (const p of productSeeds) {
      await db.query(
        `INSERT INTO public.products
           (id, slug, name_en, name_es, tagline_en, tagline_es,
            description_en, description_es, story_en, story_es,
            details_en, details_es, price_cents, compare_at_price_cents,
            options_en, options_es, featured, badge_en, badge_es, status, created_at)
         VALUES
           ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)
         ON CONFLICT (id) DO UPDATE SET
           slug = EXCLUDED.slug,
           name_en = EXCLUDED.name_en,
           name_es = EXCLUDED.name_es,
           tagline_en = EXCLUDED.tagline_en,
           tagline_es = EXCLUDED.tagline_es,
           description_en = EXCLUDED.description_en,
           description_es = EXCLUDED.description_es,
           story_en = EXCLUDED.story_en,
           story_es = EXCLUDED.story_es,
           details_en = EXCLUDED.details_en,
           details_es = EXCLUDED.details_es,
           price_cents = EXCLUDED.price_cents,
           compare_at_price_cents = EXCLUDED.compare_at_price_cents,
           options_en = EXCLUDED.options_en,
           options_es = EXCLUDED.options_es,
           featured = EXCLUDED.featured,
           badge_en = EXCLUDED.badge_en,
           badge_es = EXCLUDED.badge_es,
           status = EXCLUDED.status,
           created_at = EXCLUDED.created_at,
           updated_at = now()`,
        [
          p.id, p.slug,
          p.name.en, p.name.es,
          p.tagline?.en ?? null, p.tagline?.es ?? null,
          p.description.en, p.description.es,
          JSON.stringify(p.story.map((s) => ({ en: s.en, es: s.es }))),
          JSON.stringify(p.story.map((s) => ({ en: s.en, es: s.es }))),
          JSON.stringify(p.details.map((d) => ({ en: d.en, es: d.es }))),
          JSON.stringify(p.details.map((d) => ({ en: d.en, es: d.es }))),
          p.price.amount,
          p.compareAtPrice ? p.compareAtPrice.amount : null,
          JSON.stringify(p.options),
          JSON.stringify(p.options),
          p.featured ?? false,
          p.badge ? p.badge.en : null,
          p.badge ? p.badge.es : null,
          p.status,
          p.createdAt,
        ],
      );
    }

    // 2. Variants
    for (const p of productSeeds) {
      for (const v of p.variants) {
        await db.query(
          `INSERT INTO public.product_variants
             (id, product_id, sku, title_en, title_es, option_values,
              price_cents, compare_at_cents, image_url, sort_order)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
           ON CONFLICT (id) DO UPDATE SET
             product_id = EXCLUDED.product_id,
             sku = EXCLUDED.sku,
             title_en = EXCLUDED.title_en,
             title_es = EXCLUDED.title_es,
             option_values = EXCLUDED.option_values,
             price_cents = EXCLUDED.price_cents,
             compare_at_cents = EXCLUDED.compare_at_cents,
             image_url = EXCLUDED.image_url,
             sort_order = EXCLUDED.sort_order`,
          [
            v.id,
            p.id,
            v.sku,
            v.title.en,
            v.title.es,
            JSON.stringify(v.values),
            v.price,
            v.compareAt ?? null,
            v.imageSrc ?? null,
            0,
          ],
        );
      }
    }

    // 3. Inventory — upsert from seed
    // On first run (empty table) → inserts seed stock.
    // If rows already exist (e.g., from real orders) → DO NOT overwrite
    // stock; only fill product_id if missing.
    // ⚠️ Stock values come DIRECTLY from lib/content/products.ts variant.inventory.
    // VERIFY against physical inventory before production.
    for (const p of productSeeds) {
      for (const v of p.variants) {
        await db.query(
          `INSERT INTO public.product_inventory (variant_id, product_id, stock, reserved)
           VALUES ($1, $2, $3, 0)
           ON CONFLICT (variant_id) DO UPDATE
             SET product_id = EXCLUDED.product_id,
                 updated_at = now()
             -- note: stock is NOT updated here to preserve real inventory.
             -- To force-reset stock to seed values, manually UPDATE after.`,
          [v.id, p.id, Math.max(0, v.inventory)],
        );
      }
    }

    // 4. Product Images (relación con media.key)
    // First, ensure the seed image keys exist in public.media table.
    // If not, we insert them as media entries (non-destructive, idempotent).
    for (const p of productSeeds) {
      for (let i = 0; i < p.images.length; i++) {
        const img = p.images[i];
        const key = img.src;
        // Upsert into media table (idempotent)
        await db.query(
          `INSERT INTO public.media (key, url, type, alt_en, alt_es, sort_order, usage)
           VALUES ($1, $2, 'product', $3, $4, $5, 'product')
           ON CONFLICT (key) DO UPDATE SET
             url = EXCLUDED.url,
             alt_en = EXCLUDED.alt_en,
             alt_es = EXCLUDED.alt_es,
             type = EXCLUDED.type,
             sort_order = EXCLUDED.sort_order`,
          [key, key, img.alt.en, img.alt.es, i],
        );

        // Link product ↔ media via product_images
        await db.query(
          `INSERT INTO public.product_images
             (product_id, media_key, sort_order, is_primary)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (product_id, media_key) DO UPDATE SET
             sort_order = EXCLUDED.sort_order,
             is_primary = EXCLUDED.is_primary`,
          [p.id, key, i, i === 0],
        );
      }
    }

    // 5. Categories
    for (const c of categorySeeds) {
      await db.query(
        `INSERT INTO public.categories
           (id, slug, name_en, name_es, short_name_en, short_name_es,
            description_en, description_es, image_src, image_alt_en, image_alt_es,
            featured, enabled, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
         ON CONFLICT (id) DO UPDATE SET
           name_en = EXCLUDED.name_en,
           name_es = EXCLUDED.name_es,
           short_name_en = EXCLUDED.short_name_en,
           short_name_es = EXCLUDED.short_name_es,
           description_en = EXCLUDED.description_en,
           description_es = EXCLUDED.description_es,
           image_src = EXCLUDED.image_src,
           image_alt_en = EXCLUDED.image_alt_en,
           image_alt_es = EXCLUDED.image_alt_es,
           featured = EXCLUDED.featured,
           enabled = EXCLUDED.enabled,
           sort_order = EXCLUDED.sort_order,
           slug = EXCLUDED.slug`,
        [
          c.id,
          c.slug,
          c.name.en,
          c.name.es,
          c.shortName?.en ?? null,
          c.shortName?.es ?? null,
          c.description.en,
          c.description.es,
          c.image.src,
          c.image.alt.en,
          c.image.alt.es,
          c.featured ?? false,
          c.enabled ?? true,
          c.order,
        ],
      );
    }

    // 6. product_categories (pivot)
    for (const p of productSeeds) {
      for (const cid of p.categoryIds) {
        await db.query(
          `INSERT INTO public.product_categories (product_id, category_id)
           VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [p.id, cid],
        );
      }
    }

    // 7. Promotions — no seed data exists in content. Table is empty.
    //    Promotion rows will be created later via admin panel once APIs exist.
    const existingPromos = await db.query("select count(*)::int as n from public.promotions");
    console.log(`\n📋 Existing promotions in DB: ${existingPromos.rows[0].n} (no seeds — create via admin panel)`);

    await db.query("COMMIT");
    console.log("\n✅ Seed transaction committed successfully.");

    // Verificación final
    const counts = await db.query(`
      select 'products' as t, count(*) as n from public.products
      union all select 'product_variants', count(*) from public.product_variants
      union all select 'product_images', count(*) from public.product_images
      union all select 'categories', count(*) from public.categories
      union all select 'product_categories', count(*) from public.product_categories
      union all select 'product_inventory', count(*) from public.product_inventory
      union all select 'media (upserted)', count(*) from public.media
      union all select 'promotions', count(*) from public.promotions
    `);
    console.table(counts.rows);

    const sampleVariants = await db.query(`
      select v.id, v.sku, v.price_cents, i.stock as current_stock
      from public.product_variants v
      left join public.product_inventory i on i.variant_id = v.id
      limit 5
    `);
    console.log("\n📋 Sample variants with inventory:");
    console.table(sampleVariants.rows);

    const sampleProducts = await db.query(`
      select id, slug, name_en, price_cents, status from public.products limit 5
    `);
    console.log("\n📋 Sample products:");
    console.table(sampleProducts.rows);

    const sampleCategories = await db.query(`
      select id, slug, name_en from public.categories
    `);
    console.log("\n📋 Categories:");
    console.table(sampleCategories.rows);

  } catch (e) {
    await db.query("ROLLBACK");
    console.error("❌ Seed transaction rolled back:", e.message);
    throw e;
  } finally {
    await db.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
