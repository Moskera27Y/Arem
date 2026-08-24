"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProductById } from "@/lib/content";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { useLocale } from "@/lib/i18n/locale-context";
import { useWishlist } from "@/lib/store/wishlist-context";
import { ProductCard } from "@/components/cards/ProductCard";
import { Icon } from "@/components/ui/icons";

export function WishlistContent() {
  const locale = useLocale();
  const dict = getDictionary(locale);
  const localePrefix = `/${locale}`;
  const { ids, clear } = useWishlist();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const products = mounted
    ? ids.map((id) => getProductById(locale, id)).filter((p): p is NonNullable<typeof p> => Boolean(p))
    : [];

  return (
    <section className="section">
      <div className="container">
        {!mounted ? null : products.length === 0 ? (
          <div className="cart-empty" style={{ padding: "4rem 0" }}>
            <span className="cart-empty__icon">
              <Icon name="heart" size={26} />
            </span>
            <p>{dict.wishlist.empty}</p>
            <Link href={`${localePrefix}/shop`} className="btn btn--primary">
              {dict.nav.shop}
            </Link>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
              <p className="muted">{dict.wishlist.saved(products.length)}</p>
              <button type="button" className="cart-line__remove" onClick={clear}>
                {dict.wishlist.clear}
              </button>
            </div>
            <div className="grid grid--4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
