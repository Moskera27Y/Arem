# AREM WORLD — Phase 5 (Media management + premium motion)

Premium e-commerce storefront for Colombian craftsmanship + an editorial
Admin panel. **Next.js 15 (App Router) + TypeScript**, zero UI dependencies.

## Storefront design

Warm Colombian concept-store aesthetic (inspired by, not copied from, the
reference): ivory/cream backgrounds, black editorial serif typography,
controlled warm-gold + terracotta accents, large photography, circular
category crops, dark photo-scrim story cards, and a dark newsletter + footer.
No gradients except photo scrims, no glassmorphism, no neon.

**Homepage order:** announcement bar → navigation → full-width photographic
hero → shop by category (circular row) → stories that inspire → new / featured
products (carousel) → why shop at AREM WORLD (trust) → Instagram →
dark newsletter → footer. All copy bilingual via the existing i18n system;
all sections driven by the centralized data store.

## Quick start

```bash
npm install
npm run dev            # storefront http://localhost:3000
npm run build          # production build
npm run start          # serve the production build
# Admin panel: http://localhost:3000/admin  (opens /en storefront from there)
```

## Languages & routing

- **English** default (`/en`), **Spanish** secondary (`/es`); header **EN | ES**
  selector (desktop + mobile menu) with cookie persistence and query
  preservation.
- **Admin** lives at `/admin` (not locale-prefixed, excluded from the
  middleware redirects, no links in the public header/footer).

## Routes

Storefront (per locale `/en`, `/es`): `/`, `/shop`, `/products/[slug]`,
`/collections`, `/collections/[slug]`, `/about`, `/stories`,
`/stories/[slug]`, `/regions`, `/regions/[slug]`, `/contact`, `/cart`,
`/wishlist`, `/_not-found`.

Admin: `/admin` (overview), `/admin/products`,
`/admin/products/new`, `/admin/products/[id]`, `/admin/categories`,
`/admin/promotions`, `/admin/social-links`, `/admin/media` (Media library).

## Architecture (admin-first, no database)

```
lib/
  i18n/                # config, EN/ES dictionary, locale context
  admin/
    types.ts           # AdminProduct/Category (bilingual seeds), Promotion, SocialLink
    seed.ts            # initial admin state seeded from the storefront content
    promotions.ts      # pure helpers: status, applicability, discounts, announcements
    store.tsx          # centralized client store (localStorage persistence)
    storefront-hooks.ts# merge hooks: storefront reads the same data source
  content/             # bilingual content seeds { en, es } + locale resolvers
  store/               # cart / wishlist (client state)
app/
  [locale]/…           # storefront routes (one set, both languages)
  admin/…              # admin routes (client components + admin.css)
components/
  admin/               # shell, product form, category/promotion/social managers, ui
  …                    # storefront components
middleware.ts          # locale routing + /admin exception
scripts/               # placeholder art + test suite (see below)
```

**How it works:** the storefront content modules expose bilingual *seeds*
(`{ en, es }`) plus resolvers. The Admin panel edits those same seeds through
`lib/admin/store.tsx` (persisted to localStorage, so changes survive refresh).
Storefront client surfaces (product cards, shop grid, product page, category
cards, announcement bar, footer socials, cart shipping note) merge the Admin
store at runtime via `lib/admin/storefront-hooks.ts`, so **Admin changes are
reflected on the storefront immediately** — no reload required. SSR renders
the static content first (no hydration mismatch), then applies Admin data.
A future database-backed Admin replaces the store implementation; pages,
components and types stay identical.

**Admin capabilities**
- **Products** — table (thumbnail, name, category, region/artisan, price,
  promotion status, inventory, status), search, category + status filters,
  empty states, delete with confirmation; complete create/edit form with
  bilingual name/tagline/description/story, category, collection, region,
  artisan, price, sale price, SKU, inventory, status, featured toggle,
  multiple image slots with placeholders, colors & sizes (expanded into
  variants), inline validation.
- **Categories** — create/edit/delete with confirmation, bilingual
  name/short-name/description, image, display order, enable/disable; updates
  storefront filters and category cards.
- **Promotions** — percentage / fixed / free-shipping / announcement, value,
  start/end dates, active toggle, applicable products + categories, bilingual
  public announcement text; live status chips (Active/Scheduled/Expired/
  Inactive). Active promotions automatically show discounted pricing + badges
  on product cards/PDPs, announcements in the announcement bar, free shipping
  in the cart summary.
- **Social links** — Instagram, TikTok, Pinterest, Facebook, WhatsApp, Email;
  label, URL/contact, active, display order (reorder arrows); updates the
  storefront footer immediately.
- **Overview** — total/published/draft products, categories, active
  promotions; recent products; quick actions; open-storefront link.
- Bilingual admin content entry (all customer-facing fields EN + ES), admin
  labels in English; warm editorial back-office design (no gradients/glass).

## Media library

`/admin/media` manages every public-facing image (hero, categories, products
+ galleries, stories, regions, Instagram tiles, footer/newsletter background)
with a grid + large previews, search, type filters, an edit modal (URL /
placeholder / local-file **preview-only**), bilingual alt text, preview-before-
save, replace/remove confirmation and validation. Media URLs + metadata persist
in the local prototype data layer; the architecture is ready for Supabase
Storage / another image host. Storefront surfaces read the same source via
`ManagedImage`, so edits reflect immediately and survive refresh. (Local file
uploads are per-session previews only — never persisted.)

## Product gallery

Multiple images per product with thumbnail previews, previous/next controls,
keyboard arrow support, touch swipe on mobile, a subtle crossfade, a counter,
accessible labels, a clear selected-thumbnail state and a fixed aspect ratio
(no layout shift). Gallery images are media-managed.

## Motion

Elegant, restrained motion: soft fade-up reveals as sections enter, subtle
image zoom on hover, gentle card/button lift, smooth nav underline + mobile
menu transition, hero entrance stagger, smooth snap-scrolling category and
product rows (with mouse drag-to-scroll), and smooth product-image crossfade.
`prefers-reduced-motion` is honoured fully (animations and hover transforms are
disabled).

## Verification

```bash
npm run typecheck              # tsc --noEmit
npm run build                  # production build
node scripts/smoke.mjs         # 27 bilingual storefront routes + console errors
node scripts/switcher-test.mjs # EN<->ES routing, persistence, mobile
node scripts/cart-test.mjs     # add-to-cart / variants / drawer
node scripts/responsive.mjs    # storefront 360–1280 px
node scripts/redesign-check.mjs# Phase 4 homepage structure + links + overflow
node scripts/phase5-test.mjs   # media replacement + product gallery E2E
node scripts/admin-test.mjs    # full admin + storefront-reflection E2E
```

The test suite launches headless Chrome with a random debugging port and a
unique profile per run (kills the real process tree on Windows), so runs are
fully isolated.

## Out of scope (Phase 4+)

Database (Prisma/Supabase), real authentication, checkout, Stripe/PayPal,
orders, shipping/tracking, real photography, newsletter/contact backends.
